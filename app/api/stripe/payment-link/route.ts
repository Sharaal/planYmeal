import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const paymentLink = process.env.STRIPE_PAYMENT_LINK;
    
    if (!paymentLink) {
      return NextResponse.json(
        { error: 'STRIPE_PAYMENT_LINK not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paymentLink,
    });
  } catch (error) {
    console.error('Error getting payment link:', error);
    return NextResponse.json(
      { error: 'Failed to get payment link' },
      { status: 500 }
    );
  }
}