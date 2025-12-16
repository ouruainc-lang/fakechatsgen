import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ChevronLeft, Check, X } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

const PricingPage = () => {
    const { isPro } = useSubscription();
    const { user } = useUser();
    const { isSignedIn, openSignIn } = useAuth();
    const [loading, setLoading] = React.useState(false);

    const handleUpgrade = async () => {
        if (!isSignedIn) {
            openSignIn();
            return;
        }

        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const res = await fetch(`${API_URL}/api/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.primaryEmailAddress.emailAddress,
                    clerkUserId: user.id,
                }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Something went wrong');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating checkout session');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-20 px-6 font-sans">
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>

            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent mb-4">
                    Upgrade to Pro
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Unlock the full potential of Fake Chat Generator. Unlimited high-quality exports with no watermarks.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                {/* Free Plan */}
                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        <span className="bg-gray-800 text-gray-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Current</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold">$0</span>
                        <span className="text-gray-500">/ forever</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-start gap-3 text-gray-300">
                            <Check size={20} className="text-green-500 shrink-0 mt-0.5" />
                            <span>5 Exports per day</span>
                        </li>
                        <li className="flex items-start gap-3 text-gray-300">
                            <Check size={20} className="text-green-500 shrink-0 mt-0.5" />
                            <span>Standard Quality (1.5x)</span>
                        </li>
                        <li className="flex items-start gap-3 text-gray-400">
                            <X size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <span>Includes Watermark</span>
                        </li>
                        <li className="flex items-start gap-3 text-gray-400">
                            <X size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <span>No HD Exports</span>
                        </li>
                    </ul>
                    <Link
                        to="/"
                        className="w-full py-3 rounded-xl font-bold text-center bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                    >
                        Go to Editor
                    </Link>
                </div>

                {/* Pro Plan */}
                <div className="bg-[#111] border border-yellow-500/30 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-yellow-500/10 scale-105 transform z-10">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-600"></div>
                    <div className="absolute top-4 right-4 animate-pulse">
                        <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Best Value</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">$6.99</span>
                        <span className="text-gray-500">/ month</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-start gap-3 text-gray-300">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check size={16} className="text-green-500 shrink-0" /></div>
                            <span className="font-medium text-white">Unlimited Exports</span>
                        </li>
                        <li className="flex items-start gap-3 text-gray-300">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check size={16} className="text-green-500 shrink-0" /></div>
                            <span className="font-medium text-white">No Watermark</span>
                        </li>
                        <li className="flex items-start gap-3 text-gray-300">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check size={16} className="text-green-500 shrink-0" /></div>
                            <span className="font-medium text-white">HD Quality (3x)</span>
                        </li>
                        <li className="flex items-start gap-3 text-gray-300">
                            <div className="bg-green-500/20 p-1 rounded-full"><Check size={16} className="text-green-500 shrink-0" /></div>
                            <span className="font-medium text-white">Priority Support</span>
                        </li>
                    </ul>

                    {isPro ? (
                        <button
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    const API_URL = import.meta.env.VITE_API_URL || '';
                                    const res = await fetch(`${API_URL}/api/create-portal-session`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ clerkUserId: user.id })
                                    });
                                    if (!res.ok) throw new Error('Failed');
                                    const { url } = await res.json();
                                    window.location.href = url;
                                } catch (err) {
                                    console.error(err);
                                    alert('Error opening subscription portal');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="w-full py-3 rounded-xl font-bold text-center bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 cursor-pointer transition flex items-center justify-center"
                        >
                            {loading ? 'Loading...' : 'Manage Subscription'}
                        </button>
                    ) : (
                        <button
                            onClick={handleUpgrade}
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-center bg-gradient-to-r from-yellow-400 to-amber-600 text-black hover:shadow-lg hover:shadow-orange-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Upgrade Now'
                            )}
                        </button>
                    )}
                    <p className="text-xs text-center text-gray-500 mt-3">Secure checkout via Stripe</p>
                </div>
            </div>

            <div className="mt-16 text-center text-gray-500 text-sm">
                <p>Have questions? Email us at <a href="mailto:support@ouruai.com" className="text-gray-400 underline hover:text-white">support@ouruai.com</a></p>
            </div>
        </div>
    );
};

export default PricingPage;
