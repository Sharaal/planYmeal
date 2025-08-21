import { NextResponse } from 'next/server';
import { getStripeProduct } from '@/lib/stripe';

export async function GET() {
  try {
    const productId = process.env.STRIPE_PRODUCT_ID;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'STRIPE_PRODUCT_ID not configured' },
        { status: 500 }
      );
    }

    const product = await getStripeProduct(productId);
    
    const price = product.default_price;
    let priceInfo = null;
    
    if (price && typeof price === 'object') {
      priceInfo = {
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
      };
    }

    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: priceInfo,
    });
  } catch (error) {
    console.error('Error fetching product info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product information' },
      { status: 500 }
    );
  }
}