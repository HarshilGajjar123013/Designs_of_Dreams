import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fallbackDb } from '@/lib/fallbackDb';
import { verifyAdminSession } from '@/lib/auth';

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;

    const resolvedParams = await params;
    const id = resolvedParams?.id;

    let calculation: any = null;

    try {
      const record = await (prisma as any).costCalculation.findUnique({
        where: { id },
      });
      if (record) {
        calculation = normalizeCalculation(record);
      }
    } catch (dbErr) {
      console.warn('⚠️ Database query failed for single cost calculation. Checking fallback DB.', dbErr);
    }

    if (!calculation) {
      const fallbackList = fallbackDb.getCollection('cost_calculations') || [];
      const found = fallbackList.find((item: any) => item.id === id);
      if (found) {
        calculation = normalizeCalculation(found);
      }
    }

    if (!calculation) {
      return NextResponse.json(
        { error: 'Cost calculation not found' },
        { status: 404 }
      );
    }




    return NextResponse.json({
      success: true,
      calculation,
    });
  } catch (err: any) {
    console.error('Cost calculation GET by id error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve cost calculation' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;

    const resolvedParams = await params;
    const id = resolvedParams?.id;
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
      updatedAt: new Date(),
    };

    let updatedCalculation: any = null;

    try {
      const updated = await (prisma as any).costCalculation.update({
        where: { id },
        data: payload,
      });
      updatedCalculation = normalizeCalculation(updated);
    } catch (dbErr) {
      console.warn('⚠️ Database update failed for cost calculation. Using fallback DB.', dbErr);
    }

    if (!updatedCalculation) {
      const fallbackList = fallbackDb.getCollection('cost_calculations') || [];
      const index = fallbackList.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        const existing = fallbackList[index];
        const merged = {
          ...existing,
          ...payload,
          updatedAt: new Date().toISOString(),
        };
        fallbackList[index] = merged;
        fallbackDb.saveCollection('cost_calculations', fallbackList);
        updatedCalculation = normalizeCalculation(merged);
      }
    }

    if (!updatedCalculation) {
      return NextResponse.json(
        { error: 'Cost calculation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      calculation: updatedCalculation,
    });

  } catch (err: any) {
    console.error('Cost calculation PUT error:', err);
    return NextResponse.json(
      { error: 'Failed to update cost calculation: ' + (err.message || 'Server error') },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await verifyAdminSession();
    if (response) return response;

    const resolvedParams = await params;
    const id = resolvedParams?.id;

    try {
      await (prisma as any).costCalculation.delete({
        where: { id },
      });
    } catch (dbErr) {
      console.warn('⚠️ Database delete failed for cost calculation. Using fallback DB.', dbErr);
    }

    const fallbackList = fallbackDb.getCollection('cost_calculations') || [];
    const filtered = fallbackList.filter((item: any) => item.id !== id);
    fallbackDb.saveCollection('cost_calculations', filtered);


    return NextResponse.json({
      success: true,
      message: 'Calculation deleted successfully',
    });
  } catch (err: any) {
    console.error('Cost calculation DELETE error:', err);
    return NextResponse.json(
      { error: 'Failed to delete cost calculation' },
      { status: 500 }
    );
  }
}
