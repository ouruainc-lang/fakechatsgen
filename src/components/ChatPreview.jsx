import React, { forwardRef } from 'react';
import MessageBubble from './MessageBubble';
import { useSubscription } from '../context/SubscriptionContext';
import { ArrowLeft, Video, Phone, MoreVertical } from 'lucide-react';

const ChatPreview = forwardRef(({
    messages,
    theme = 'whatsapp',
    chatTitle = 'John Doe',
    chatSubtitle = '',
    chatAvatar = '', // Default to empty
    chatDarkMode = false,
    draftMessage = null, // Accept draft message
    chatBackgroundImage = '', // Accept Custom Background
    ...props // Capture other props
}, ref) => {
    const { isPro } = useSubscription() || { isPro: false }; // Fallback if context missing (during dev/test)

    const getContainerStyle = () => {
        if (theme === 'whatsapp') {
            return {
                background: chatDarkMode ? '#0b141a' : '#efe7dd', // Dark vs Light BG
                backgroundImage: chatBackgroundImage ? `url(${chatBackgroundImage})` : (chatDarkMode ? 'none' : ''),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            };
        } else if (theme === 'imessage') {
            return {
                background: chatDarkMode ? '#000000' : '#ffffff'
            };
        } else if (theme === 'telegram') {
            return {
                background: chatDarkMode ? '#0e1621' : '#8ba2b8' // Dark Blue-Gray vs Default Pattern Color
            };
        }
        return { background: '#fff' };
    };

    const getHeaderStyle = () => {
        if (theme === 'whatsapp') {
            return {
                background: chatDarkMode ? '#202c33' : '#008069',
                color: '#fff',
                height: '60px',
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center'
            };
        } else if (theme === 'imessage') {
            return {
                background: chatDarkMode ? '#1c1c1e' : '#f5f5f5',
                color: chatDarkMode ? '#fff' : '#000',
                borderBottom: chatDarkMode ? '1px solid #2c2c2e' : '1px solid #d1d1d6',
                height: '80px',
                padding: '30px 10px 10px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center'
            };
        } else if (theme === 'telegram') {
            return {
                background: chatDarkMode ? '#17212b' : '#517da2',
                color: '#fff',
                height: '56px',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center'
            };
        }
    };

    const containerStyle = getContainerStyle();
    const headerStyle = getHeaderStyle();

    return (
        <div
            ref={ref}
            id="chat-preview-node"
            className="w-[375px] min-h-[600px] overflow-hidden relative flex flex-col font-sans"
            style={{ ...containerStyle, ...props.style }}
        >
            {/* Watermark Overlay */}
            {!isPro && (
                <div className="absolute inset-0 pointer-events-none z-[50] flex items-center justify-center opacity-15 overflow-hidden">
                    <p className="text-4xl font-black text-gray-500 -rotate-45 whitespace-nowrap select-none">
                        FAKE CHAT GENERATOR
                    </p>
                </div>
            )}

            {/* Header */}
            <div style={headerStyle} className="shrink-0 relative z-10 w-full">
                {theme === 'whatsapp' && (
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowLeft size={24} />
                            <div className="w-9 h-9 bg-gray-300 rounded-full overflow-hidden relative">
                                {chatAvatar ? (
                                    <img src={chatAvatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold text-sm">
                                        {chatTitle.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center ml-1">
                                <h2 className="font-medium text-[16px] leading-tight truncate max-w-[150px]">{chatTitle}</h2>
                                {chatSubtitle && <p className="text-[12px] opacity-80 leading-tight">{chatSubtitle}</p>}
                            </div>
                        </div>

                        {/* WhatsApp Header Icons */}
                        <div className="flex items-center gap-5 mr-1">
                            <Video size={22} strokeWidth={2.5} />
                            <Phone size={20} strokeWidth={2.5} />
                            <MoreVertical size={20} strokeWidth={2.5} />
                        </div>
                    </div>
                )}

                {theme === 'imessage' && (
                    <div className="w-full flex flex-col items-center relative">
                        <div className="absolute left-0 bottom-3 flex items-center gap-1 text-blue-500">
                            <ArrowLeft size={22} />
                            <span className="text-[17px]">Back</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-gray-400 rounded-full mb-1 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                {chatAvatar ? (
                                    <img src={chatAvatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    chatTitle.substring(0, 1).toUpperCase()
                                )}
                            </div>
                            <span className="text-[12px] font-medium">{chatTitle}</span>
                        </div>
                        <div className="absolute right-0 bottom-3">
                            <Video size={24} className="text-blue-500" />
                        </div>
                    </div>
                )}

                {theme === 'telegram' && (
                    <div className="w-full flex items-center gap-4">
                        <ArrowLeft size={20} />
                        <div className="flex flex-col justify-center flex-1">
                            <h2 className="font-bold text-[18px] leading-tight">{chatTitle}</h2>
                            {chatSubtitle && <p className="text-[13px] opacity-80 leading-tight">{chatSubtitle}</p>}
                        </div>
                        <div className="w-9 h-9 bg-black/20 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm">
                            {chatAvatar ? (
                                <img src={chatAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                chatTitle.substring(0, 1).toUpperCase()
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto p-3 flex flex-col relative z-0 ${theme === 'whatsapp' ? '' : ''}`}>
                {/* WhatsApp Background Pattern Overlay for Dark Mode */}
                {theme === 'whatsapp' && chatDarkMode && (
                    <div className="absolute inset-0 bg-black/80 pointer-events-none z-[-1]"></div>
                )}

                {messages.map((msg, index) => {
                    const prevMsg = messages[index - 1];
                    const nextMsg = messages[index + 1];

                    const isFirst = !prevMsg || prevMsg.isSender !== msg.isSender;
                    const isLast = !nextMsg || nextMsg.isSender !== msg.isSender;

                    return (
                        <MessageBubble
                            key={msg.id}
                            message={{ ...msg, isFirst, isLast }}
                            theme={theme}
                            isDarkMode={chatDarkMode}
                        />
                    );
                })}

                {/* Render Draft Message */}
                {draftMessage && (
                    <div className="opacity-70 animate-pulse">
                        <MessageBubble
                            message={{ ...draftMessage, isFirst: true, isLast: true }}
                            theme={theme}
                            isDarkMode={chatDarkMode}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});

export default ChatPreview;
