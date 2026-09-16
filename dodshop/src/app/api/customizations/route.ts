import { NextResponse } from 'next/server';
import { prisma, fallbackDb } from '@/lib/db';
import { getSession, resolveCustomer } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      productId,
      fabric,
      color,
      budget,
      aemroduriType,
      tassels,
      timeEstimateMonths,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    } = body;

    // 1. Mandatory Field Validations
    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'Product ID is required for customization.' },
        { status: 400 }
      );
    }

    if (!fabric || typeof fabric !== 'string' || !fabric.trim()) {
      return NextResponse.json(
        { error: 'Please select a valid fabric option.' },
        { status: 400 }
      );
    }

    if (!color || typeof color !== 'string' || !color.trim()) {
      return NextResponse.json(
        { error: 'Please enter your desired color.' },
        { status: 400 }
      );
    }

    if (!budget || typeof budget !== 'string' || !budget.trim()) {
      return NextResponse.json(
        { error: 'Please select or enter your preferred budget.' },
        { status: 400 }
      );
    }

    if (!aemroduriType || typeof aemroduriType !== 'string' || !aemroduriType.trim()) {
      return NextResponse.json(
        { error: 'Please select an Aemroduri (embroidery) type.' },
        { status: 400 }
      );
    }

    // 2. Tassels Validation (strictly "Yes" or "No")
    const cleanTassels = String(tassels).trim();
    if (cleanTassels !== 'Yes' && cleanTassels !== 'No') {
      return NextResponse.json(
        { error: 'Tassels option must be either "Yes" or "No".' },
        { status: 400 }
      );
    }

    // 3. Time Estimate Validation (1 to 60 months)
    const months = Number(timeEstimateMonths);
    if (isNaN(months) || !Number.isInteger(months) || months < 1 || months > 60) {
      return NextResponse.json(
        { 
          error: 'Time estimate must be an integer between 1 and 60 months. Values above 60 months are not allowed.',
          maxAllowed: 60
        },
        { status: 400 }
      );
    }

    // 4. Customer Session Association (if logged in)
    let customerId: string | null = null;
    let resolvedName = customerName?.trim() || null;
    let resolvedEmail = customerEmail?.trim() || null;
    let resolvedPhone = customerPhone?.trim() || null;

    try {
      const session = await getSession();
      if (session) {
        customerId = session.id;
        if (!resolvedName) resolvedName = session.name;
        if (!resolvedEmail) resolvedEmail = session.email;
      }
    } catch {
      // Guest submission is permitted
    }

    // 5. Save Customization Request to Database
    let savedRequest: any = null;
    let databaseConnected = true;

    try {
      savedRequest = await (prisma as any).customizationRequest.create({
        data: {
          productId,
          customerId,
          customerName: resolvedName,
          customerEmail: resolvedEmail,
          customerPhone: resolvedPhone,
          fabric: fabric.trim(),
          color: color.trim(),
          budget: budget.trim(),
          aemroduriType: aemroduriType.trim(),
          tassels: cleanTassels,
          timeEstimateMonths: months,
          notes: notes?.trim() || null,
          status: 'PENDING',
        }
      });
    } catch (dbErr) {
      console.warn('⚠️ Prisma customizationRequest.create failed. Falling back to local JSON database:', dbErr);
      databaseConnected = false;
    }

    if (!databaseConnected || !savedRequest) {
      // Fallback JSON persistence
      const requests = fallbackDb.getCollection('customizationRequests');
      const requestId = randomUUID();
      savedRequest = {
        id: requestId,
        productId,
        customerId,
        customerName: resolvedName,
        customerEmail: resolvedEmail,
        customerPhone: resolvedPhone,
        fabric: fabric.trim(),
        color: color.trim(),
        budget: budget.trim(),
        aemroduriType: aemroduriType.trim(),
        tassels: cleanTassels,
        timeEstimateMonths: months,
        notes: notes?.trim() || null,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      requests.push(savedRequest);
      fallbackDb.saveCollection('customizationRequests', requests);
    }

    return NextResponse.json({
      success: true,
      message: 'Your bespoke customization request has been submitted successfully. Our master atelier will contact you.',
      request: savedRequest,
    });

  } catch (err: any) {
    console.error('Customization submission error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your customization request.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const queryUserId = searchParams.get('userId');
    const customer = await resolveCustomer(req, queryUserId);

    // A customer can only view their own bespoke requests. Admin tooling uses
    // its dedicated dashboard API and must not rely on this customer endpoint.
    if (!customer) {
      return NextResponse.json({ success: true, requests: [] });
    }

    const customerId = customer.userId;

    let requests: any[] = [];
    try {
      if (productId) {
        requests = await (prisma as any).customizationRequest.findMany({
          where: { productId, customerId },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        requests = await (prisma as any).customizationRequest.findMany({
          where: { customerId },
          orderBy: { createdAt: 'desc' },
        });
      }
    } catch (dbErr) {
      const allRequests = fallbackDb.getCollection('customizationRequests');
      requests = productId
        ? allRequests.filter((r: any) => r.productId === productId && r.customerId === customerId)
        : allRequests.filter((r: any) => r.customerId === customerId);
    }

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (err: any) {
    console.error('Customizations GET error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve customization requests.' },
      { status: 500 }
    );
  }
}
