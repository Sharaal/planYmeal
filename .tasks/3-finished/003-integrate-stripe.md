# Integrate stripe

- I created a stripe product "planYmeal Premium" with 4,99€ per month abo
- There should be a "Pricing" Link in the header navigation
- The "Pricing" page should show the infos about the product requested from stripe
    - Features: 
        - Create more than 10 menus
    - Subscribe button
- On click the subscribe button the user should be redirected to the checkout of stripe
- The backend needs to provide webhook `/api/webhooks/stripe`, see https://docs.stripe.com/webhooks/quickstart
- Webhook signature verification should be implemented for security
- There should be a "subscriptions" table with "userId" (primary key), "status" which can be "trial", "active" or "canceled". Also columns for info from stripe like "stripeCustomerId" and "stripeSubscriptionId"
- The "subscriptions" table will be updated in the webhook
- If the user don't have a subscription or if its status "canceled" there is a limit of 10 menus which can be added. If 10 are reached, the "add menu" button should redirect to the "Pricing" page
- There are some environment variables if needed:
    - STRIPE_API_KEY: API key for stripe requests to the API
    - STRIPE_PAYMENT_LINK: The link which should be used on the "Pricing" page
    - STRIPE_PRODUCT_ID: The product ID including the name and the costs
    - STRIPE_WEBHOOK_SECRET: Secret which needs to be given as query param to the webhook
- Stripe customer should be created on first subscription attempt
- Default state for new users is not having a subscription
- Subscription status display should be visible on an account page, which can be reached by clicking on the user in the header. The status should be linked with the stripe dashboard for the user to be able to cancel their subscription
- After subscribe the user is redirect to the "Calendar" page
- Use NPM package `stripe` to create stripe customer and getting product info

## Implementation

Update Todos
  ⎿  ☒ Install stripe npm package                          
     ☒ Create subscriptions database schema
     ☒ Add Pricing link to navigation
     ☒ Create Pricing page with Stripe product info
     ☒ Create Stripe webhook endpoint
     ☒ Implement subscription status checks and menu limits
     ☒ Create Account page with subscription status
     ☒ Add translations for Stripe integration
     ☒ Test the complete Stripe integration flow

⏺ Perfect! I have successfully implemented the complete Stripe integration as specified. Here's a summary of what was implemented:

✅ Completed Stripe Integration

1. Database Schema

- Added Subscription model with userId, status, stripeCustomerId, and stripeSubscriptionId
- Status can be "trial", "active", or "canceled"
- Ran Prisma migration to create the table

2. Stripe Package & Configuration

- Installed stripe npm package
- Created Stripe utility functions in /lib/stripe.ts
- Set up environment variables: STRIPE_API_KEY, STRIPE_PAYMENT_LINK, STRIPE_PRODUCT_ID, STRIPE_WEBHOOK_SECRET

3. Navigation & Pages

- Added "Pricing" link to navigation
- Created /pricing page that fetches product info from Stripe
- Made user profile clickable to go to /account page
- Created /account page showing subscription status and management

4. API Endpoints

- /api/stripe/product - Fetches product information from Stripe
- /api/stripe/payment-link - Returns the payment link for subscriptions
- /api/webhooks/stripe - Handles Stripe webhooks with signature verification
- /api/subscription/status - Returns user's subscription status and menu limits

5. Webhook Implementation

- Handles subscription events: created, updated, deleted
- Handles payment events: succeeded, failed
- Updates subscription status in database automatically
- Includes signature verification for security

6. Menu Limits & Subscription Checks

- Updated menu creation API to check subscription limits
- Free users limited to 10 menus
- Premium users get unlimited menus
- Add/Import menu buttons redirect to pricing page when limit reached
- Menu creation returns specific error code for limit reached

7. Frontend Components

- PricingPageClient: Displays product info, features, and subscribe button
- AccountPageClient: Shows subscription status, menu usage, and management links
- MenusPageClient: Updated to check subscription status and handle limits
- EditMenuDialog: Handles menu limit errors and redirects to pricing

8. Internationalization

- Added complete translations for German and English
- Pricing page, account page, subscription statuses, and error messages
- Maintains existing i18n architecture

9. User Experience Features

- Subscription status displayed with progress bars
- Clear indication of menu usage vs limits
- Direct links to Stripe customer portal for subscription management
- Automatic redirects when limits are reached
- Proper error handling and user feedback

10. Security & Best Practices

- Webhook signature verification
- Proper environment variable usage
- Error handling throughout the flow
- Database transactions and proper relationships

The integration follows the exact specifications from the task file and provides a complete subscription-based upgrade path for users who want to
create more than 10 menus.
