import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionEvent(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionEvent(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    // Get customer to find user email
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer || customer.deleted) {
      console.error('Customer not found or deleted:', customerId);
      return;
    }

    const email = (customer as Stripe.Customer).email;
    if (!email) {
      console.error('Customer email not found:', customerId);
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error('User not found for email:', email);
      return;
    }

    // Map Stripe status to our status
    let status = 'canceled';
    if (subscription.status === 'active') {
      status = 'active';
    } else if (subscription.status === 'trialing') {
      status = 'trial';
    }

    // Upsert subscription record
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
      },
      create: {
        userId: user.id,
        status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
      },
    });

    console.log(`Subscription ${status} for user ${email}`);
  } catch (error) {
    console.error('Error handling subscription event:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Update subscription status to canceled
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: 'canceled' },
    });

    console.log(`Subscription canceled: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    
    if (subscriptionId) {
      // Ensure subscription is marked as active
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: { status: 'active' },
      });

      console.log(`Payment succeeded for subscription: ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string;
    
    if (subscriptionId) {
      // Mark subscription as canceled on payment failure
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: { status: 'canceled' },
      });

      console.log(`Payment failed for subscription: ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}