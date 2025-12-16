const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Webhook } = require('svix');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { createClerkClient } = require('@clerk/clerk-sdk-node');

const app = express();
const port = 3000;
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

app.use(cors());

// Webhooks require raw body, so we separate parsing
// Clerk Webhook
app.post('/api/webhooks/clerk', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    let evt;

    try {
        evt = wh.verify(payload, headers);
    } catch (err) {
        console.error('Webhook verification failed:', err.message);
        return res.status(400).json({ success: false, message: err.message });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Clerk Webhook received: ${eventType}`);

    // Clerk Webhook Processing
    if (eventType === 'user.created') {
        const email = evt.data.email_addresses[0].email_address;
        const clerkUserId = evt.data.id;

        console.log('Processing user.created event for Clerk user:', clerkUserId);

        try {
            // Create Stripe Customer
            const customer = await stripe.customers.create({
                email: email,
                metadata: {
                    clerkId: clerkUserId
                }
            });

            console.log(`Created Stripe Customer: ${customer.id} for Clerk User: ${clerkUserId}`);

            // Update Clerk User Metadata with Stripe Customer ID
            await clerkClient.users.updateUserMetadata(clerkUserId, {
                publicMetadata: {
                    stripeCustomerId: customer.id
                }
            });
            console.log(`Updated Clerk Metadata for ${clerkUserId} with Stripe Customer ID`);

        } catch (err) {
            console.error('Error creating Stripe customer for Clerk user:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    } else {
        console.log(`Unhandled Clerk event type: ${eventType}`);
    }

    res.json({ success: true, message: 'Webhook received' });
});

// Stripe Webhook Endpoint (Restored)
app.post('/api/webhooks/stripe', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // console.log(`Stripe Webhook received: ${event.type}`); // Optional debug

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const clerkUserId = session.client_reference_id || session.subscription_data?.metadata?.clerkId || session.metadata?.clerkId;
            const customerId = session.customer;

            console.log('Processing checkout.session.completed');
            console.log('Session ID:', session.id);
            console.log('Clerk User ID (found):', clerkUserId);
            console.log('Stripe Customer ID:', customerId);

            if (clerkUserId) {
                try {
                    // 1. Ensure Stripe Customer has metadata
                    if (customerId) {
                        try {
                            await stripe.customers.update(customerId, { metadata: { clerkId: clerkUserId } });
                            console.log('Backfilled Stripe Customer metadata.');
                        } catch (e) {
                            console.error('Error backfilling customer metadata:', e.message);
                        }
                    }

                    // 2. Provision Access
                    await clerkClient.users.updateUserMetadata(clerkUserId, {
                        publicMetadata: {
                            plan: 'pro',
                            stripeCustomerId: customerId
                        }
                    });
                    console.log(`✅ SUCCESS: Provisioned PRO access for ${clerkUserId}`);
                } catch (err) {
                    console.error(`❌ FAILURE: Failed to provision access for ${clerkUserId}:`, err);
                }
            } else {
                console.error('⚠️ WARNING: No clerkUserId found in session!');
            }
            break;
        }
        case 'customer.subscription.deleted':
        case 'customer.subscription.updated': {
            const subscription = event.data.object;
            const clerkId = subscription.metadata?.clerkId;
            const status = subscription.status;
            const isPro = status === 'active' || status === 'trialling';

            console.log(`Processing subscription update: ${event.type} | Status: ${status}`);

            if (clerkId) {
                await clerkClient.users.updateUserMetadata(clerkId, {
                    publicMetadata: {
                        plan: isPro ? 'pro' : 'free',
                    }
                });
                console.log(`Updated subscription status for ${clerkId} to ${isPro ? 'pro' : 'free'}`);
            } else {
                console.log('No clerkId in subscription metadata, attempting lookup via customer...');
                try {
                    const customer = await stripe.customers.retrieve(subscription.customer);
                    if (customer.metadata?.clerkId) {
                        await clerkClient.users.updateUserMetadata(customer.metadata.clerkId, {
                            publicMetadata: {
                                plan: isPro ? 'pro' : 'free',
                            }
                        });
                        console.log(`Updated subscription status via Customer Lookup for ${customer.metadata.clerkId}`);
                    } else {
                        console.error('Could not find clerkId even after customer lookup.');
                    }
                } catch (e) {
                    console.error('Error during fallback lookup:', e);
                }
            }
            break;
        }
        default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Standard JSON parsing for other routes
app.use(bodyParser.json());

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
    const { clerkUserId, email } = req.body;

    if (!clerkUserId) {
        return res.status(400).json({ error: 'Missing clerkUserId' });
    }

    try {
        // 1. Fetch User to check for existing Stripe Customer ID
        const user = await clerkClient.users.getUser(clerkUserId);
        let stripeCustomerId = user.publicMetadata.stripeCustomerId;

        // 2. If no customer ID exists in metadata, we might need to search Stripe by email or create one?
        // For now, let's rely on Stripe's behavior: if we pass 'customer_email', it creates a new one.
        // But if we HAVE one, we MUST pass 'customer'.

        const sessionConfig = {
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: process.env.STRIPE_PRICE_ID
                ? [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }]
                : [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Fake Chat Generator Pro' },
                        unit_amount: 699,
                        recurring: { interval: 'month' },
                    },
                    quantity: 1,
                }],
            client_reference_id: clerkUserId,
            subscription_data: {
                metadata: {
                    clerkId: clerkUserId
                }
            },
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/?success=true`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing?canceled=true`,
        };

        if (stripeCustomerId) {
            sessionConfig.customer = stripeCustomerId;
        } else {
            sessionConfig.customer_email = email;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.json({ url: session.url });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// Create Customer Portal Session
app.post('/api/create-portal-session', async (req, res) => {
    const { clerkUserId } = req.body;

    try {
        // 1. Get User from Clerk to find Stripe Customer ID
        const user = await clerkClient.users.getUser(clerkUserId);
        const stripeCustomerId = user.publicMetadata.stripeCustomerId;

        if (!stripeCustomerId) {
            return res.status(400).json({ error: 'No Stripe Customer ID found for this user.' });
        }

        // 2. Create Portal Session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pricing`,
        });

        res.json({ url: portalSession.url });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
