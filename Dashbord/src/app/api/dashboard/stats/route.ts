import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';

export async function GET() {
  try {
    let databaseConnected = true;
    let products: any[] = [];
    let orders: any[] = [];
    let customers: any[] = [];
    let categories: any[] = [];

    try {
      [products, orders, customers, categories] = await Promise.all([
        prisma.product.findMany({}),
        prisma.order.findMany({ include: { items: true } }),
        prisma.customer.findMany({}),
        prisma.category.findMany({})
      ]);
    } catch (dbError) {
      console.warn('⚠️ Database query failed for dashboard stats, using fallback JSON DB.');
      databaseConnected = false;
    }

    if (!databaseConnected) {
      products = fallbackDb.getCollection('products');
      orders = fallbackDb.getCollection('orders');
      customers = fallbackDb.getCollection('customers');
      categories = fallbackDb.getCollection('categories');
    }

    // Calculations
    const validOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'RETURNED');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.grandTotal, 0);
    const totalOrdersCount = orders.length;
    const activeCustomersCount = customers.length;
    const aov = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    const pendingOrdersCount = orders.filter(o => 
      ['PENDING', 'PROCESSING', 'PACKED'].includes(o.status)
    ).length;

    const returnsCount = orders.filter(o => o.status === 'RETURNED').length;
    const refundsCount = orders.filter(o => o.paymentStatus === 'REFUNDED').length;
    const lowStockAlertsCount = products.filter(p => p.stock <= (p.lowStockAlert ?? 2)).length;

    // Recent orders
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const recentOrders = sortedOrders.slice(0, 3);

    // Low stock products
    const lowStockProducts = products.filter(p => p.stock <= (p.lowStockAlert ?? 2));
    const lowStockAlertList = lowStockProducts.slice(0, 3);

    // Category Sales breakdown
    const categorySales = categories.map((cat, idx) => {
      let salesAmount = 0;
      orders.forEach(order => {
        if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
          order.items.forEach((item: any) => {
            const prod = products.find(p => p.id === item.productId);
            if (prod && (prod.categoryId === cat.id || prod.category === cat.name)) {
              salesAmount += item.price * item.quantity;
            }
          });
        }
      });

      return {
        name: cat.name,
        value: salesAmount,
        color: cat.name === 'Sarees' ? '#FF6A00' : 
               cat.name === 'Kurtis' ? '#FF6A00' :
               cat.name === 'Blouses' ? '#0FA958' : 
               cat.name === 'Dupattas' ? '#D99A00' : '#800020'
      };
    });

    // Monthly revenue trend (last 6 months dynamically)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const last6Months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      last6Months.push({ name: months[idx], revenue: 0, orders: 0 });
    }

    orders.forEach(order => {
      if (order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
        const orderDate = new Date(order.createdAt);
        const orderMonth = months[orderDate.getMonth()];
        const bucket = last6Months.find(m => m.name === orderMonth);
        if (bucket) {
          bucket.revenue += order.grandTotal;
          bucket.orders += 1;
        }
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        activeCustomers: activeCustomersCount,
        aov,
        pendingOrders: pendingOrdersCount,
        returns: returnsCount,
        refunds: refundsCount,
        lowStockAlerts: lowStockAlertsCount,
        recentOrders,
        lowStockProducts: lowStockAlertList,
        revenueTrend: last6Months,
        categorySales: categorySales
      }
    });

  } catch (err: any) {
    console.error('Dashboard stats GET error:', err);
    return NextResponse.json(
      { error: 'Failed to aggregate dashboard stats' },
      { status: 500 }
    );
  }
}
