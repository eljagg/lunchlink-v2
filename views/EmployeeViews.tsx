// =========================================================
// 3. MESSAGES VIEW (Updated logic for Chef visibility)
// =========================================================
export const MessagesView: React.FC = () => {
    const { messages, currentUser, sendMessage } = useStore();
    const [newItem, setNewItem] = useState('');
    
    // FILTER LOGIC:
    // 1. If I sent it (fromMe)
    // 2. If it was sent TO me (toMe)
    // 3. IF I AM THE CHEF, show messages sent to 'kitchen'
    const myMessages = messages.filter(m => 
        m.fromUserId === currentUser?.id || 
        m.toUserId === currentUser?.id ||
        (currentUser?.role === 'KITCHEN_ADMIN' && m.toUserId === 'kitchen')
    );

    const handleSend = () => {
        if (!newItem.trim() || !currentUser) return;
        sendMessage({
            id: Date.now().toString(),
            fromUserId: currentUser.id,
            fromUserName: currentUser.fullName,
            toUserId: 'kitchen', 
            content: newItem,
            timestamp: Date.now(),
            read: false
        });
        setNewItem('');
    };

    return (
        <div className="max-w-3xl mx-auto h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-100 font-bold text-gray-700">Messages to Kitchen</div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {myMessages.length === 0 && <p className="text-center text-gray-400 mt-10">No messages yet.</p>}
                {myMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.fromUserId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.fromUserId === currentUser?.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                            {msg.fromUserId !== currentUser?.id && <p className="text-[10px] font-bold text-gray-500 mb-1">{msg.fromUserName}</p>}
                            <p className="text-sm">{msg.content}</p>
                            <span className="text-[10px] opacity-70 block mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-100 flex gap-2">
                <input className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Type a message..." value={newItem} onChange={(e) => setNewItem(e.target.value)} />
                <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Send className="w-5 h-5" /></button>
            </div>
        </div>
    );
};
