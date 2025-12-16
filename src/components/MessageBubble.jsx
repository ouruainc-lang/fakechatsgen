import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, theme = 'whatsapp', isDarkMode = false }) => {
    const { text, time, isSender, status, isFirst, isLast } = message;

    const getBubbleStyles = () => {
        switch (theme) {
            case 'whatsapp':
                const bgRequest = isDarkMode
                    ? (isSender ? 'bg-[#005c4b]' : 'bg-[#202c33]')
                    : (isSender ? 'bg-[#d9fdd3]' : 'bg-white');

                const textColor = isDarkMode ? 'text-[#e9edef]' : 'text-[#111b21]';
                const metaColor = isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]';

                return {
                    container: `max-w-[85%] w-fit break-words flow-root rounded-lg px-2 py-1 relative text-[14.2px] leading-[19px] shadow-sm ${isSender
                        ? `${isFirst ? 'rounded-tr-none mb-1' : 'mb-[2px] rounded-tr-lg'}`
                        : `${isFirst ? 'rounded-tl-none mb-1' : 'mb-[2px] rounded-tl-lg'}`
                        } ${bgRequest} ${isSender ? 'ml-auto' : 'mr-auto'}`,
                    text: textColor,
                    meta: `text-[11px] ${metaColor} ml-2 align-bottom float-right mt-[4px] h-[15px]`,
                };
            case 'imessage':
                return {
                    container: `max-w-[75%] w-fit break-words px-[12px] py-[6px] mb-[2px] text-[17px] leading-[22px] tracking-tight ${isSender
                        ? 'bg-[#007aff] text-white ml-auto rounded-[20px] rounded-br-[4px]'
                        : (isDarkMode ? 'bg-[#262626] text-white' : 'bg-[#e9e9eb] text-black') + ' mr-auto rounded-[20px] rounded-bl-[4px]'
                        }`,
                    text: '',
                    meta: 'hidden',
                };
            case 'telegram':
                const telegramBg = isDarkMode
                    ? (isSender ? 'bg-[#2b5278]' : 'bg-[#182533]')
                    : (isSender ? 'bg-[#effdde]' : 'bg-white');
                const telegramText = isDarkMode ? 'text-white' : 'text-black';
                const telegramMeta = isDarkMode ? 'text-[#6ea1cb]' : 'text-[#559c47]'; // Approximate distinctive meta color

                return {
                    container: `max-w-[75%] w-fit break-words flow-root rounded-lg px-2 py-1 mb-1 relative text-[14px] leading-[18px] shadow-sm ${telegramBg} ${isSender ? 'ml-auto rounded-br-none' : 'mr-auto rounded-bl-none'}`,
                    text: telegramText,
                    meta: `text-[11px] ${telegramMeta} ml-2 align-bottom float-right mt-[4px] h-[15px]`,
                };
            default:
                return {};
        }
    };

    const styles = getBubbleStyles();

    // SVG Paths
    const DOUBLE_TICK_D = "M5.03033 11.4697C4.73744 11.1768 4.26256 11.1768 3.96967 11.4697C3.67678 11.7626 3.67678 12.2374 3.96967 12.5303L5.03033 11.4697ZM8.5 16L7.96967 16.5303C8.26256 16.8232 8.73744 16.8232 9.03033 16.5303L8.5 16ZM17.0303 8.53033C17.3232 8.23744 17.3232 7.76256 17.0303 7.46967C16.7374 7.17678 16.2626 7.17678 15.9697 7.46967L17.0303 8.53033ZM9.03033 11.4697C8.73744 11.1768 8.26256 11.1768 7.96967 11.4697C7.67678 11.7626 7.67678 12.2374 7.96967 12.5303L9.03033 11.4697ZM12.5 16L11.9697 16.5303C12.2626 16.8232 12.7374 16.8232 13.0303 16.5303L12.5 16ZM21.0303 8.53033C21.3232 8.23744 21.3232 7.76256 21.0303 7.46967C20.7374 7.17678 20.2626 7.17678 19.9697 7.46967L21.0303 8.53033ZM3.96967 12.5303L7.96967 16.5303L9.03033 15.4697L5.03033 11.4697L3.96967 12.5303ZM9.03033 16.5303L17.0303 8.53033L15.9697 7.46967L7.96967 15.4697L9.03033 16.5303ZM7.96967 12.5303L11.9697 16.5303L13.0303 15.4697L9.03033 11.4697L7.96967 12.5303ZM13.0303 16.5303L21.0303 8.53033L19.9697 7.46967L11.9697 15.4697L13.0303 16.5303Z";

    // Single Tick (Derived from the right half of the double tick)
    const SINGLE_TICK_D = "M7.96967 12.5303L11.9697 16.5303L13.0303 15.4697L9.03033 11.4697L7.96967 12.5303ZM13.0303 16.5303L21.0303 8.53033L19.9697 7.46967L11.9697 15.4697L13.0303 16.5303Z";

    return (
        <div className={`message-bubble ${styles.container}`} style={{ fontFamily: 'inherit' }}>
            {/* WhatsApp Tail SVG */}
            {theme === 'whatsapp' && isFirst && (
                <div className={`absolute top-[-1px] w-[8px] h-[13px] overflow-hidden ${isSender ? '-right-[8px]' : '-left-[8px]'}`}>
                    <svg viewBox="0 0 8 13" height="13" width="8" preserveAspectRatio="none" className={isSender ? 'block' : 'scale-x-[-1]'}>
                        <path
                            d="M5.188,1H0v11.193l6.467-8.625C7.526,2.156,6.958,1,5.188,1z"
                            fill={isDarkMode
                                ? (isSender ? '#005c4b' : '#202c33')
                                : (isSender ? '#d9fdd3' : '#ffffff')}
                        />
                        <path
                            d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z"
                            fill="none"
                        />
                    </svg>
                </div>
            )}

            {/* Image (if present) */}
            {message.image && (
                <div className="mb-1 rounded-lg overflow-hidden">
                    <img src={message.image} alt="Sent attachment" className="max-w-full h-auto object-cover max-h-[300px]" />
                </div>
            )}

            <span className={styles.text}>{text}</span>

            {/* Meta (Time + Status) */}
            {(theme === 'whatsapp' || theme === 'telegram') && (
                <span className={styles.meta}>
                    <span className="mr-[2px]">{time}</span>
                    {isSender && (
                        <span className="inline-flex items-center">
                            <svg viewBox="0 -0.5 20 20" width="17" height="16" fill="none" className="">
                                <path
                                    d={status === 'sent' ? SINGLE_TICK_D : DOUBLE_TICK_D}
                                    fill={theme === 'whatsapp'
                                        ? (status === 'read' ? '#53bdeb' : (isDarkMode ? '#8696a0' : '#667781'))
                                        : (status === 'read' ? '#559c47' : (isDarkMode ? '#6ea1cb' : '#559c47')) // Telegram Colors
                                    }
                                />
                            </svg>
                        </span>
                    )}
                </span>
            )}
        </div>
    );
};

export default MessageBubble;
