import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { Order, MenuCategory, MenuIssue, Message, Comment } from '../types';
import { Calendar, Utensils, FileText, ChevronRight, ChevronLeft, AlertCircle, MessageCircle, X, Clock, CheckCircle, XCircle, Send, MessageSquare, Info, TrendingUp } from 'lucide-react';
import { MenuGrid } from '../components/MenuGrid';

const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 10);
};
const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00'); 
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// 1. ORDER LUNCH VIEW
export const OrderLunchView: React.FC = () => {
  const { menus, placeOrder, currentUser, reportIssue, menuIssues, appConfig, orders } = useStore();
  const getTodayStr = () => new Date().toLocaleDateString('en-CA');
  
  // Smart Date Initialization
  const getInitialDateState = () => {
      const today = new Date();
      const todayStr = toLocalISOString(today);
      const [cutoffHour, cutoffMinute] = (appConfig?.orderCutoffTime || '10:30').split(':').map(Number);
      const cutoff = new Date();
      cutoff.setHours(cutoffHour, cutoffMinute, 0);

      if (today > cutoff) {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return { date: toLocalISOString(tomorrow), autoSwitched: true };
      }
      return { date: todayStr, autoSwitched: false };
  };

  const initialState = getInitialDateState();
  const [selectedDate, setSelectedDate] = useState(initialState.date);
  const [showAutoSwitchMsg, setShowAutoSwitchMsg] = useState(initialState.autoSwitched);
  const [weekOffset, setWeekOffset] = useState(0); 
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const [isIssueDrawerOpen, setIsIssueDrawerOpen] = useState(false);
  const [issueText, setIssueText] = useState('');
  
  // FIXED: STRICT FILTERING BY COMPANY ID
  // This prevents the app from showing a blank "ghost" menu if multiple exist for the same date
  const menuForDay = menus.find(m => 
      m.date === selectedDate && 
      m.companyId === currentUser?.companyId
  ) || { id: 'temp-empty', date: selectedDate, items: [], notes: '' };

  const myIssues = menuIssues.filter(i => i.date === selectedDate && i.userId === currentUser?.id);

  // Dynamic Branding
  const brandColor = useStore().currentCompany?.primaryColor || '#eab308';
  const brandName = useStore().currentCompany?.name || appConfig?.companyName || 'LunchLink';

  const getWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysSinceMonday + (weekOffset * 7));
    const week = [];
    for (let i = 0; i < 7; i++) { const d = new Date(monday); d.setDate(monday.getDate() + i); week.push(d); }
    return week;
  };
  const weekDates = getWeekRange();

  const weeklyOrdersCount = weekDates.filter(d => {
      const dStr = toLocalISOString(d);
      return orders.some(o => o.date === dStr && o.userId === currentUser?.id);
  }).length;

  const isPastCutoff = () => {
      const todayStr = toLocalISOString(new Date());
      if (selectedDate !== todayStr) return false;
      const now = new Date();
      const [cutoffHour, cutoffMinute] = (appConfig?.orderCutoffTime || '10:30').split(':').map(Number);
      const cutoff = new Date();
      cutoff.setHours(cutoffHour, cutoffMinute, 0);
      return now > cutoff;
  };

  const getDynamicRangeLabel = () => {
      const monday = weekDates[0];
      let endDate = weekDates[4]; 
      const satDateStr = toLocalISOString(weekDates[5]);
      if (menus.some(m => m.date === satDateStr)) endDate = weekDates[5];
      const sunDateStr = toLocalISOString(weekDates[6]);
      if (menus.some(m => m.date === sunDateStr)) endDate = weekDates[6];
      const startStr = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${startStr} - ${endStr}`;
  };

  const handleOrder = () => {
    if (!currentUser || menuForDay.items.length === 0) return;
    const newOrder: Order = { id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, menuId: menuForDay.id, selectedItemIds: selectedItems, date: selectedDate, specialInstructions: specialInstructions, status: 'Pending', timestamp: Date.now(), companyId: currentUser.companyId };
    placeOrder(newOrder);
    alert(`Order placed for ${selectedDate}!`);
    setSelectedItems([]);
    setSpecialInstructions('');
  };

  const handleReportIssue = () => {
      if (!issueText.trim() || !currentUser) return;
      reportIssue({ id: Date.now().toString(), userId: currentUser.id, date: selectedDate, issue: issueText, status: 'Open', isReadByChef: false, timestamp: Date.now(), companyId: currentUser.companyId });
      setIssueText('');
      alert("Issue reported.");
      setIsIssueDrawerOpen(false); 
  };

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(i => i !== id));
    else setSelectedItems([...selectedItems, id]);
  };

  const selectedItemsData = menuForDay.items.filter(i => selectedItems.includes(i.id));
  const totalCalories = selectedItemsData.reduce((sum, item) => sum + item.calories, 0);

  return (
    <div className="space-y-6 pb-32 relative">
      
      {/* INJECTED STYLES FOR MARQUEE ANIMATION */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        /* Pause animation on hover so user can read */
        .marquee-container:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>

      {/* AUTO-SWITCH NOTIFICATION BANNER (SCROLLING TICKER) */}
      {showAutoSwitchMsg && (
          <div className="bg-blue-900 border-y border-blue-500 text-white shadow-lg relative overflow-hidden h-12 flex items-center marquee-container group">
              {/* Static Icon on Left */}
              <div className="absolute left-0 top-0 bottom-0 bg-blue-800 z-10 px-4 flex items-center shadow-lg">
                  <Info className="w-5 h-5 text-blue-300 animate-pulse" />
              </div>

              {/* Scrolling Text */}
              <div className="flex-1 overflow-hidden relative h-full">
                  <div className="animate-marquee whitespace-nowrap absolute top-1/2 -translate-y-1/2 flex items-center gap-8">
                      <span className="font-bold text-sm tracking-wide">NOTICE: It is past the {appConfig?.orderCutoffTime} cutoff time.</span>
                      <span className="text-sm text-blue-200">We have automatically switched your view to Tomorrow's Menu ({formatDateDisplay(selectedDate)}).</span>
                      <span className="font-bold text-sm tracking-wide text-blue-300">--- PLEASE CHECK YOUR DATE SELECTION ---</span>
                  </div>
              </div>

              {/* Close Button on Right */}
              <div className="absolute right-0 top-0 bottom-0 bg-blue-800 z-10 px-4 flex items-center shadow-lg cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => setShowAutoSwitchMsg(false)}>
                  <X className="w-5 h-5 text-white" />
              </div>
          </div>
      )}

      {/* HEADER BANNER */}
      <div className="border-2 p-6 text-center rounded-xl shadow-lg transition-colors" style={{ borderColor: brandColor, backgroundColor: `${brandColor}15` }}>
          <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight mb-2" style={{ color: brandColor }}>{brandName} - Lunch Menu</h1>
          <p className="font-bold text-slate-300 whitespace-pre-wrap">{menuForDay.notes || "Menu details for this day have not been published yet."}</p>
      </div>

      {/* DATE SELECTOR (Darker) */}
      <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 mt-8">
        <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
                <h2 className="text-xl font-bold text-white flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-400" />Menu For the Week</h2>
                <span className="text-xl md:text-2xl font-bold text-blue-400 ml-7 mt-1">{getDynamicRangeLabel()}</span>
            </div>
            
            <div className="hidden md:flex items-center gap-4 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <div><p className="text-xs text-slate-400 uppercase font-bold">Weekly Status</p><p className="text-sm font-bold text-white">{weeklyOrdersCount} / 5 Orders Placed</p></div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800 rounded-full p-1"><button onClick={() => setWeekOffset(weekOffset - 1)} className="p-1 hover:bg-slate-700 rounded-full text-white"><ChevronLeft className="w-4 h-4" /></button><button onClick={() => setWeekOffset(weekOffset + 1)} className="p-1 hover:bg-slate-700 rounded-full text-white"><ChevronRight className="w-4 h-4" /></button></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
            {weekDates.map((dateObj) => { 
                const dateStr = toLocalISOString(dateObj); 
                const isSelected = dateStr === selectedDate; 
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); 
                const dayNum = dateObj.getDate(); 
                
                // FIXED: Check if menu exists FOR THIS COMPANY
                const hasMenu = menus.some(m => m.date === dateStr && m.companyId === currentUser?.companyId); 
                
                return (<button key={dateStr} onClick={() => { setSelectedDate(dateStr); setShowAutoSwitchMsg(false); }} className={`flex flex-col items-center justify-center flex-shrink-0 w-36 h-28 p-2 rounded-xl border-2 transition-all relative gap-1 ${isSelected ? 'border-blue-600 bg-blue-600 text-white font-extrabold transform scale-105 shadow-xl z-10' : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400'}`}><span className="text-xs font-bold uppercase tracking-wide">{dayName}</span><span className="text-3xl font-bold">{dayNum}</span>{hasMenu && <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}</button>); 
            })}
        </div>
      </div>

      <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-300">Menu for {formatDateDisplay(selectedDate)}</h3></div>

      {/* --- SPLIT LAYOUT (Dark) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3"><MenuGrid items={menuForDay.items} selectedItemIds={selectedItems} onItemClick={toggleItem} /></div>
          <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-700">
                  <h4 className="font-bold text-white flex items-center mb-4"><Info className="w-4 h-4 mr-2 text-blue-400" /> Meal Summary</h4>
                  {selectedItems.length === 0 ? (<p className="text-sm text-slate-500 italic">Select items to see stats.</p>) : (<div className="space-y-2"><div className="flex justify-between text-sm text-slate-300"><span>Items:</span><span className="font-bold text-white">{selectedItems.length}</span></div><div className="flex justify-between text-sm text-slate-300"><span>Calories:</span><span className="font-bold text-green-400">{totalCalories} cal</span></div><div className="mt-4 pt-4 border-t border-slate-700"><div className="flex gap-2 flex-wrap">{selectedItemsData.flatMap(i => i.dietaryInfo || []).filter((v, i, a) => a.indexOf(v) === i).map(tag => (<span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 text-[10px] rounded-full border border-slate-600">{tag}</span>))}</div></div></div>)}
              </div>
              <div className="bg-slate-800 p-5 rounded-xl shadow-sm border-l-4 border-blue-600 flex-1 flex flex-col">
                  <label className="block text-sm font-bold text-slate-300 mb-2">Special Requests</label>
                  <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} className="w-full p-3 border border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-900 text-white text-sm resize-none flex-1 min-h-[150px]" placeholder="Allergies, no gravy, etc..." />
              </div>
          </div>
      </div>

      {!isIssueDrawerOpen && (<button onClick={() => setIsIssueDrawerOpen(true)} className="fixed right-0 top-[40%] z-50 bg-slate-800 text-white font-bold py-4 px-3 rounded-l-xl shadow-xl flex flex-col items-center gap-2 transition-transform hover:-translate-x-1 border-l-2 border-y-2 border-slate-700"><AlertCircle className="w-6 h-6 text-red-400" /><span className="text-xs uppercase writing-vertical-rl" style={{ writingMode: 'vertical-rl' }}>Report Issue</span></button>)}

      {selectedItems.length > 0 && (<div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 shadow-2xl z-40 flex justify-center items-center md:px-8">{isPastCutoff() ? (<div className="bg-slate-700 text-slate-400 px-10 py-4 rounded-full font-bold flex items-center space-x-3 cursor-not-allowed border border-slate-600"><Clock className="w-6 h-6" /><span>Ordering Closed (Cutoff {appConfig?.orderCutoffTime})</span></div>) : (<button onClick={handleOrder} className="bg-blue-600 text-white px-10 py-4 rounded-full shadow-lg font-bold flex items-center space-x-3 animate-bounce hover:animate-none border-4 border-slate-900 text-lg"><Utensils className="w-6 h-6" /><span>Place Order ({selectedItems.length} items)</span></button>)}</div>)}

      <div className={`fixed inset-y-0 right-0 w-96 bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-800 ${isIssueDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}><div className="h-full flex flex-col"><div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center"><h2 className="text-xl font-bold text-white flex items-center"><AlertCircle className="w-6 h-6 mr-2 text-red-400" />Report Issue</h2><button onClick={() => setIsIssueDrawerOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6" /></button></div><div className="flex-1 overflow-y-auto p-6 space-y-6"><p className="text-slate-400 text-sm">Did you receive the wrong order? Please let the kitchen know.</p>{myIssues.length > 0 && (<div className="space-y-4"><h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Reports Today</h3>{myIssues.map(issue => (<div key={issue.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-sm"><p className="font-bold text-white mb-1">"{issue.issue}"</p><div className="flex justify-between items-center mt-2"><span className="text-xs text-slate-500">{new Date(issue.timestamp).toLocaleTimeString()}</span>{issue.chefResponse ? <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded-full font-bold">Resolved</span> : <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">Pending</span>}</div>{issue.chefResponse && <div className="mt-3 p-3 bg-green-900/20 text-green-300 rounded border border-green-900/30 flex items-start"><MessageCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /><span><strong>Chef:</strong> {issue.chefResponse}</span></div>}</div>))}</div>)}<div><label className="block text-sm font-bold text-slate-300 mb-2">Describe the issue</label><textarea value={issueText} onChange={e => setIssueText(e.target.value)} className="w-full h-32 p-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none text-gray-900 bg-white" placeholder="Type your message here..." /></div></div><div className="p-6 border-t border-gray-100 bg-gray-50"><button onClick={handleReportIssue} disabled={!issueText.trim()} className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all ${issueText.trim() ? 'bg-slate-900 hover:bg-black transform hover:scale-[1.02]' : 'bg-gray-400 cursor-not-allowed'}`}>Submit Report</button></div></div></div>{isIssueDrawerOpen && <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setIsIssueDrawerOpen(false)}></div>}
    </div>
  );
};

export const OrderHistoryView: React.FC = () => {
  const { orders, currentUser, menus } = useStore();
  const myOrders = orders.filter(o => o.userId === currentUser?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getItemNames = (menuId: string, itemIds: string[]) => { const menu = menus.find(m => m.id === menuId); if (!menu) return `${itemIds.length} items`; const names = menu.items.filter(i => itemIds.includes(i.id)).map(i => i.name).join(', '); return names || `${itemIds.length} items`; };
  return (<div className="space-y-6"><div className="bg-slate-800 p-6 rounded-xl shadow-sm border-b border-slate-700"><h2 className="text-2xl font-bold text-white">My Order History</h2></div>{myOrders.length === 0 ? <div className="text-center py-20 bg-slate-800 rounded-xl shadow-sm border border-slate-700"><Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">You haven't placed any orders yet.</p></div> : <div className="bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-700"><table className="w-full text-left"><thead className="bg-slate-900 border-b border-slate-700"><tr><th className="p-4 text-gray-600">Date</th><th className="p-4 text-gray-600">Items</th><th className="p-4 text-gray-600">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{myOrders.map(order => (<tr key={order.id} className="hover:bg-slate-50"><td className="p-4"><div className="font-medium text-gray-800">{new Date(order.date).toLocaleDateString()}</div></td><td className="p-4"><p className="text-sm text-gray-600">{getItemNames(order.menuId, order.selectedItemIds)}</p></td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span></td></tr>))}</tbody></table></div>}
    </div>
  );
};

export const MessagesView: React.FC = () => {
    const { messages, currentUser, sendMessage } = useStore();
    const [newItem, setNewItem] = useState('');
    if (!currentUser) return null;
    const myMessages = messages.filter(m => m.fromUserId === currentUser.id || m.toUserId === currentUser.id || (currentUser.role === 'KITCHEN_ADMIN' && m.toUserId === 'kitchen'));
    const handleSend = () => { if (!newItem.trim()) return; sendMessage({ id: Date.now().toString(), fromUserId: currentUser.id, fromUserName: currentUser.fullName, toUserId: 'kitchen', content: newItem, timestamp: Date.now(), read: false }); setNewItem(''); };
    return (<div className="max-w-3xl mx-auto h-[600px] flex flex-col bg-slate-800 rounded-xl shadow-sm border border-slate-200"><div className="p-4 border-b border-slate-100 font-bold text-gray-700">Messages to Kitchen</div><div className="flex-1 overflow-y-auto p-4 space-y-4">{myMessages.map(msg => (<div key={msg.id} className={`flex ${msg.fromUserId === currentUser.id ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-lg ${msg.fromUserId === currentUser.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}><p className="text-sm">{msg.content}</p></div></div>))}</div><div className="p-4 border-t border-slate-100 flex gap-2"><input className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Type a message..." value={newItem} onChange={(e) => setNewItem(e.target.value)} /><button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Send className="w-5 h-5" /></button></div></div>);
};

export const FeedbackView: React.FC = () => {
    const { comments, currentUser, addComment } = useStore();
    const [feedback, setFeedback] = useState('');
    const handleSubmit = () => { if (!feedback.trim() || !currentUser) return; addComment({ id: Date.now().toString(), userId: currentUser.id, userName: currentUser.fullName, content: feedback, timestamp: Date.now(), responses: [] }); setFeedback(''); alert("Feedback sent to HR."); };
    return (<div className="max-w-2xl mx-auto space-y-6"><div className="bg-slate-800 p-6 rounded-xl shadow-sm"><h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-600"/> Submit Feedback</h2><textarea className="w-full border p-3 rounded-lg h-32 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Describe your issue..." value={feedback} onChange={(e) => setFeedback(e.target.value)} /><button onClick={handleSubmit} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700">Submit Feedback</button></div></div>);
};
