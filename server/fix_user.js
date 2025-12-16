require('dotenv').config({ path: __dirname + '/.env' });
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// User ID from logs
const TARGET_USER_ID = 'user_36tFsUxkYJeU9uftwflPTt5iVqO';

async function fix() {
    try {
        console.log(`Fetching Clerk User: ${TARGET_USER_ID}...`);
        const user = await clerkClient.users.getUser(TARGET_USER_ID);

        console.log('Current Metadata:', JSON.stringify(user.publicMetadata, null, 2));

        const stripeCustomerId = user.publicMetadata.stripeCustomerId;
        if (!stripeCustomerId) {
            console.error('No stripeCustomerId found!');
            return;
        }

        console.log(`Fetching Stripe Customer: ${stripeCustomerId}...`);
        const customer = await stripe.customers.retrieve(stripeCustomerId, {
            expand: ['subscriptions']
        });

        const activeSub = customer.subscriptions.data.find(sub => sub.status === 'active' || sub.status === 'trialing');

        if (activeSub) {
            console.log(`Found Active Subscription: ${activeSub.id}`);
            console.log('Forcing update to PRO...');

            await clerkClient.users.updateUserMetadata(TARGET_USER_ID, {
                publicMetadata: {
                    plan: 'pro',
                    stripeCustomerId: stripeCustomerId
                }
            });
            console.log('SUCCESS: User is now PRO.');
        } else {
            console.log('No active subscription found in Stripe.');
            // Only force free if we are sure?
            // console.log('Forcing update to FREE...');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

fix();
