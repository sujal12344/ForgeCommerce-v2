import prisma from "./client";

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}
function rand<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error("Cannot pick from empty array");
  }
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randPrice(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// ── Data Pools ────────────────────────────────────────────────────────────────
const BILLBOARD_POOL = [
  {
    label: "Summer Essentials",
    imageUrl:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&q=80",
  },
  {
    label: "Winter Sale",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
  },
  {
    label: "New Arrivals",
    imageUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
  },
  {
    label: "Fashion Week",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80",
  },
  {
    label: "Clearance Sale",
    imageUrl:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1920&q=80",
  },
  {
    label: "Premium Collection",
    imageUrl:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80",
  },
  {
    label: "Street Style",
    imageUrl:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1920&q=80",
  },
  {
    label: "Festive Season",
    imageUrl:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1920&q=80",
  },
];

const CATEGORY_POOL = [
  "Clothing",
  "Footwear",
  "Accessories",
  "Bags",
  "Shirts",
  "Suits",
  "T-Shirts",
  "Denim",
  "Activewear",
  "Formal Wear",
  "Ethnic Wear",
  "Winter Wear",
  "Knitwear",
  "Outerwear",
];

const COLOR_POOL = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Navy", value: "#003153" },
  { name: "Gray", value: "#808080" },
  { name: "Red", value: "#FF0000" },
  { name: "Royal Blue", value: "#4169E1" },
  { name: "Forest Green", value: "#228B22" },
  { name: "Brown", value: "#8B4513" },
  { name: "Beige", value: "#F5F0E8" },
  { name: "Pink", value: "#FFC0CB" },
  { name: "Gold", value: "#FFD700" },
  { name: "Orange", value: "#FF8C00" },
];

const SIZE_POOL = [
  { name: "XS", value: "XS" },
  { name: "S", value: "S" },
  { name: "M", value: "M" },
  { name: "L", value: "L" },
  { name: "XL", value: "XL" },
  { name: "XXL", value: "XXL" },
  { name: "One Size", value: "OS" },
];

const PRODUCT_POOL = [
  {
    name: "Classic Oxford Shirt",
    minPrice: 35,
    maxPrice: 70,
    description: "Timeless oxford shirt in a relaxed fit",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
    ],
  },
  {
    name: "Slim Fit Chinos",
    minPrice: 45,
    maxPrice: 80,
    description: "Versatile chinos for everyday wear",
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
    ],
  },
  {
    name: "Leather Derby Shoes",
    minPrice: 80,
    maxPrice: 150,
    description: "Hand-stitched genuine leather shoes",
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800",
    ],
  },
  {
    name: "Wool Blend Blazer",
    minPrice: 100,
    maxPrice: 200,
    description: "Structured blazer for sharp dressing",
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
    ],
  },
  {
    name: "Denim Jacket",
    minPrice: 60,
    maxPrice: 110,
    description: "Vintage-washed denim jacket",
    images: [
      "https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=800",
    ],
  },
  {
    name: "Running Sneakers",
    minPrice: 70,
    maxPrice: 140,
    description: "Lightweight runners with memory foam insole",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"],
  },
  {
    name: "Structured Tote Bag",
    minPrice: 40,
    maxPrice: 90,
    description: "Spacious tote with leather handles",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
  },
  {
    name: "Merino Crewneck Sweater",
    minPrice: 55,
    maxPrice: 100,
    description: "Ultra-soft merino wool crewneck",
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800",
    ],
  },
  {
    name: "Slim Fit Jeans",
    minPrice: 50,
    maxPrice: 95,
    description: "Stretch denim in a modern slim cut",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"],
  },
  {
    name: "Graphic Tee",
    minPrice: 18,
    maxPrice: 40,
    description: "100% organic cotton graphic print tee",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800",
    ],
  },
  {
    name: "Leather Crossbody Bag",
    minPrice: 55,
    maxPrice: 110,
    description: "Compact crossbody in pebbled leather",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
  },
  {
    name: "Linen Summer Shirt",
    minPrice: 30,
    maxPrice: 65,
    description: "Breathable linen shirt for warm weather",
    images: [
      "https://images.unsplash.com/photo-1603252109360-909baaf261c7?w=800",
    ],
  },
  {
    name: "Chelsea Boots",
    minPrice: 90,
    maxPrice: 160,
    description: "Classic elastic-sided Chelsea boots",
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800",
    ],
  },
  {
    name: "Polo Shirt",
    minPrice: 28,
    maxPrice: 55,
    description: "Pique cotton polo in a regular fit",
    images: ["https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?w=800"],
  },
  {
    name: "Cargo Trousers",
    minPrice: 45,
    maxPrice: 85,
    description: "Multi-pocket cargo trousers in ripstop fabric",
    images: [
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800",
    ],
  },
  {
    name: "Formal Waistcoat",
    minPrice: 50,
    maxPrice: 95,
    description: "Tailored waistcoat in wool suiting fabric",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
    ],
  },
  {
    name: "Canvas Backpack",
    minPrice: 35,
    maxPrice: 75,
    description: "Durable waxed canvas backpack",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
  },
  {
    name: "Hoodie Sweatshirt",
    minPrice: 40,
    maxPrice: 80,
    description: "Fleece-lined pullover hoodie",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800"],
  },
  {
    name: "Turtleneck Top",
    minPrice: 32,
    maxPrice: 65,
    description: "Ribbed turtleneck in stretchy cotton blend",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800",
    ],
  },
  {
    name: "Sherpa Lined Jacket",
    minPrice: 80,
    maxPrice: 150,
    description: "Cosy sherpa-lined flight jacket",
    images: ["https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800"],
  },
];

const CUSTOMER_POOL = [
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+919876543210",
    address: "123 MG Road, Bangalore, Karnataka, 560001, IN",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@gmail.com",
    phone: "+919123456789",
    address: "456 CG Road, Ahmedabad, Gujarat, 380009, IN",
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@gmail.com",
    phone: "+918765432109",
    address: "78 Park Street, Kolkata, West Bengal, 700016, IN",
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@yahoo.com",
    phone: "+919834153453",
    address: "24 Jubilee Hills, Hyderabad, Telangana, 500033, IN",
  },
  {
    name: "Arjun Mehta",
    email: "arjun.mehta@outlook.com",
    phone: "+919087654321",
    address: "67 MG Road, Hyderabad, Telangana, 500003, IN",
  },
  {
    name: "Kavya Nair",
    email: "kavya.nair@gmail.com",
    phone: "+918901234567",
    address: "45 Marine Drive, Mumbai, Maharashtra, 400002, IN",
  },
  {
    name: "Amit Kumar",
    email: "amit.kumar@outlook.com",
    phone: "+917654321098",
    address: "34 Connaught Place, New Delhi, Delhi, 110001, IN",
  },
  {
    name: "Neha Gupta",
    email: "neha.gupta@gmail.com",
    phone: "+919518586936",
    address: "Bhiwandi, Thane, Maharashtra, 421302, IN",
  },
  {
    name: "Karan Malhotra",
    email: "karan.malhotra@gmail.com",
    phone: "+919234567890",
    address: "12 Banjara Hills, Hyderabad, Telangana, 500034, IN",
  },
  {
    name: "Divya Kapoor",
    email: "divya.kapoor@gmail.com",
    phone: "+919012345678",
    address: "89 Anna Salai, Chennai, Tamil Nadu, 600002, IN",
  },
  {
    name: "Rohan Verma",
    email: "rohan.verma@gmail.com",
    phone: "+917890123456",
    address: "23 Nehru Place, New Delhi, Delhi, 110019, IN",
  },
  {
    name: "Pooja Sharma",
    email: "pooja.sharma@gmail.com",
    phone: "+919345678901",
    address: "56 Indiranagar, Bangalore, Karnataka, 560038, IN",
  },
  {
    name: "Manish Tiwari",
    email: "manish.tiwari@rediffmail.com",
    phone: "+918901234560",
    address: "34 Hazratganj, Lucknow, Uttar Pradesh, 226001, IN",
  },
  {
    name: "Aditya Joshi",
    email: "aditya.joshi@yahoo.com",
    phone: "+918765432198",
    address: "12 FC Road, Pune, Maharashtra, 411004, IN",
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@hotmail.com",
    phone: "+916789012345",
    address: "22 T Nagar, Chennai, Tamil Nadu, 600017, IN",
  },
  {
    name: "Suresh Pillai",
    email: "suresh.pillai@gmail.com",
    phone: "+919876012345",
    address: "45 Palarivattom, Kochi, Kerala, 682025, IN",
  },
  {
    name: "Meera Bose",
    email: "meera.bose@gmail.com",
    phone: "+917012345678",
    address: "11 Salt Lake, Kolkata, West Bengal, 700091, IN",
  },
  {
    name: "Tanvi Desai",
    email: "tanvi.desai@yahoo.com",
    phone: "+919501234567",
    address: "23 Satellite, Ahmedabad, Gujarat, 380015, IN",
  },
  {
    name: "Neeraj Pandey",
    email: "neeraj.pandey@gmail.com",
    phone: "+918234567890",
    address: "90 Shyam Nagar, Kanpur, Uttar Pradesh, 208013, IN",
  },
  {
    name: "Ritika Singh",
    email: "ritika.singh@gmail.com",
    phone: "+917456789012",
    address: "90 Civil Lines, Jaipur, Rajasthan, 302006, IN",
  },
  {
    name: "Gaurav Saxena",
    email: "gaurav.saxena@outlook.com",
    phone: "+918123456789",
    address: "78 Hazratganj, Lucknow, Uttar Pradesh, 226001, IN",
  },
  {
    name: "Shreya Kulkarni",
    email: "shreya.kulkarni@gmail.com",
    phone: "+917345678901",
    address: "67 Koregaon Park, Pune, Maharashtra, 411001, IN",
  },
  {
    name: "Piyush Agarwal",
    email: "piyush.agarwal@rediffmail.com",
    phone: "+916543210987",
    address: "14 Alkapuri, Vadodara, Gujarat, 390007, IN",
  },
  {
    name: "Ishaan Chaudhary",
    email: "ishaan.chaudhary@gmail.com",
    phone: "+919678901234",
    address: "56 Vaishali, Ghaziabad, Uttar Pradesh, 201010, IN",
  },
];

/**
 * Populates an EXISTING store with randomised sample data.
 * Picks a different subset of billboards, categories, products, colors,
 * and customers on every call — no two loads look the same.
 *
 * Does NOT create or delete the store itself.
 */
export async function loadSampleData(storeId: string): Promise<void> {
  // Billboards: 3–5 random
  const billboards = await Promise.all(
    pick(BILLBOARD_POOL, randInt(3, 5)).map(b =>
      prisma.billBoard.create({
        data: { label: b.label, imageUrl: b.imageUrl, storeId },
      })
    )
  );

  // Categories: 5–7 random, each linked to a random billboard
  const categories = await Promise.all(
    pick(CATEGORY_POOL, randInt(5, 7)).map(name =>
      prisma.category.create({
        data: { name, storeId, billboardId: rand(billboards).id },
      })
    )
  );

  // Sizes: full standard set every time
  const sizes = await Promise.all(
    SIZE_POOL.map(s =>
      prisma.size.create({ data: { name: s.name, value: s.value, storeId } })
    )
  );

  // Colors: 6–8 random
  const colors = await Promise.all(
    pick(COLOR_POOL, randInt(6, 8)).map(c =>
      prisma.color.create({ data: { name: c.name, value: c.value, storeId } })
    )
  );

  // Products: 10–15 random, each with a random price within its realistic range
  const products = await Promise.all(
    pick(PRODUCT_POOL, randInt(10, 15)).map(p =>
      prisma.product.create({
        data: {
          name: p.name,
          price: randPrice(p.minPrice, p.maxPrice),
          description: p.description,
          featured: Math.random() > 0.5,
          archived: Math.random() > 0.9,
          storeId,
          categoryId: rand(categories).id,
          sizeId: rand(sizes).id,
          colorId: rand(colors).id,
          images: { create: p.images.map(url => ({ url })) },
        },
      })
    )
  );

  // Orders: 12–20 random customers, spread across the past ~14 months
  const now = new Date();
  await Promise.all(
    pick(CUSTOMER_POOL, randInt(12, 20)).map((customer, i) => {
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - randInt(i * 2, i * 2 + 20));
      const orderProducts = pick(products, randInt(1, 3));
      return prisma.order.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          isPaid: Math.random() > 0.15, // ~85% paid
          storeId,
          orderItems: {
            create: orderProducts.map(p => ({
              productId: p.id,
              price: p.price,
            })),
          },
          createdAt,
        },
      });
    })
  );
}
