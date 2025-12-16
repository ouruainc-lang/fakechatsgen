import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
    const { isLoaded, isSignedIn, has } = useAuth();
    const { user } = useUser();

    // Derived state
    // MIGRATE: Using metadata instead of has({ plan: 'pro' })
    const isPro = isLoaded && isSignedIn && user?.publicMetadata?.plan === 'pro';

    // We can still track daily usage explicitly if needed, but for now 
    // we primarily rely on the plan verification.
    // If not signed in, usage is 0 (or irrelevant as they can't export).
    const [dailyCount, setDailyCount] = useState(0);
    const MAX_FREE_DAILY = 5;

    // Local daily count logic for Free users (optional, usually handled by backend, 
    // but keeping basic local tracking for UX feedback)
    useEffect(() => {
        if (!isSignedIn) return;

        const today = new Date().toDateString();
        const storedDate = localStorage.getItem(`usageDate_${user?.id}`);
        const storedCount = parseInt(localStorage.getItem(`dailyCount_${user?.id}`) || '0', 10);

        if (storedDate === today) {
            setDailyCount(storedCount);
        } else {
            setDailyCount(0);
            localStorage.setItem(`usageDate_${user?.id}`, today);
            localStorage.setItem(`dailyCount_${user?.id}`, '0');
        }
    }, [isSignedIn, user?.id]);

    const incrementUsage = () => {
        if (isPro) return true; // Unlimited for pro

        if (dailyCount < MAX_FREE_DAILY) {
            const newCount = dailyCount + 1;
            setDailyCount(newCount);
            if (user?.id) {
                localStorage.setItem(`dailyCount_${user?.id}`, newCount.toString());
                localStorage.setItem(`usageDate_${user?.id}`, new Date().toDateString());
            }
            return true;
        }
        return false; // Limit reached
    };

    return (
        <SubscriptionContext.Provider value={{
            isPro,
            dailyCount,
            maxFree: MAX_FREE_DAILY,
            incrementUsage,
            isLoaded,
            isSignedIn
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};
