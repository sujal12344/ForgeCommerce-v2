########################################
# Stage 1 – install dependencies
########################################
FROM node:20-alpine AS deps

# libc6-compat needed for some native addons on Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
# prisma generate runs via postinstall – needs the schema
COPY prisma ./prisma

RUN npm ci

########################################
# Stage 2 – build
########################################
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are embedded into the client JS bundle at build time.
# They are passed from docker-compose build.args (sourced from your .env file).
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
ARG NEXT_PUBLIC_DEMO_STORE_ID
ARG NEXT_PUBLIC_DEMO_STORE_URL
ARG NEXT_PUBLIC_DEMO_STORE_NAME

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME \
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET \
  NEXT_PUBLIC_DEMO_STORE_ID=$NEXT_PUBLIC_DEMO_STORE_ID \
  NEXT_PUBLIC_DEMO_STORE_URL=$NEXT_PUBLIC_DEMO_STORE_URL \
  NEXT_PUBLIC_DEMO_STORE_NAME=$NEXT_PUBLIC_DEMO_STORE_NAME

RUN npm run build

########################################
# Stage 3 – production runner
########################################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
  && adduser  --system --uid 1001 nextjs

# Static assets
COPY --from=builder /app/public ./.next/standalone/public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma's generated client isn't always auto-traced by @vercel/nft – copy explicitly
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma         ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client  ./node_modules/@prisma/client

USER nextjs

EXPOSE 3000
ENV PORT=3000 HOSTNAME="0.0.0.0"

# standalone output produces a self-contained server.js
CMD ["node", "server.js"]
