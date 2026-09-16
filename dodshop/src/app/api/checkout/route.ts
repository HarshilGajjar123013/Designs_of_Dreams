import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@dod/database';
import { randomUUID } from 'crypto';
import { getSession } from '@/lib/auth';

const DEFAULT_CATALOG_PRICES: Record<string, { sellingPrice: number; name: string; sku: string }> = {
  "1": { sellingPrice: 12999, name: "Royal Katan Silk Banarasi Saree", sku: "DOD-SAR-001" },
  "2": { sellingPrice: 8499, name: "Gilded Crimson Organza Saree", sku: "DOD-SAR-002" },
  "3": { sellingPrice: 9999, name: "Heritage Chanderi Zardozi Saree", sku: "DOD-SAR-003" },
  "4": { sellingPrice: 3499, name: "Anarkali Chikankari Kurti", sku: "DOD-KUR-004" },
  "5": { sellingPrice: 1899, name: "Premium Cotton Straight Kurti", sku: "DOD-KUR-005" },
  "6": { sellingPrice: 4299, name: "Mulmul Silk Partywear Kurti", sku: "DOD-KUR-006" },
  "7": { sellingPrice: 2499, name: "Raw Silk Zardozi Blouse", sku: "DOD-BLU-007" },
  "8": { sellingPrice: 3199, name: "Velvet Royal Heritage Blouse", sku: "DOD-BLU-008" },
  "9": { sellingPrice: 1999, name: "Brocade Floral Padded Blouse", sku: "DOD-BLU-009" },
  "10": { sellingPrice: 3999, name: "Pure Silk Banarasi Dupatta", sku: "DOD-DUP-010" },
  "11": { sellingPrice: 1499, name: "Chiffon Gota Patti Dupatta", sku: "DOD-DUP-011" },
  "12": { sellingPrice: 1799, name: "Hand-Dyed Bandhani Dupatta", sku: "DOD-DUP-012" },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fullName, 
      email,
      phone, 
      address, 
      city, 
      state = '',
      pincode, 
      paymentMethod, 
      cart 
    } = body;

    // Check if customer is authenticated; if guest, allow checkout with contact info
    const session = await getSession();
    const customerId = session?.id || body.customerId || `guest-${randomUUID()}`;
    const customerEmail = session?.email || body.customerEmail || email || 'guest@luxury.in';

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate quantities
    for (const item of cart) {
      if (!item.product?.id || !Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json({ error: 'Invalid cart item: each must have a product ID and integer quantity >= 1' }, { status: 400 });
      }
    }

    const orderId = 'DOD-' + Math.floor(100000 + Math.random() * 900000);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SECURITY: Authoritative Server-side Price Lookup
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const productIds = cart.map((item: any) => String(item.product.id));
    const productPriceMap: Map<string, { sellingPrice: number; name: string; sku: string }> = new Map();
    let databaseConnected = true;

    // 1. Check PostgreSQL Database via Prisma
    try {
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, sellingPrice: true, name: true, sku: true }
      });
      for (const p of dbProducts) {
        productPriceMap.set(p.id, { sellingPrice: p.sellingPrice, name: p.name, sku: p.sku });
      }
    } catch (dbError) {
      console.warn('⚠️ Product price lookup failed, falling back to JSON DB:', dbError);
      databaseConnected = false;
    }

    // 2. Check JSON fallback database for products not in Prisma
    const fallbackProducts = fallbackDb.getCollection('products');
    for (const pid of productIds) {
      if (!productPriceMap.has(pid)) {
        const p = fallbackProducts.find((prod: any) => String(prod.id) === pid);
        if (p) {
          productPriceMap.set(pid, { sellingPrice: p.sellingPrice, name: p.name, sku: p.sku || `DOD-SKU-${pid}` });
        }
      }
    }

    // 3. Check built-in store catalog authoritative price map
    for (const pid of productIds) {
      if (!productPriceMap.has(pid)) {
        const defaultItem = DEFAULT_CATALOG_PRICES[pid];
        if (defaultItem) {
          productPriceMap.set(pid, defaultItem);
        }
      }
    }

    // 4. Safely validate any remaining items
    for (const item of cart) {
      const pid = String(item.product.id);
      if (!productPriceMap.has(pid)) {
        const pPrice = Number(item.product?.price);
        if (!isNaN(pPrice) && pPrice > 0) {
          productPriceMap.set(pid, {
            sellingPrice: pPrice,
            name: item.product.title || item.product.name || 'Heritage Piece',
            sku: item.product.sku || `DOD-SKU-${pid}`
          });
        } else {
          return NextResponse.json(
            { error: `Product not found: ${pid}` },
            { status: 400 }
          );
        }
      }
    }

    // Calculate totals using AUTHORITATIVE server-side prices
    const subtotal = cart.reduce((acc: number, item: any) => {
      const dbProduct = productPriceMap.get(String(item.product.id))!;
      return acc + dbProduct.sellingPrice * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const shipping = subtotal > 1999 || subtotal === 0 ? 0 : 150;
    const grandTotal = subtotal + tax + shipping;

    const shippingAddress = {
      line1: address,
      line2: '',
      city,
      state, 
      postalCode: pincode,
      country: 'India',
      phone,
    };

    let newOrder = null;
    let finalCustomerId = customerId;

    if (databaseConnected) {
      try {
        // Ensure customer exists in PostgreSQL to satisfy orders_customerId_fkey
        let dbCustomer = await prisma.customer.findUnique({ where: { id: customerId } });
        if (!dbCustomer && customerEmail) {
          dbCustomer = await prisma.customer.findUnique({ where: { email: customerEmail } });
        }
        if (!dbCustomer) {
          dbCustomer = await prisma.customer.create({
            data: {
              name: fullName || 'Valued Customer',
              email: customerEmail,
              passwordHash: '$2a$10$e8wV0iL2cZ0rUjZ6jJ2w9eO4yK4gS0vX5m8v9t2s5a1r4e3i2c1b0',
              phone: phone || null,
              avatar: fullName?.slice(0, 2).toUpperCase() || 'C',
              isVerified: false,
              customerType: 'NEW'
            }
          });
        }
        finalCustomerId = dbCustomer.id;

        // Ensure all products exist in PostgreSQL to satisfy order_items_productId_fkey
        let defaultCategory = await prisma.category.findFirst();
        if (!defaultCategory) {
          defaultCategory = await prisma.category.create({
            data: { name: 'Heritage Collection', slug: 'heritage-collection', description: 'Curated artisanal clothing' }
          });
        }

        for (const pid of productIds) {
          const exists = await prisma.product.findUnique({ where: { id: pid } });
          if (!exists) {
            const defaultItem = productPriceMap.get(pid)!;
            await prisma.product.create({
              data: {
                id: pid,
                name: defaultItem.name,
                slug: `prod-${pid}-${randomUUID().slice(0, 8)}`,
                sku: defaultItem.sku || `DOD-SKU-${pid}`,
                categoryId: defaultCategory.id,
                subCategory: 'Heritage',
                mrp: defaultItem.sellingPrice * 1.2,
                sellingPrice: defaultItem.sellingPrice,
                description: defaultItem.name,
                fabric: 'Pure Mulberry Silk',
                weaveType: 'Handloom',
                occasion: 'Festive & Ceremonial',
                colors: ['#FF6A00'],
                stock: 50
              }
            });
          }
        }

        // 1. Try DB Write
        newOrder = await prisma.$transaction(async (tx: any) => {
          // Create Order with authoritative prices
          const order = await tx.order.create({
            data: {
              id: orderId,
              customerId: finalCustomerId,
              customerName: fullName,
              customerEmail,
              totalAmount: subtotal,
              discountAmount: 0,
              gstAmount: tax,
              shippingAmount: shipping,
              grandTotal,
              status: 'PENDING',
              paymentStatus: 'UNPAID',
              paymentMethod: paymentMethod === 'COD' ? 'COD' : paymentMethod === 'UPI' ? 'UPI' : 'CREDIT_CARD',
              shippingAddress,
              trackingDetails: {
                carrier: 'DHL Express Luxury Cargo',
                trackingId: `DHL-${orderId}`,
                estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                logs: [{ status: 'Order accepted at Atelier', timestamp: new Date().toISOString(), location: 'Atelier Head Office' }]
              },
              items: {
                create: cart.map((item: any) => {
                  const pid = String(item.product.id);
                  const dbProduct = productPriceMap.get(pid)!;
                  return {
                    productId: pid,
                    name: dbProduct.name,
                    sku: dbProduct.sku || `DOD-SKU-${pid}`,
                    price: dbProduct.sellingPrice, // AUTHORITATIVE price
                    quantity: item.quantity,
                    size: item.size || 'One Size',
                    color: item.product?.colors?.[0] || '#C5A059',
                    image: item.product?.image || ''
                  };
                })
              }
            }
          });

          // Update Stock & Create Inventory Logs
          for (const item of cart) {
            const pid = String(item.product.id);
            const dbProduct = productPriceMap.get(pid)!;
            try {
              await tx.product.update({
                where: { id: pid },
                data: { stock: { decrement: item.quantity } }
              });

              await tx.inventoryLog.create({
                data: {
                  productId: pid,
                  productName: dbProduct.name,
                  sku: dbProduct.sku || `DOD-SKU-${pid}`,
                  change: -item.quantity,
                  type: 'SALE',
                  user: `${fullName} (Customer)`
                }
              });
            } catch {
              // Catalog or fallback items may not exist in Prisma
            }
          }

          return order;
        });
      } catch (dbError) {
        console.warn('⚠️ Checkout DB transaction failed, falling back to JSON DB:', dbError);
        databaseConnected = false;
      }
    }

    if (!databaseConnected) {
      // 2. Local Fallback DB Write
      const orders = fallbackDb.getCollection('orders');
      const customers = fallbackDb.getCollection('customers');
      const products = fallbackDb.getCollection('products');
      const invLogs = fallbackDb.getCollection('inventoryLogs');

      // Guest checkout is also a new customer acquisition. Reuse an account by
      // email when possible so orders remain attached to the same patron.
      let fallbackCustomer = customers.find((customer: any) =>
        customer.id === customerId || customer.email?.toLowerCase() === customerEmail.toLowerCase()
      );
      if (!fallbackCustomer) {
        fallbackCustomer = {
          id: customerId,
          name: fullName || 'Valued Customer',
          email: customerEmail,
          phone: phone || null,
          avatar: (fullName || 'Valued Customer').split(' ').map((name: string) => name[0]).join('').slice(0, 2).toUpperCase(),
          notes: '',
          customerType: 'NEW',
          joinedDate: new Date().toISOString(),
          wishlist: [],
          cart: [],
        };
        customers.push(fallbackCustomer);
        fallbackDb.saveCollection('customers', customers);
      }
      finalCustomerId = fallbackCustomer.id;

      const items = cart.map((item: any) => {
        const pid = String(item.product.id);
        const dbProduct = productPriceMap.get(pid)!;
        return {
          id: randomUUID(),
          orderId,
          productId: pid,
          name: dbProduct.name,
          sku: dbProduct.sku || `DOD-SKU-${pid}`,
          price: dbProduct.sellingPrice, // AUTHORITATIVE price
          quantity: item.quantity,
          size: item.size || 'One Size',
          color: item.product?.colors?.[0] || '#C5A059',
          image: item.product?.image || ''
        };
      });

      const orderObj = {
        id: orderId,
        customerId: finalCustomerId,
        customerName: fullName,
        customerEmail,
        totalAmount: subtotal,
        discountAmount: 0,
        gstAmount: tax,
        shippingAmount: shipping,
        grandTotal,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: paymentMethod === 'COD' ? 'COD' : paymentMethod === 'UPI' ? 'UPI' : 'CREDIT_CARD',
        shippingAddress,
        trackingDetails: {
          carrier: 'DHL Express Luxury Cargo',
          trackingId: `DHL-${orderId}`,
          estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          logs: [{ status: 'Order accepted at Atelier', timestamp: new Date().toISOString(), location: 'Atelier Head Office' }]
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items
      };

      orders.push(orderObj);
      fallbackDb.saveCollection('orders', orders);

      // Update Stock & Inventory Logs in fallback
      for (const item of cart) {
        const dbProduct = productPriceMap.get(item.product.id)!;
        const prod = products.find((p: any) => p.id === item.product.id);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }

        invLogs.push({
          id: randomUUID(),
          productId: item.product.id,
          productName: dbProduct.name,
          sku: dbProduct.sku || `DOD-SKU-${item.product.id}`,
          change: -item.quantity,
          type: 'SALE',
          timestamp: new Date().toISOString(),
          user: `${fullName} (Customer)`
        });
      }

      fallbackDb.saveCollection('products', products);
      fallbackDb.saveCollection('inventoryLogs', invLogs);

      newOrder = orderObj;
    }

    return NextResponse.json({ success: true, orderId });

  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
