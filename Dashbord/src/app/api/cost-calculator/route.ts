import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';
import { randomUUID } from 'crypto';

function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function normalizeCalculation(c: any) {
  const productName = c.productName || c.product_name || 'Untitled Garment';
  const quantity = Math.max(1, Number(c.quantity) || 1);
  const fabricCost = roundToTwo(Number(c.fabricCost ?? c.fabric_cost ?? 0));
  const threadCost = roundToTwo(Number(c.threadCost ?? c.thread_cost ?? 0));
  const materialCost = roundToTwo(Number(c.materialCost ?? c.material_cost ?? 0));
  const printingCost = roundToTwo(Number(c.printingCost ?? c.printing_cost ?? 0));
  const labourCost = roundToTwo(Number(c.labourCost ?? c.labour_cost ?? 0));
  const otherCost = roundToTwo(Number(c.otherCost ?? c.other_cost ?? 0));

  const totalCost = roundToTwo(
    c.totalCost ?? c.total_cost ?? (fabricCost + threadCost + materialCost + printingCost + labourCost + otherCost)
  );
  const costPerPiece = roundToTwo(
    c.costPerPiece ?? c.cost_per_piece ?? (quantity > 0 ? totalCost / quantity : 0)
  );

  const rawSelling = c.sellingPrice ?? c.selling_price;
  const sellingPrice = (rawSelling !== null && rawSelling !== undefined && rawSelling !== '')
    ? roundToTwo(Number(rawSelling))
    : null;

  const profitPerPiece = sellingPrice !== null
    ? roundToTwo(c.profitPerPiece ?? c.profit_per_piece ?? (sellingPrice - costPerPiece))
    : null;

  const totalProfit = (profitPerPiece !== null && sellingPrice !== null)
    ? roundToTwo(c.totalProfit ?? c.total_profit ?? (profitPerPiece * quantity))
    : null;

  const createdAt = c.createdAt || c.created_at || new Date().toISOString();
  const updatedAt = c.updatedAt || c.updated_at || new Date().toISOString();

  return {
    id: c.id,
    productName,
    product_name: productName,
    quantity,
    fabricCost,
    fabric_cost: fabricCost,
    threadCost,
    thread_cost: threadCost,
    materialCost,
    material_cost: materialCost,
    printingCost,
    printing_cost: printingCost,
    labourCost,
    labour_cost: labourCost,
    otherCost,
    other_cost: otherCost,
    totalCost,
    total_cost: totalCost,
    costPerPiece,
    cost_per_piece: costPerPiece,
    sellingPrice,
    selling_price: sellingPrice,
    profitPerPiece,
    profit_per_piece: profitPerPiece,
    totalProfit,
    total_profit: totalProfit,
    createdAt: typeof createdAt === 'string' ? createdAt : createdAt.toISOString(),
    created_at: typeof createdAt === 'string' ? createdAt : createdAt.toISOString(),
    updatedAt: typeof updatedAt === 'string' ? updatedAt : updatedAt.toISOString(),
    updated_at: typeof updatedAt === 'string' ? updatedAt : updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;

    let calculations: any[] = [];
    let dbConnected = true;

    try {
      const records = await (prisma as any).costCalculation.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (Array.isArray(records) && records.length > 0) {
        calculations = records.map(normalizeCalculation);
      } else {
        dbConnected = false;
      }
    } catch (dbErr) {
      console.warn('⚠️ Database query failed for cost_calculations. Using fallback DB.', dbErr);
      dbConnected = false;
    }

    if (!dbConnected || calculations.length === 0) {
      const fallbackList = fallbackDb.getCollection('cost_calculations') || [];
      calculations = fallbackList.map(normalizeCalculation);
      calculations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }


    return NextResponse.json({
      success: true,
      calculations,
    });
  } catch (err: any) {
    console.error('Cost calculations GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve cost calculations' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;

    const body = await req.json();

    const productName = (body.productName ?? body.product_name ?? '').toString().trim();
    if (!productName) {
      return NextResponse.json(
        { error: 'Product Name is required.' },
        { status: 400 }
      );
    }

    const quantity = Math.max(1, parseInt(body.quantity, 10) || 1);
    const fabricCost = Math.max(0, parseFloat(body.fabricCost ?? body.fabric_cost ?? 0) || 0);
    const threadCost = Math.max(0, parseFloat(body.threadCost ?? body.thread_cost ?? 0) || 0);
    const materialCost = Math.max(0, parseFloat(body.materialCost ?? body.material_cost ?? 0) || 0);
    const printingCost = Math.max(0, parseFloat(body.printingCost ?? body.printing_cost ?? 0) || 0);
    const labourCost = Math.max(0, parseFloat(body.labourCost ?? body.labour_cost ?? 0) || 0);
    const otherCost = Math.max(0, parseFloat(body.otherCost ?? body.other_cost ?? 0) || 0);

    const rawSelling = body.sellingPrice ?? body.selling_price;
    const sellingPrice = (rawSelling !== undefined && rawSelling !== null && rawSelling !== '')
      ? Math.max(0, parseFloat(rawSelling) || 0)
      : null;

    // Derived values
    const totalCost = roundToTwo(fabricCost + threadCost + materialCost + printingCost + labourCost + otherCost);
    const costPerPiece = quantity > 0 ? roundToTwo(totalCost / quantity) : 0;
    const profitPerPiece = sellingPrice !== null ? roundToTwo(sellingPrice - costPerPiece) : null;
    const totalProfit = (profitPerPiece !== null && sellingPrice !== null) ? roundToTwo(profitPerPiece * quantity) : null;

    const now = new Date();
    const payload = {
      productName,
      quantity,
      fabricCost: roundToTwo(fabricCost),
      threadCost: roundToTwo(threadCost),
      materialCost: roundToTwo(materialCost),
      printingCost: roundToTwo(printingCost),
      labourCost: roundToTwo(labourCost),
      otherCost: roundToTwo(otherCost),
      totalCost,
      costPerPiece,
      sellingPrice: sellingPrice !== null ? roundToTwo(sellingPrice) : null,
      profitPerPiece,
      totalProfit,
    };

    let savedCalculation: any = null;
    let dbConnected = true;

    try {
      const created = await (prisma as any).costCalculation.create({
        data: payload,
      });
      savedCalculation = normalizeCalculation(created);
    } catch (dbErr) {
      console.warn('⚠️ Database create failed for cost_calculations. Using fallback DB.', dbErr);
      dbConnected = false;
    }

    if (!dbConnected) {
      const fallbackList = fallbackDb.getCollection('cost_calculations') || [];
      const newRecord = {
        id: randomUUID(),
        ...payload,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      fallbackList.unshift(newRecord);
      fallbackDb.saveCollection('cost_calculations', fallbackList);
      savedCalculation = normalizeCalculation(newRecord);
    }


    return NextResponse.json({
      success: true,
      calculation: savedCalculation,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Cost calculation POST error:', err);
    return NextResponse.json(
      { error: 'Failed to create cost calculation: ' + (err.message || 'Server error') },
      { status: 500 }
    );
  }
}
