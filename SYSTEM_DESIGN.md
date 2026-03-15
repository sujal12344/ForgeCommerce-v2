# ForgeCommerce v2 — System Design & Architecture

*From Prototype to Production-Scale E-Commerce Platform*

---

## 📊 Current State Analysis

### ✅ What Works Well
- Monolithic Next.js app (fast to prototype)
- Single PostgreSQL database (Neon)
- Clerk for auth (managed)
- Stripe webhook integration
- Multi-store isolation via `storeId`
- Vercel deployment (simple)

### ⚠️ Bottlenecks at Scale (>100K stores)
- **Single database**: All writes go to one DB → connection limits hit
- **Monolithic codebase**: Admin dashboard + API in one app → harder to scale independently
- **No caching layer**: Every product query hits DB
- **Synchronous image processing**: Cloudinary handles it, but no async fallback
- **No queue system**: Webhooks processed inline → payment failures if DB is slow
- **No CDN**: Static assets served from single region
- **No structured logging**: console.log won't work at scale
- **No rate limiting**: APIs vulnerable to abuse/DoS
- **Single payment pipeline**: No fanout for order processing

---

## 🏗️ Proposed High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER (Cloudflare)                 │
│  - Rate limiting, DDoS protection, WAF                          │
│  - Static asset caching, compression                            │
│  - Request routing, geo-location                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────▼─────────┐  ┌───▼─────────┐  ┌──▼──────────────┐
│  Admin Dashboard │  │ Public Store │  │  API Gateway    │
│  (Next.js App)   │  │  (CDN)       │  │  (Kong/Nginx)   │
│  - Auth          │  │              │  │  - Rate limit   │
│  - Admin routes  │  │  - Product   │  │  - Validation   │
│  - Analytics     │  │    listings  │  │  - Auth         │
└────────┬─────────┘  └───┬──────────┘  └──┬──────────────┘
         │                │                 │
         └────────────────┼─────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼─────────┐ ┌───▼──────┐ ┌──────▼──────┐
    │ Microservices│ │ Cache    │ │  Message    │
    │              │ │ Layer    │ │  Queue      │
    ├──────────────┤ ├──────────┤ ├─────────────┤
    │ Auth Service │ │ Redis    │ │ Bull/RMQ    │
    │ Product Svc  │ │ (Cache)  │ │ or AWS SQS  │
    │ Order Svc    │ │          │ │             │
    │ Payment Svc  │ │ - Session│ │ - Send Email│
    │ Search Svc   │ │ - Product│ │ - Image     │
    │ Analytics Svc│ │   cache  │ │   process   │
    └──────┬───────┘ └──┬──────┘ │ - Analytics │
           │            │        └─────────────┘
           │            │
         ┌─┴────────────┴┐
         │   DATABASE    │
         │   CLUSTER     │
         ├───────────────┤
         │  Primary DB   │ (Neon - Read/Write)
         │  - Main data  │
         ├───────────────┤
         │ Read Replicas │ (Optional for heavy reads)
         │  - Analytics  │
         │  - Reports    │
         ├───────────────┤
         │ Time-series DB│ (InfluxDB/TimescaleDB)
         │  - Metrics    │
         │  - Events     │
         └───────────────┘
         │
    ┌────┴─────────────────────┐
    │   EXTERNAL SERVICES       │
    ├───────────────────────────┤
    │ Stripe (Payments)         │
    │ Cloudinary (Images)       │
    │ SendGrid (Email)          │
    │ Clerk (Auth)              │
    │ Datadog/NewRelic (Monitor)│
    │ Sentry (Error tracking)   │
    └───────────────────────────┘
```

---

## 🎯 Phase-by-Phase Implementation

### **PHASE 1: Foundation (Months 1-2)**
*Get to first 1,000 stores reliably*

#### 1.1 Database Optimization
- **Add missing indexes**
  ```sql
  -- Query optimization
  CREATE INDEX idx_product_store_archived 
    ON products(store_id, archived) 
    INCLUDE (name, price);
  
  CREATE INDEX idx_order_store_paid_date 
    ON orders(store_id, is_paid, created_at DESC);
  
  CREATE INDEX idx_product_featured 
    ON products(featured, created_at DESC) 
    WHERE archived = false;
  ```

- **Enable connection pooling** (PgBouncer)
  - Reuse connections, reduce overhead
  - Neon has built-in pooling → enable it

- **Implement query caching**
  - Cache hot queries (2-5 min TTL)
  - Categories, colors, sizes rarely change

#### 1.2 Add Caching Layer (Redis)
```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cache = {
  async getOrFetch<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl = 300
  ) {
    const cached = await redis.get(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        logger.error({ key, error }, 'Cache parse error, deleting bad entry');
        await redis.del(key);
        // Fall through to fetch fresh data
      }
    }
    
    const data = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(data));
    return data;
  }
};

// Usage in API routes
const categories = await cache.getOrFetch(
  `store:${storeId}:categories`,
  () => prisma.category.findMany({ where: { storeId } }),
  600 // 10 min TTL for read-only data
);
```

#### 1.3 Request Validation & Rate Limiting
```typescript
// middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 req/hour
});

export async function middleware(request: NextRequest) {
  // Use authenticated user ID if available, otherwise use validated client IP
  let identifier = 'anonymous';
  
  const user = await auth(request);
  if (user?.userId) {
    identifier = user.userId; // Authenticated users get per-user limits
  } else {
    // For anonymous requests, extract leftmost IP from X-Forwarded-For
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : request.ip;
    identifier = clientIp || `anonymous_${crypto.getRandomValues(new Uint8Array(8)).join('')}`;
  }
  
  const { success } = await ratelimit.limit(identifier);
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
}
```

#### 1.4 Error Handling & Logging
```typescript
// lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-http-send',
    options: {
      url: process.env.LOG_ENDPOINT, // Send to Datadog/LogRocket
      headers: { 'DD-API-KEY': process.env.DATADOG_API_KEY }
    }
  }
});

// Sanitize error before logging to prevent PII leakage
function sanitizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined,
      // Exclude stack, headers, URLs with credentials, etc.
    };
  }
  return { message: 'Unknown error' };
}

// In API routes
try {
  await processOrder(orderId);
} catch (error) {
  const sanitized = sanitizeError(error);
  logger.error({ ...sanitized, orderId, timestamp: new Date() }, 'Order processing failed');
  Sentry.captureException(error);
  return NextResponse.json({ error: 'Internal error' }, { status: 500 });
}
```

---

### **PHASE 2: Async Processing (Months 2-3)**
*Handle order spikes without dropping webhooks*

#### 2.1 Add Message Queue (Bull with Redis)
```typescript
// lib/queues.ts
import Bull from 'bull';

export const emailQueue = new Bull('emails', process.env.REDIS_URL);
export const imageQueue = new Bull('images', process.env.REDIS_URL);
export const analyticsQueue = new Bull('analytics', process.env.REDIS_URL);

// Process webhooks asynchronously
export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature');
  
  // Validate signature first
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const sanitized = sanitizeError(error);
    logger.error({ ...sanitized }, 'Stripe signature validation failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // Queue the heavy processing
  const orderId = event.data.object.metadata?.orderId;
  if (!orderId) {
    logger.warn({ eventType: event.type }, 'No orderId in webhook metadata');
    return NextResponse.json({ success: true }); // Still return 200 to Stripe
  }
  
  await emailQueue.add({ orderId }, {
    delay: 0,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
  
  // Immediately return 200 to Stripe
  return NextResponse.json({ success: true });
}

// Worker process
emailQueue.process(async (job) => {
  const { orderId } = job.data;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  // Send email, update DB, etc
  await sendOrderConfirmationEmail(order);
});
```

#### 2.2 Image Processing Pipeline
```typescript
// lib/queues.ts - continue
imageQueue.process(async (job) => {
  const { imageUrl, productId } = job.data;
  
  try {
    // Resize, optimize, cache
    const optimized = await cloudinary.v2.uploader.upload(imageUrl, {
      width: 500,
      height: 500,
      quality: 'auto',
      fetch_format: 'auto'
    });
    
    return optimized;
  } catch (error) {
    const sanitized = sanitizeError(error);
    logger.error({ ...sanitized, jobId: job.id, productId, imageUrl }, 'Image upload failed');
    // Rethrow so Bull applies retry logic
    throw error;
  }
});
```

#### 2.3 Dead Letter Queue (DLQ) for Failures
```typescript
emailQueue.on('failed', async (job, err) => {
  logger.error({ job: job.data, error: err }, 'Email job failed');
  
  // Move to DLQ for manual inspection
  await deadLetterQueue.add(job.data, {
    reason: err.message
  });
});
```

---

### **PHASE 3: Advanced Caching & CDN (Months 3-4)**
*Serve global traffic fast*

#### 3.1 ISR (Incremental Static Regeneration)
```typescript
// app/(dashboard)/[storeId]/products/page.tsx
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  // Pre-generate popular stores
  const topStores = await prisma.store.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' }
  });
  
  return topStores.map(store => ({
    storeId: store.id
  }));
}

// API route with cache headers
export function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
```

#### 3.2 CloudFlare Workers (Global Edge Caching)
```javascript
// wrangler.toml
[env.production]
vars = { REDIS_URL = "..." }

// src/index.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Cache public product data globally
    if (url.pathname.startsWith('/api/public/')) {
      const cached = await env.KV.get(url.pathname);
      if (cached) return new Response(cached, {
        headers: { 'X-Cache': 'HIT' }
      });
    }
    
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      // Serialize response body before caching
      const responseText = await response.clone().text();
      await env.KV.put(url.pathname, responseText, { expirationTtl: 3600 });
      return response;
    }
    
    return response;
  }
};
```

---

### **PHASE 4: Microservices Extraction (Months 4-6)**
*Scale services independently*

#### 4.1 Extract Payment Service
```typescript
// apps/payment-service/src/routes/webhook.ts
import express from 'express';
import { stripe } from '../lib/stripe';
import { db } from '../lib/db';

const app = express();

app.post('/webhook/stripe', async (req, res) => {
  // Validate signature first
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.WEBHOOK_SECRET
    );
  } catch (error) {
    logger.error({ error: sanitizeError(error) }, 'Stripe signature validation failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const orderId = session.metadata?.orderId;
    
    if (!orderId) {
      logger.warn({ eventId: event.id }, 'Missing orderId in checkout.session.completed');
      return res.json({ received: true });
    }
    
    try {
      // Use database transaction to ensure atomicity
      const result = await db.$transaction(async (tx) => {
        // Update order inside transaction
        const order = await tx.order.update({
          where: { id: orderId },
          data: { isPaid: true }
        });
        
        // Write event to outbox table for reliable publishing
        await tx.eventOutbox.create({
          data: {
            aggregateId: orderId,
            eventType: 'order.paid',
            payload: { orderId, storeId: order.storeId }
          }
        });
        
        return order;
      });
      
      // Publish after transaction commits (with retry logic)
      try {
        await amqp.publish('order.paid', { orderId }, { maxRetries: 3 });
      } catch (publishError) {
        logger.error({ error: sanitizeError(publishError), orderId }, 'Failed to publish order event');
        // Events in outbox will be retried by background worker
      }
      
    } catch (error) {
      logger.error({ error: sanitizeError(error), orderId }, 'Order update failed');
      // Return 500 so Stripe retries
      return res.status(500).json({ error: 'Processing failed' });
    }
  }
  
  res.json({ received: true });
});
```

#### 4.2 Search Service (Elasticsearch)
```typescript
// apps/search-service
import { Client } from '@elastic/elasticsearch';

const es = new Client({ node: process.env.ELASTICSEARCH_URL });

// Index products
export async function indexProduct(product: Product) {
  await es.index({
    index: 'products',
    id: product.id,
    document: {
      name: product.name,
      description: product.description,
      storeId: product.storeId,
      price: product.price,
      featured: product.featured,
      archived: product.archived,
      // indexed at sub-100ms latency
    }
  });
}

// Full-text search API
app.get('/search', async (req, res) => {
  const results = await es.search({
    index: 'products',
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: req.query.q,
              fields: ['name^2', 'description']
            }
          }
        ],
        filter: [
          { term: { storeId: req.query.storeId } },
          { term: { archived: false } }
        ]
      }
    }
  });
  
  res.json(results.hits.hits);
});
```

#### 4.3 Analytics Service
```typescript
// apps/analytics-service
import { InfluxDB, Point } from '@influxdata/influxdb-client';

const influx = new InfluxDB({
  url: process.env.INFLUX_URL,
  token: process.env.INFLUX_TOKEN
});

export async function recordEvent(event: {
  storeId: string;
  type: 'product_view' | 'product_purchase' | 'checkout_start';
  metadata?: Record<string, any>;
}) {
  const writeAPI = influx.getWriteApi('org', 'bucket');
  
  writeAPI.writePoint(
    new Point(event.type)
      .tag('storeId', event.storeId)
      .intField('count', 1)
      .timestamp(new Date())
  );
  
  await writeAPI.flush();
}

// Real-time dashboard queries
app.get('/analytics/:storeId/revenue', async (req, res) => {
  // Validate storeId to prevent Flux injection
  const storeIdRegex = /^[A-Za-z0-9_-]+$/;
  if (!storeIdRegex.test(req.params.storeId)) {
    return res.status(400).json({ error: 'Invalid storeId format' });
  }
  
  const result = await influx.getQueryApi('org').collectLines(`
    from(bucket: "events")
    |> range(start: -7d)
    |> filter(fn: (r) => r._measurement == "product_purchase")
    |> filter(fn: (r) => r.storeId == "${req.params.storeId}")
    |> group(by: ["_time"])
    |> sum()
  `);
  
  res.json(result);
});
```

---

## 🔐 Security Hardening (All Phases)

```typescript
// lib/security.ts
import helmet from 'helmet';
import cors from 'cors';

export function securityHeaders(app) {
  // Use helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://api.stripe.com"]
      }
    },
    strictTransportSecurity: { maxAge: 31536000 },
    xFrameOptions: { action: 'deny' }
  }));

  // CORS - restrict to frontend origin
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));

  // Request size limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '10kb' }));
}

// Prevent SQL injection via parameterized queries (using Prisma)
// Validate all inputs with Zod
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  images: z.array(z.string().url()).min(1),
  categoryId: z.string().cuid(),
  // ...
});

// JWT validation for API
export async function validateToken(token: string) {
  try {
    return await clerkClient.verifyToken(token);
  } catch {
    throw new Error('Invalid token');
  }
}
```

---

## 📈 Monitoring & Observability (All Phases)

```typescript
// lib/monitoring.ts
import * as Sentry from "@sentry/nextjs";
import { logger } from './logger';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
  ],
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV !== 'production',
});

// Datadog APM for performance monitoring
const tracer = require('dd-trace').init();

// Custom metrics
export function recordMetric(name: string, value: number, tags?: Record<string, string>) {
  // Send to Datadog/NewRelic
  logger.info({ metric: name, value, tags });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    database: await checkDatabase(),
    redis: await checkRedis(),
    timestamp: new Date()
  });
});

// Performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    });
  });
  next();
});
```

---

## 🚀 Deployment & Infrastructure

### **Development Environment**
```bash
# .env.development
# Single container setup
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

### **Staging Environment** (Pre-production on AWS/GCP)
```yaml
# docker-compose.staging.yml
services:
  app:
    image: forgecommerce:staging
    replicas: 2
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=${STAGING_DB_URL}
      - REDIS_URL=${STAGING_REDIS_URL}
    healthcheck:
      test: curl http://localhost:3000/health
      interval: 30s
      timeout: 10s
      retries: 3
    
  postgres:
    image: postgres:16
    volumes:
      - staging_data:/var/lib/postgresql/data
    
  redis:
    image: redis:7-alpine
    
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
```

### **Production Infrastructure (Kubernetes)**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: forgecommerce-api
spec:
  replicas: 5
  selector:
    matchLabels:
      app: forgecommerce
  template:
    metadata:
      labels:
        app: forgecommerce
    spec:
      containers:
      - name: app
        image: forgecommerce:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: forgecommerce-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: forgecommerce-secrets
              key: redis-url
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: forgecommerce-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: forgecommerce-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 💾 Database Scaling Strategy

### **Phase 1: Single Optimized Database**
- Connection pooling (PgBouncer)
- Proper indexing
- Query caching

### **Phase 2: Read Replicas**
```sql
-- For analytics queries
SELECT * FROM orders 
WHERE store_id = ? AND is_paid = true
-- Execute on read replica, not primary
```

### **Phase 3: Sharding (if >10M records)**
```typescript
// app/lib/db-router.ts
// Simple consistent hash function for sharding
function hashCode(str: string): number {
  if (!str) return 0;
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Return non-negative integer
  return Math.abs(hash);
}

function getDbConnection(storeId: string) {
  const hash = hashCode(storeId);
  const shardId = hash % NUM_SHARDS; // e.g., 5 shards
  
  return connections[`shard_${shardId}`];
}

// Usage
const db = getDbConnection(storeId);
const products = await db.product.findMany({ where: { storeId } });
```

### **Phase 4: Event Sourcing (if you need audit trail)**
```typescript
// Store immutable events instead of just final state
interface Event {
  id: string;
  aggregateId: string; // storeId
  type: 'ProductCreated' | 'ProductUpdated' | 'OrderPlaced';
  data: unknown;
  timestamp: Date;
}

await eventStore.append({
  aggregateId: storeId,
  type: 'ProductCreated',
  data: { name, price, categoryId }
});
```

---

## 📊 Scaling Roadmap by User Count

| Phase | Users | Database         | Cache               | Queue     | Services     | Deployment     |
| ----- | ----- | ---------------- | ------------------- | --------- | ------------ | -------------- |
| **1** | 1K    | Single + Index   | None                | None      | Monolith     | Vercel         |
| **2** | 10K   | Single + Pool    | Redis               | Bull      | Monolith     | Vercel + Redis |
| **3** | 100K  | Single + Replica | Redis + CDN         | Bull      | 2-3 Services | Docker         |
| **4** | 500K  | Sharded          | Redis + ElastiCache | RabbitMQ  | 6-8 Services | Kubernetes     |
| **5** | 1M+   | Multi-region     | Multi-region cache  | SQS/Kafka | Distributed  | Multi-cloud    |

---

## ✅ Implementation Checklist

- [ ] **Phase 1 (Weeks 1-4)**
  - [ ] Add database indexes
  - [ ] Enable Redis caching
  - [ ] Add request validation (Zod)
  - [ ] Implement rate limiting
  - [ ] Setup structured logging
  - [ ] Add error tracking (Sentry)

- [ ] **Phase 2 (Weeks 5-8)**
  - [ ] Setup Bull queue
  - [ ] Make webhook processing async
  - [ ] Add image processing queue
  - [ ] Setup Dead Letter Queue
  - [ ] Implement retry logic

- [ ] **Phase 3 (Weeks 9-12)**
  - [ ] Enable ISR caching
  - [ ] Setup CloudFlare Workers
  - [ ] Configure CDN for images
  - [ ] Add CloudFlare Analytics

- [ ] **Phase 4 (Weeks 13+)**
  - [ ] Extract Payment Service
  - [ ] Extract Search Service (Elasticsearch)
  - [ ] Extract Analytics Service (InfluxDB)
  - [ ] Setup message broker (RabbitMQ/Kafka)
  - [ ] Migrate to Kubernetes

---

## 🎓 Key Takeaways

1. **Start monolithic, optimize aggressively**
   - Don't prematurely split into microservices
   - Cache + Queue first, split later

2. **Database is the bottleneck**
   - Indexes, pooling, caching solve 90% of scaling issues
   - Only shard when absolutely necessary

3. **Make everything async**
   - Webhooks should return 200 immediately
   - Heavy work happens in background jobs

4. **Monitor from day 1**
   - Logging, metrics, tracing
   - You can't optimize what you can't measure

5. **Security scales with simplicity**
   - Keep secrets out of code (use env vars)
   - Validate ALL inputs
   - Use established libraries (Helmet, CORS, Zod)

---

**Questions? Let's implement Phase 1 next! 🚀**
