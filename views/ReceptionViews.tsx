import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { Key, RefreshCw, Send, Copy, Plus, X, Users } from 'lucide-react';

export const ReceptionDashboard: React.FC = () => {
    const { appConfig, generateNewGuestCode, currentCompany } = useStore();
    
    // State for the list of people to send to
    const [recipients, setRecipients] = useState<string[]>([]);
    // State for the current text being typed
    const [currentEmailInput, setCurrentEmailInput] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleGenerate = async () => {
        if(confirm("Are you sure? This will invalidate the old code.")) {
            await generateNewGuestCode();
        }
    };

    const handleAddRecipient = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const email = currentEmailInput.trim();
        if (!email) return;

        // Simple validation to prevent duplicates
        if (!recipients.includes(email)) {
            setRecipients([...recipients, email]);
        }
        setCurrentEmailInput('');
    };

    const handleRemoveRecipient = (emailToRemove: string) => {
        setRecipients(recipients.filter(email => email !== emailToRemove));
    };

    const handleSendAll = () => {
        if (recipients.length === 0) {
            alert("Please add at least one recipient.");
            return;
        }

        setIsSending(true);

        // Join all emails with a comma (standard for mailto)
        const allRecipients = recipients.join(',');
        
        const subject = encodeURIComponent("LunchLink Guest Access Code");
        const body = encodeURIComponent(
            `Welcome to ${currentCompany?.name || 'LunchLink'}!\n\n` +
            `Your guest access code for today is: ${appConfig.guestPasscode}\n\n` +
            `Please visit the portal to place your order.`
        );

        // Open email client with ALL recipients
        window.location.href = `mailto:${allRecipients}?subject=${subject}&body=${body}`;

        // Reset UI
        setIsSending(false);
        setRecipients([]);
        // Optional delay for UX
        setTimeout(() => alert(`Opened email draft for ${recipients.length} guests.`), 500);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700">
                <h1 className="text-3xl font-extrabold text-white">Reception Desk</h1>
                <p className="text-slate-400 mt-2">Manage guest access for {currentCompany?.name}</p>
            </div>

            {/* Code Generator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg border-l-8 border-blue-600">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Today's Access Code</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-6xl font-mono font-extrabold text-gray-800 tracking-widest">
                            {appConfig.guestPasscode}
                        </div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(appConfig.guestPasscode)}
                            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                            title="Copy to Clipboard"
                        >
                            <Copy className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                    <button 
                        onClick={handleGenerate}
                        className="mt-6 flex items-center text-blue-600 font-bold hover:text-blue-800 transition"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Generate New Code
                    </button>
                </div>

                {/* Email Sender (Multi-Recipient) */}
                <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700 flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Send className="w-5 h-5 mr-2 text-blue-400" /> Send Code to Guests
                    </h2>
                    
                    {/* The Input Area */}
                    <div className="space-y-4 flex-1">
                        <form onSubmit={handleAddRecipient} className="flex gap-2">
                            <input 
                                type="email" 
                                value={currentEmailInput}
                                onChange={e => setCurrentEmailInput(e.target.value)}
                                className="flex-1 p-3 bg-slate-900 border border-slate-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                                placeholder="Enter guest email..."
                            />
                            <button 
                                type="submit"
                                className="bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg transition"
                                title="Add to list"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </form>

                        {/* The List of "Chips" */}
                        <div className="min-h-[100px] bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                            {recipients.length === 0 ? (
                                <div className="text-slate-500 text-sm text-center py-8 italic">
                                    No recipients added yet.
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {recipients.map((email, idx) => (
                                        <div key={idx} className="flex items-center bg-blue-900/30 border border-blue-500/30 text-blue-200 px-3 py-1 rounded-full text-sm">
                                            <span>{email}</span>
                                            <button 
                                                onClick={() => handleRemoveRecipient(email)}
                                                className="ml-2 hover:text-white transition"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Send Button */}
                    <button 
                        onClick={handleSendAll}
                        disabled={recipients.length === 0 || isSending}
                        className={`mt-4 w-full font-bold py-3 rounded-lg transition flex justify-center items-center
                            ${recipients.length === 0 
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20'
                            }`}
                    >
                        {isSending ? 'Opening Mail Client...' : `Send Code to ${recipients.length > 0 ? recipients.length : ''} Guest${recipients.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};
