import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { Key, RefreshCw, Send, CheckCircle, Copy } from 'lucide-react';

export const ReceptionDashboard: React.FC = () => {
    const { appConfig, generateNewGuestCode, currentCompany } = useStore();
    const [email, setEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleGenerate = async () => {
        if(confirm("Are you sure? This will invalidate the old code.")) {
            await generateNewGuestCode();
        }
    };

    const handleEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);

        const subject = encodeURIComponent("LunchLink Guest Access Code");
        const body = encodeURIComponent(
            `Welcome to ${currentCompany?.name || 'LunchLink'}!\n\n` +
            `Your guest access code for today is: ${appConfig.guestPasscode}\n\n` +
            `Please visit the portal to place your order.`
        );

        // Open the default email client with pre-filled details
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

        // Reset the UI
        setIsSending(false);
        setEmail('');
        // Optional: Slight delay to allow the mail client to trigger before clearing
        setTimeout(() => alert(`Opened email draft for ${email}`), 500);
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

                {/* Email Sender */}
                <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Send className="w-5 h-5 mr-2 text-blue-400" /> Send Code to Guest
                    </h2>
                    <form onSubmit={handleEmail} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Guest Email</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="guest@external.com"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSending}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
                        >
                            {isSending ? 'Sending...' : 'Send Access Code'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
