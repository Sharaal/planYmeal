import Stripe from 'stripe';

if (!process.env.STRIPE_API_KEY) {
  throw new Error('STRIPE_API_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export async function getStripeProduct(productId: string) {
  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price'],
    });
    return product;
  } catch (error) {
    console.error('Error fetching Stripe product:', error);
    throw error;
  }
}

export async function createStripeCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}