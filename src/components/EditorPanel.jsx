import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Smile, Send, ArrowDown } from 'lucide-react';

const EditorPanel = ({
    messages,
    setMessages,
    theme,
    setTheme,
    chatTitle,
    setChatTitle,
    chatSubtitle,
    setChatSubtitle,
    chatAvatar,
    setChatAvatar,
    chatBackgroundImage,
    setChatBackgroundImage,
    chatDarkMode,
    setChatDarkMode,
    deviceModel,
    setDeviceModel,
    deviceModels,
    onDraftChange = () => { },
    isPro = false,
    remainingExports = 5
}) => {
    const [activeTab, setActiveTab] = useState('content'); // 'content' or 'settings'

    // Message State
    const [messageInput, setMessageInput] = useState('');
    const [messageImage, setMessageImage] = useState(''); // New: Image URL state
    const [isSender, setIsSender] = useState(false); // Toggle state
    const [messageTime, setMessageTime] = useState('');
    const [messageStatus, setMessageStatus] = useState('read');

    // Editing State
    const [editingId, setEditingId] = useState(null);
    const [originalMessage, setOriginalMessage] = useState(null); // Backup for undo

    // Update Draft whenever inputs change
    useEffect(() => {
        if (editingId) return; // Don't show draft if editing

        if (!messageInput.trim() && !messageImage.trim()) {
            onDraftChange(null);
            return;
        }

        const draft = {
            id: 'draft',
            text: messageInput,
            image: messageImage,
            time: messageTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSender,
            status: messageStatus
        };
        onDraftChange(draft);
    }, [messageInput, messageImage, messageTime, messageStatus, isSender, editingId, onDraftChange]);

    const handleAddMessage = () => {
        if (!messageInput.trim() && !messageImage.trim()) return;

        const newMessage = {
            id: Date.now(),
            text: messageInput,
            image: messageImage,
            time: messageTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSender,
            status: messageStatus
        };
        setMessages([...messages, newMessage]);
        resetForm();
    };

    const handleEditMessage = (msg) => {
        setEditingId(msg.id);
        setOriginalMessage({ ...msg }); // Deep copy backup
        setMessageInput(msg.text);
        setMessageImage(msg.image || '');
        setMessageTime(msg.time);
        setIsSender(msg.isSender);
        setMessageStatus(msg.status);
        onDraftChange(null); // Clear draft when editing
    };

    const updateLiveMessage = (field, value) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === editingId) {
                return { ...msg, [field]: value };
            }
            return msg;
        }));
    };

    // When changing inputs while editing:
    const handleInputChange = (field, value) => {
        if (field === 'text') setMessageInput(value);
        if (field === 'image') setMessageImage(value);
        if (field === 'time') setMessageTime(value);

        if (editingId) {
            updateLiveMessage(field, value);
        }
    };

    const handleCancelEdit = () => {
        // Revert to original
        setMessages(prev => prev.map(msg =>
            msg.id === editingId ? originalMessage : msg
        ));
        resetForm();
    };

    const handleDoneEditing = () => {
        // Commit changes (already in state)
        resetForm();
    };

    const handleDeleteMessage = (id) => {
        setMessages(messages.filter(msg => msg.id !== id));
        if (editingId === id) resetForm();
    };

    const resetForm = () => {
        setMessageInput('');
        setMessageImage('');
        setIsSender(false); // Reset to Receiver by default? Or keep last used? Let's reset.
        setMessageTime('');
        setMessageStatus('read');
        setEditingId(null);
        setOriginalMessage(null);
        onDraftChange(null); // Clear draft
    };

    return (
        <div className="h-full flex flex-col">
            {/* Tabs & Exports Counter */}
            <div className="flex items-center justify-between border-b border-[#374151] mb-6">
                <div className="flex gap-6">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`pb-3 text-sm font-medium transition ${activeTab === 'content' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
                    >
                        Content
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-3 text-sm font-medium transition ${activeTab === 'settings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
                    >
                        Settings
                    </button>
                </div>
            </div>

            {activeTab === 'content' && (
                <div className="flex flex-col gap-6 animate-in fade-in duration-300">

                    {/* Message Composer Card */}
                    <div className="bg-[#1f2937] p-4 rounded-xl border border-[#374151]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">
                                {editingId ? 'Edit Message' : 'New Message'}
                            </h3>
                            {editingId && (
                                <button onClick={handleCancelEdit} className="text-xs text-red-400 hover:text-red-300">Cancel</button>
                            )}
                        </div>

                        {/* Message Input Fields */}
                        <div className="space-y-4 mb-4">
                            <div>
                                <label className="block text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2">Message</label>
                                <textarea
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg text-sm border border-zinc-700 focus:outline-none focus:border-green-500 transition-colors h-24 resize-none"
                                    placeholder="Type a message..."
                                    value={messageInput}
                                    onChange={(e) => handleInputChange('text', e.target.value)}
                                />
                            </div>

                            {/* Image URL Input */}
                            <div>
                                <label className="block text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2">Image URL (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full bg-zinc-800 text-white p-3 rounded-lg text-sm border border-zinc-700 focus:outline-none focus:border-green-500 transition-colors"
                                    placeholder="https://example.com/image.jpg"
                                    value={messageImage}
                                    onChange={(e) => handleInputChange('image', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Sender Toggle */}
                        <div className="flex bg-[#111827] p-1 rounded-lg mb-4 border border-[#374151]">
                            <button
                                onClick={() => {
                                    setIsSender(false);
                                    if (editingId) updateLiveMessage('isSender', false);
                                }}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!isSender ? 'bg-[#374151] text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
                            >
                                📥 Receiver
                            </button>
                            <button
                                onClick={() => {
                                    setIsSender(true);
                                    if (editingId) updateLiveMessage('isSender', true);
                                }}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${isSender ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
                            >
                                📤 Sender
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="text-gray-500 text-xs mb-1 block">Time</label>
                                <input
                                    type="text"
                                    value={messageTime}
                                    onChange={(e) => handleInputChange('time', e.target.value)}
                                    placeholder="10:00 AM"
                                    className="w-full bg-[#111827] border border-[#374151] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="text-gray-500 text-xs mb-1 block">Status</label>
                                <select
                                    value={messageStatus}
                                    onChange={(e) => {
                                        setMessageStatus(e.target.value);
                                        if (editingId) updateLiveMessage('status', e.target.value);
                                    }}
                                    className="w-full bg-[#111827] border border-[#374151] rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                                >
                                    <option value="read">Read (Blue)</option>
                                    <option value="delivered">Delivered (Gray)</option>
                                    <option value="sent">Sent (1 Tick)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {editingId ? (
                                <button
                                    onClick={handleDoneEditing}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2"
                                >
                                    <span className="text-xs">Done Editing</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddMessage}
                                    className={`flex-1 py-2 rounded-lg font-medium transition text-sm text-white shadow-lg ${isSender ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20' : 'bg-[#374151] hover:bg-[#4b5563] shadow-gray-900/20'}`}
                                >
                                    Add Message
                                </button>
                            )}
                        </div>
                    </div >

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Conversation</h3>
                        <div className="space-y-2">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    onClick={() => handleEditMessage(msg)}
                                    className={`group flex items-center justify-between p-3 bg-[#1f2937] border rounded-lg transition cursor-pointer ${editingId === msg.id ? 'border-blue-500 bg-blue-500/10' : 'border-[#374151] hover:border-blue-500/50'}`}
                                >
                                    <div className="truncate text-sm text-gray-300 max-w-[180px]">
                                        <span className="mr-2">{msg.isSender ? '📤' : '📥'}</span>
                                        {msg.text}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{msg.time}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                                            className="text-gray-500 hover:text-red-400 p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {messages.length === 0 && <div className="text-gray-500 text-sm text-center py-4">No messages yet. Start typing above!</div>}
                        </div>
                    </div>
                </div >
            )}

            {
                activeTab === 'settings' && (
                    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider">Appearance</h3>
                            <div className="bg-[#1f2937] p-4 rounded-xl border border-[#374151] space-y-4">
                                <div>
                                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Platform Style</label>
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full bg-[#111827] border border-[#374151] text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition cursor-pointer appearance-none"
                                    >
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="imessage">iMessage (iOS)</option>
                                        <option value="telegram">Telegram</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Device Size</label>
                                    <select
                                        value={deviceModel}
                                        onChange={(e) => setDeviceModel(e.target.value)}
                                        className="w-full bg-[#111827] border border-[#374151] text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition cursor-pointer appearance-none"
                                    >
                                        {Object.entries(deviceModels).map(([key, model]) => (
                                            <option key={key} value={key}>{model.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-[#374151] mt-2">
                                    <label className="text-gray-300 text-sm font-medium">Dark Mode</label>
                                    <button
                                        onClick={() => setChatDarkMode(!chatDarkMode)}
                                        className={`w-11 h-6 rounded-full flex items-center transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-[2px] ${chatDarkMode ? 'bg-blue-600' : 'bg-gray-600'}`}
                                    >
                                        <span
                                            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${chatDarkMode ? 'translate-x-[20px]' : 'translate-x-0'}`}
                                        />
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mt-4">Chat Identity</h3>
                            <div className="grid gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-gray-500 text-xs">Contact Name</label>
                                    <input
                                        type="text"
                                        value={chatTitle}
                                        onChange={(e) => setChatTitle(e.target.value)}
                                        className="w-full bg-[#111827] border border-[#374151] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-gray-500 text-xs">Subtitle / Status</label>
                                    <input
                                        type="text"
                                        value={chatSubtitle}
                                        onChange={(e) => setChatSubtitle(e.target.value)}
                                        className="w-full bg-[#111827] border border-[#374151] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-gray-500 text-xs">Avatar URL</label>
                                    <input
                                        type="text"
                                        value={chatAvatar}
                                        onChange={(e) => setChatAvatar(e.target.value)}
                                        placeholder="https://example.com/avatar.jpg"
                                        className="w-full bg-[#111827] border border-[#374151] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <p className="text-[10px] text-gray-500">Leave empty to use auto-generated avatar</p>
                                </div>
                                {theme === 'whatsapp' && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-gray-500 text-xs">Chat Background (URL)</label>
                                        <input
                                            type="text"
                                            value={chatBackgroundImage}
                                            onChange={(e) => setChatBackgroundImage(e.target.value)}
                                            placeholder="https://example.com/bg.jpg"
                                            className="w-full bg-[#111827] border border-[#374151] rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                        <p className="text-[10px] text-gray-500">Overrides default wallpaper.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default EditorPanel;
