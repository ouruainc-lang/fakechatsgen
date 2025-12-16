import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, MessageSquare, Shield, Smartphone, Download, Lock, ChevronDown, Crown } from 'lucide-react';
import ChatPreview from '../components/ChatPreview';
import EditorPanel from '../components/EditorPanel';
import { exportToPng, exportToJpeg, exportToPdf } from '../utils/exportUtils';
import { useSubscription } from '../context/SubscriptionContext';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useClerk } from "@clerk/clerk-react";

const INITIAL_MESSAGES = [
    { id: 1, text: 'Hi! How is the project going?', time: '10:05 AM', isSender: true, status: 'read' },
    { id: 2, text: 'It is going great! 🚀 checking pixel perfect export now.', time: '10:06 AM', isSender: false, status: 'read' },
    { id: 3, text: 'Awesome! Let me know if you need help with emojis 😀.', time: '11:15 AM', isSender: true, status: 'delivered' },
];

const DEVICE_MODELS = {
    'iPhone SE': { width: '375px', height: '667px', name: 'iPhone SE' },
    'iPhone 15 Pro': { width: '393px', height: '852px', name: 'iPhone 15 Pro' },
    'iPhone 15 Max': { width: '430px', height: '932px', name: 'iPhone 15 Pro Max' },
    'Pixel 7': { width: '412px', height: '915px', name: 'Pixel 7' },
    'iPad Mini': { width: '500px', height: '100%', name: 'iPad Mini (Compact)' }, // Custom width for fitting
};

const LandingPage = () => {
    // Editor State
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [theme, setTheme] = useState('whatsapp');
    const [chatTitle, setChatTitle] = useState('John Doe');
    const [chatSubtitle, setChatSubtitle] = useState('online');
    const [chatAvatar, setChatAvatar] = useState('');
    const [chatBackgroundImage, setChatBackgroundImage] = useState(''); // New: Custom Background URL
    const [chatDarkMode, setChatDarkMode] = useState(false);
    const [deviceModel, setDeviceModel] = useState('iPhone SE');
    const [draftMessage, setDraftMessage] = useState(null); // New state for live draft
    const [mobileTab, setMobileTab] = useState('editor'); // 'preview' or 'editor' for mobile
    const [openFaq, setOpenFaq] = useState(null); // FAQ state Ref: LandingPage.jsx:439
    const [exportMenuOpen, setExportMenuOpen] = useState(false); // Export dropdown state
    const previewRef = useRef(null);
    const navigate = useNavigate();

    const { incrementUsage, isPro, isSignedIn, isLoaded } = useSubscription();
    const { user } = useUser();
    const { openSignIn } = useClerk();

    // FORCE RELOAD ON PAYMENT SUCCESS
    React.useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get('success') === 'true' && user) {
            console.log('Payment success detected, reloading user...');
            user.reload().then(() => {
                console.log('User reloaded, new meta:', user.publicMetadata);
                // Optional: Clear the query param to avoid loops or refresh spam
                window.history.replaceState({}, '', '/');
            });
        }
    }, [user]);

    const upgradeToPro = () => {
        navigate('/pricing');
    };

    const handleExport = (format = 'png', quality = 'standard') => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            openSignIn(); // Enforce auth for everyone
            return;
        }

        const allowed = incrementUsage();
        if (!allowed) {
            upgradeToPro(); // Go to pricing page
            return;
        }

        if (quality === 'hd' && !isPro) {
            upgradeToPro();
            return;
        }

        const node = previewRef.current;
        const scale = quality === 'hd' ? 3 : 1.5; // HD = 3x, Standard = 1.5x

        // Wait a bit for images to load if needed, or just export
        setTimeout(() => {
            if (format === 'png') {
                exportToPng(node, `chat-export-${Date.now()}`, scale);
            } else if (format === 'jpg') {
                exportToJpeg(node, `chat-export-${Date.now()}`, scale);
            }
            setExportMenuOpen(false);
        }, 100);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans">
            {/* Navigation */}
            <nav className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center py-6 px-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight z-50">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        FakeChatGen
                    </span>
                </div>
                <div className="flex gap-4 items-center">
                    <SignedIn>
                        {isPro && (
                            <span className="bg-gradient-to-r from-yellow-400 to-amber-600 text-black text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                                <Crown size={12} fill="currentColor" /> PRO
                            </span>
                        )}
                        <span className="text-gray-300 text-sm font-medium hidden sm:inline">
                            Welcome back, {user?.firstName}!
                        </span>

                        {/* Manage Subscription Button (Only for PRO) */}
                        {isPro && (
                            <button
                                onClick={async () => {
                                    try {
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
                                        alert('Error opening portal');
                                    }
                                }}
                                className="text-xs text-gray-400 hover:text-white underline underline-offset-2 transition-colors mr-2 hidden sm:block"
                            >
                                Manage Sub
                            </button>
                        )}

                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="px-5 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full transition-all hover:scale-105">
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Floating Elements */}
                {/* Ghost Phone 1 (Back Left) */}
                <motion.div
                    animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-[10%] w-[250px] h-[500px] border-4 border-white/5 rounded-[40px] pointer-events-none hidden lg:block z-0"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-white/5 rounded-b-xl"></div>
                </motion.div>

                {/* Ghost Phone 2 (Back Right) */}
                <motion.div
                    animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-20 right-[10%] w-[280px] h-[550px] border-4 border-white/5 rounded-[45px] pointer-events-none hidden lg:block z-0"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-white/5 rounded-b-xl"></div>
                </motion.div>
                {/* 1. WhatsApp Bubble (Left) */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-20 left-[5%] md:left-[15%] bg-[#005c4b] p-4 rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-2xl border border-[#25d366]/20 hidden md:block z-0 opacity-80"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        </div>
                        <div className="text-left">
                            <div className="text-[#e9edef] text-sm font-medium">Omg this is realistic! 🤯</div>
                            <div className="text-[#8696a0] text-[10px]">10:42 AM</div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. iMessage Bubble (Right) */}
                <motion.div
                    animate={{ y: [0, 25, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-40 right-[5%] md:right-[15%] bg-[#007aff] px-4 py-3 rounded-2xl rounded-tr-sm shadow-2xl border border-blue-400/30 hidden md:block z-0 opacity-80"
                >
                    <div className="text-white text-sm">Sent you a photo</div>
                </motion.div>

                {/* 3. Notification Card (Bottom Left) */}
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-10 left-[10%] bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-xl flex items-center gap-3 hidden lg:flex z-0"
                >
                    <div className="bg-green-500 w-10 h-10 rounded-lg flex items-center justify-center text-white">
                        <MessageSquare size={20} fill="white" />
                    </div>
                    <div className="text-left">
                        <div className="text-white text-xs font-bold">New Message</div>
                        <div className="text-gray-300 text-[10px]">Sarah sent a photo 📷</div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-4xl mx-auto"
                >
                    <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-green-400 mb-6">
                        ✨ #1 Fake Chat Generator
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                        Create Realistic Chat Conversations in Seconds.
                    </h1>
                    <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
                        The most authentic chat mockup tool for WhatsApp, iMessage, and Telegram.
                        Perfect for presentations, marketing, and prank lovers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a href="#editor" className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            Start Creating for Free
                        </a>
                        <span className="text-gray-500 text-xs sm:text-sm mt-2 sm:mt-0 opacity-80 flex items-center gap-1">
                            <Check size={14} className="text-green-500" /> No credit card required
                        </span>
                    </div>
                </motion.div>
            </header>

            {/* Editor Studio Section */}
            <section id="editor" className="py-20 relative bg-[#050505] border-t border-white/5 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Editor Studio</h2>
                        <p className="text-gray-400 text-sm">Customize every detail of your conversation.</p>
                    </div>

                    {/* Mobile Tab Switcher & Free Limit Counter */}
                    <div className="lg:hidden max-w-md mx-auto mb-4">
                        {!isPro && (
                            <div className="text-center mb-2">
                                <span className="inline-block bg-yellow-500/10 text-yellow-500 text-xs px-3 py-1 rounded-full border border-yellow-500/20 font-bold">
                                    {5 - (parseInt(localStorage.getItem(`dailyCount_${user?.id}`) || localStorage.getItem('dailyCount')) || 0)} Free Exports Left
                                </span>
                            </div>
                        )}
                        <div className="flex bg-[#1f2937] p-1 rounded-xl border border-[#374151]">
                            <button
                                onClick={() => setMobileTab('preview')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mobileTab === 'preview' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                👁️ Preview
                            </button>
                            <button
                                onClick={() => setMobileTab('editor')}
                                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mobileTab === 'editor' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                ✏️ Editor
                            </button>
                        </div>
                    </div>

                    {/* Main Studio Container */}
                    <div
                        className="flex flex-col lg:flex-row gap-0 bg-[#0b0f19] border border-[#1f2937] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out"
                        style={{ height: window.innerWidth >= 1024 ? `max(750px, ${parseInt(DEVICE_MODELS[deviceModel].height) + 100}px)` : '80vh' }}
                    >

                        {/* LEFT: Preview Area (Darker bg) */}
                        <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} lg:flex flex-1 bg-[#0b0f19] relative flex-col items-center justify-start pt-16 p-8 border-b lg:border-b-0 lg:border-r border-[#1f2937] overflow-y-auto custom-scrollbar h-full`}>
                            {/* Top Actions */}
                            <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
                                {/* Export Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setExportMenuOpen(!exportMenuOpen)}
                                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-blue-900/40 transition transform hover:-translate-y-1 text-sm lg:text-base"
                                    >
                                        <Download size={18} /> <span>Export</span> <ChevronDown size={16} className={`transition-transform duration-200 ${exportMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {exportMenuOpen && (
                                        <div className="absolute top-full left-0 mt-2 w-56 bg-[#1f2937] border border-gray-600 rounded-xl shadow-2xl overflow-hidden z-50">
                                            <div className="p-2">
                                                <div className="text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wider">Standard</div>
                                                <button onClick={() => handleExport('png', 'standard')} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg text-sm text-gray-300 flex justify-between items-center group">
                                                    PNG <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-500 group-hover:text-gray-300">1x</span>
                                                </button>
                                                <button onClick={() => handleExport('jpg', 'standard')} className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg text-sm text-gray-300 flex justify-between items-center group">
                                                    JPG <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-500 group-hover:text-gray-300">1x</span>
                                                </button>
                                            </div>
                                            <div className="border-t border-gray-600 p-2 bg-gradient-to-b from-blue-900/10 to-transparent">
                                                <div className="flex items-center justify-between text-xs font-bold text-blue-400 px-3 py-2 uppercase tracking-wider">
                                                    HD (Pro) {isPro ? null : <Lock size={12} />}
                                                </div>
                                                <button onClick={() => handleExport('png', 'hd')} className="w-full text-left px-3 py-2 hover:bg-blue-600/20 rounded-lg text-sm text-white flex justify-between items-center group transition-colors">
                                                    High Res PNG {isPro ? <Check size={14} className="text-green-400" /> : <Crown size={14} className="text-yellow-400" />}
                                                </button>
                                                <button onClick={() => handleExport('jpg', 'hd')} className="w-full text-left px-3 py-2 hover:bg-blue-600/20 rounded-lg text-sm text-white flex justify-between items-center group transition-colors">
                                                    High Res JPG {isPro ? <Check size={14} className="text-green-400" /> : <Crown size={14} className="text-yellow-400" />}
                                                </button>
                                            </div>
                                            <div className="bg-[#18181b] p-3 border-t border-gray-700">
                                                <p className="text-[10px] text-gray-500 leading-tight text-center">
                                                    For entertainment purposes only. Do not use for deceit or harm. Use responsibly.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!isPro && (
                                    <button
                                        onClick={upgradeToPro}
                                        className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold py-3 px-6 rounded-full shadow-lg shadow-yellow-900/20 transition transform hover:-translate-y-1 text-sm lg:text-base border border-yellow-400/50"
                                    >
                                        <Crown size={18} fill="currentColor" /> <span className="hidden sm:inline">Remove Watermark</span><span className="sm:hidden">Pro</span>
                                    </button>
                                )}
                            </div>

                            {/* Top Right Actions (Usage Counter) */}
                            {!isPro && (
                                <div className="hidden lg:block absolute top-6 right-6 z-20">
                                    <span className="text-yellow-400 font-bold text-xs bg-yellow-400/10 border border-yellow-400/20 px-3 py-2 rounded-full whitespace-nowrap backdrop-blur-md">
                                        {5 - (parseInt(localStorage.getItem(`dailyCount_${user?.id}`) || localStorage.getItem('dailyCount')) || 0)} Free Exports Left
                                    </span>
                                </div>
                            )}

                            <div className="shadow-2xl overflow-hidden border-4 border-[#1f2937] shrink-0 transition-all duration-300 ease-in-out origin-top scale-[0.65] sm:scale-[0.8] lg:scale-100 mt-12 lg:mt-0">
                                <ChatPreview
                                    ref={previewRef}
                                    messages={messages}
                                    draftMessage={draftMessage} // Pass draft state
                                    theme={theme}
                                    chatTitle={chatTitle}
                                    chatSubtitle={chatSubtitle}
                                    chatDarkMode={chatDarkMode}
                                    chatAvatar={chatAvatar} // Pass Avatar
                                    chatBackgroundImage={chatBackgroundImage} // Pass Custom Background
                                    style={{
                                        width: DEVICE_MODELS[deviceModel].width,
                                        height: DEVICE_MODELS[deviceModel].height,
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </div>


                        </div>

                        {/* RIGHT: Editor Panel (Sidebar) */}
                        <div className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-[420px] bg-[#111] p-6 lg:p-8 overflow-y-auto custom-scrollbar h-full`}>
                            <EditorPanel
                                messages={messages}
                                setMessages={setMessages}
                                onDraftChange={setDraftMessage} // Pass setter for draft
                                theme={theme}
                                setTheme={setTheme}
                                chatTitle={chatTitle}
                                setChatTitle={setChatTitle}
                                chatSubtitle={chatSubtitle}
                                setChatSubtitle={setChatSubtitle}
                                chatDarkMode={chatDarkMode}
                                setChatDarkMode={setChatDarkMode}
                                chatAvatar={chatAvatar} // Pass Avatar
                                setChatAvatar={setChatAvatar} // Pass Setter
                                chatBackgroundImage={chatBackgroundImage}
                                setChatBackgroundImage={setChatBackgroundImage}
                                deviceModel={deviceModel}
                                setDeviceModel={setDeviceModel}
                                deviceModels={DEVICE_MODELS}
                                isPro={isPro}
                                remainingExports={5 - (parseInt(localStorage.getItem(`dailyCount_${user?.id}`) || localStorage.getItem('dailyCount')) || 0)}
                            />
                        </div>
                    </div>
                </div>
            </section>



            {/* How It Works Section */}
            <section className="py-24 bg-[#050505] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
                        <p className="text-gray-400">Create your perfect chat in 3 simple steps.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/50 z-0"></div>

                        {[
                            { step: "01", title: "Choose Style", desc: "Select WhatsApp, iMessage, or Telegram." },
                            { step: "02", title: "Customize", desc: "Edit names, times, photos, and messages." },
                            { step: "03", title: "Export", desc: "Download high-quality image instantly." },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative z-10 flex flex-col items-center text-center group"
                            >
                                <div className="w-24 h-24 rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500 mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-400 text-sm max-w-xs">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Features Section */}
            <section id="features" className="py-24 bg-[#050505]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
                        <p className="text-gray-400">Professional grade tools for chat generation.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Smartphone className="text-purple-400" />, title: "Multi-Platform", desc: "WhatsApp, iMessage, and Telegram styles included." },
                            { icon: <Shield className="text-green-400" />, title: "Pixel Perfect", desc: "1:1 Rendering accuracy for high-quality exports." },
                            { icon: <Check className="text-blue-400" />, title: "Customizable", desc: "Dark mode, custom names, times, and delivery status." },
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition">
                                <div className="mb-4 p-3 bg-white/5 rounded-lg w-fit">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 bg-[#080808]">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-400">Got questions? We've got answers.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "Is this tool really free?", a: "Yes! You can use the tool for free with a daily export limit of 5 chats. Upgrading to Pro unlocks unlimited exports and removes the watermark." },
                            { q: "How do I remove the watermark?", a: "The watermark is automatically removed when you upgrade to the Pro plan. You can export clean, professional images instantly." },
                            { q: "Is my data private?", a: "Absolutely. We do not store any of your chat content on our servers. All generation happens locally in your browser for maximum privacy." },
                            { q: "Can I use this for commercial projects?", a: "Yes! Our Pro plan grants you full commercial license to use the generated images in your marketing, presentations, and social media." },
                            { q: "What platforms do you support?", a: "We currently support iOS iMessage, WhatsApp (Android & iOS), and Telegram. We're always adding more based on feedback!" }
                        ].map((faq, i) => (
                            <div key={i} className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition"
                                >
                                    <span className="font-bold text-lg">{faq.q}</span>
                                    <ChevronDown
                                        className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                                        size={20}
                                    />
                                </button>
                                <div
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5 mt-2">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 border-t border-white/5 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-16">Simple Pricing</h2>
                    <div className="flex flex-col md:flex-row justify-center gap-8">
                        {/* Free Plan */}
                        <div className="w-full max-w-sm p-8 rounded-3xl bg-white/5 border border-white/5">
                            <h3 className="text-xl font-medium text-gray-400 mb-2">Free</h3>
                            <div className="text-4xl font-bold mb-6">$0</div>
                            <ul className="space-y-4 mb-8 text-gray-300">
                                <li className="flex items-center gap-2"><Check size={16} /> 5 Downloads / Day</li>
                                <li className="flex items-center gap-2"><Check size={16} /> Standard Quality Export</li>
                                <li className="flex items-center gap-2"><Check size={16} /> All Templates</li>
                                <li className="flex items-center gap-2 opacity-50"><Check size={16} /> Watermarked Images</li>
                            </ul>
                            <button onClick={() => document.getElementById('editor').scrollIntoView({ behavior: 'smooth' })} className="block w-full py-3 text-center rounded-xl bg-white/10 hover:bg-white/20 transition font-medium">Get Started</button>
                        </div>

                        {/* Pro Plan */}
                        <div className="w-full max-w-sm p-8 rounded-3xl bg-gradient-to-b from-blue-900/40 to-black border border-blue-500/50 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                            <h3 className="text-xl font-medium text-blue-400 mb-2">Pro</h3>
                            <div className="text-4xl font-bold mb-6">$6.99<span className="text-lg font-normal text-gray-400">/mo</span></div>
                            <ul className="space-y-4 mb-8 text-white">
                                <li className="flex items-center gap-2"><Check size={16} className="text-blue-400" /> Unlimited Downloads</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-blue-400" /> HD 3x Quality Export</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-blue-400" /> No Watermark</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-blue-400" /> Priority Support</li>
                            </ul>
                            <button onClick={upgradeToPro} className="block w-full py-3 text-center rounded-xl bg-blue-600 hover:bg-blue-700 transition font-bold shadow-lg shadow-blue-900/20">Upgrade Now</button>
                            <p className="text-center text-xs text-gray-500 mt-4">Safe & Secure Payment. Cancel anytime.</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer className="bg-[#050505] border-t border-white/10 pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 font-bold text-xl mb-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                FakeChatGen
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                The most realistic chat generator for content creators, marketers, and designers.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <a href="#" className="text-gray-400 hover:text-white transition"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
                                <a href="#" className="text-gray-400 hover:text-white transition"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.597 1.028 2.688 0 3.848-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Product</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><a href="#editor" className="hover:text-white transition">Editor Studio</a></li>
                                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Resources</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition">Changelog</a></li>
                                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                                <li><a href="mailto:support@ouruai.com" className="hover:text-white transition">support@ouruai.com</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                        <p>© 2024 FakeChatGen. All rights reserved.</p>
                        <p>Made with ❤️ by Creators</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
