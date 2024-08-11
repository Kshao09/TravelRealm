import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const processPaymentRoute = {
    path: '/api/process-payment',
    method: 'POST',
    handler: async (req, res) => {
        const { cardNumber, cardExpiry, cardCVV, amount } = req.body;
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100,
                currency: 'usd',
                payment_method_data: {
                    type: 'card',
                    card: {
                        number: cardNumber,
                        exp_month: cardExpiry.split('/')[0],
                        exp_year: cardExpiry.split('/')[1],
                        cvc: cardCVV
                    }
                },
                confirm: true
            });

            res.status(200).json({ message: 'Payment success', paymentIntent });
        } catch (error) {
            console.error('Error processing payment:', error);
            res.status(500).json({ message: `Error: ${error.message}` });
        }
    }
};