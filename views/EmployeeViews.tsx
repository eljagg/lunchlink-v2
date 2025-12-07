import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
// SAFE IMPORTS: Ensures all types are available
import { Order, MenuCategory, MenuIssue, Message, Comment } from '../types';
import { Calendar, Utensils, FileText, ChevronRight, ChevronLeft, AlertCircle, MessageCircle, X, Clock, CheckCircle, XCircle, Send, MessageSquare } from 'lucide-react';
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
  const { menus, placeOrder, currentUser, reportIssue, menuIssues, appConfig } = useStore();
  const getTodayStr = () => new Date().toLocaleDateString('en-CA');
  
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [weekOffset, setWeekOffset] = useState(0); 
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const [isIssueDrawerOpen, setIsIssueDrawerOpen] = useState(false);
  const [issueText, setIssueText] = useState('');
  
  const menuForDay = menus.find(m => m.date === selectedDate) || { id: 'temp-empty', date: selectedDate, items: [], notes: '' };
  const myIssues = menuIssues.filter(i => i.date === selectedDate && i.userId === currentUser?.id);

  const isPastCutoff = () => {
      if (selectedDate !== getTodayStr()) return false;
      const now = new Date();
      const [cutoffHour, cutoffMinute] = (appConfig?.orderCutoffTime || '10:30').split(':').map(Number);
      const cutoff = new Date();
      cutoff.setHours(cutoffHour, cutoffMinute, 0);
      return now > cutoff;
  };

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

  const validateOrder = () => {
      if (menuForDay.items.length === 0) return { valid: false, message: "This menu is not yet available for ordering." };
      return { valid: true };
  };

  const handleOrder = () => {
    if (!currentUser || menuForDay.items.length === 0) return;
    const validation = validateOrder();
    if (!validation.valid) { if(!confirm(`Warning: ${validation.message}\n\nProceed anyway?`)) return; }
    const newOrder: Order = { id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, menuId: menuForDay.id, selectedItemIds: selectedItems, date: selectedDate, specialInstructions: specialInstructions, status: 'Pending', timestamp: Date.now() };
    placeOrder(newOrder);
    alert(`Order placed for ${selectedDate}!`);
    setSelectedItems([]);
    setSpecialInstructions('');
  };

  const handleReportIssue = () => {
      if (!issueText.trim() || !currentUser) return;
      const newIssue: MenuIssue = { id: Date.now().toString(), userId: currentUser.id, date: selectedDate, issue: issueText, status: 'Open', isReadByChef: false, timestamp: Date.now() };
      reportIssue(newIssue);
      setIssueText('');
      alert("Issue reported.");
      setIsIssueDrawerOpen(false); 
  };

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(i => i !== id));
    else setSelectedItems([...selectedItems, id]);
  };

  return (
    <div className="space-y-6 pb-32 relative">
      <div className="bg-yellow-300 border-2 border-yellow-400 p-4 text-center rounded-lg shadow-sm"><h1 className="text-xl md:text-2xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">Facey Commodity Limited - Lunch Menu</h1><p className="font-bold text-red-700 whitespace-pre-wrap">{menuForDay.notes || "Menu details for this day have not been published yet."}</p></div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
        <div className="flex justify-between items-center mb-4"><div className="flex flex-col"><h2 className="text-xl font-bold text-gray-800 flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-600" />Menu For the Week</h2><span className="text-xl md:text-2xl font-bold text-blue-600 ml-7 mt-1">{getDynamicRangeLabel()}</span></div><div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1"><button onClick={() => setWeekOffset(weekOffset - 1)} className="p-1 hover:bg-white rounded-full shadow-sm"><ChevronLeft className="w-4 h-4" /></button><button onClick={() => setWeekOffset(weekOffset + 1)} className="p-1 hover:bg-white rounded-full shadow-sm"><ChevronRight className="w-4 h-4" /></button></div></div>
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2">{weekDates.map((dateObj) => { const dateStr = toLocalISOString(dateObj); const isSelected = dateStr === selectedDate; const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); const dayNum = dateObj.getDate(); const hasMenu = menus.some(m => m.date === dateStr); return (<button key={dateStr} onClick={() => setSelectedDate(dateStr)} className={`flex flex-col items-center justify-center flex-shrink-0 w-36 h-28 p-2 rounded-xl border-2 transition-all relative gap-1 ${isSelected ? 'border-blue-600 bg-blue-600 text-white font-extrabold transform scale-105 shadow-xl z-10' : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-600'}`}><span className="text-xs font-bold uppercase tracking-wide">{dayName}</span><span className="text-3xl font-bold">{dayNum}</span>{hasMenu && <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}</button>); })}</div>
      </div>
      <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-gray-700">Menu for {formatDateDisplay(selectedDate)}</h3></div>
      <div className="space-y-6"><MenuGrid items={menuForDay.items} selectedItemIds={selectedItems} onItemClick={toggleItem} /><div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-600"><label className="block text-sm font-medium text-gray-700 mb-2">Signature / Special Requests</label><div className="relative"><FileText className="absolute top-3 left-3 text-gray-400 w-5 h-5" /><textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} className="w-full pl-10 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 h-20 bg-gray-100 text-gray-800" placeholder="Any allergies or special instructions..." /></div></div></div>
      {!isIssueDrawerOpen && (<button onClick={() => setIsIssueDrawerOpen(true)} className="fixed right-0 top-[40%] z-50 bg-slate-800 text-white font-bold py-4 px-3 rounded-l-xl shadow-xl flex flex-col items-center gap-2 transition-transform hover:-translate-x-1 border-l-2 border-y-2 border-white"><AlertCircle className="w-6 h-6 text-red-400" /><span className="text-xs uppercase writing-vertical-rl" style={{ writingMode: 'vertical-rl' }}>Report Issue</span></button>)}
      {selectedItems.length > 0 && (<div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 flex justify-center items-center md:px-8">{isPastCutoff() ? (<div className="bg-gray-400 text-white px-10 py-4 rounded-full font-bold flex items-center space-x-3 cursor-not-allowed"><Clock className="w-6 h-6" /><span>Ordering Closed (Cutoff {appConfig?.orderCutoffTime})</span></div>) : (<button onClick={handleOrder} className="bg-blue-600 text-white px-10 py-4 rounded-full shadow-lg font-bold flex items-center space-x-3 animate-bounce hover:animate-none border-4 border-white text-lg"><Utensils className="w-6 h-6" /><span>Place Order ({selectedItems.length} items)</span></button>)}</div>)}
      <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-200 ${isIssueDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
              <div className="p-6 bg-slate-900 border-b border-slate-800 flex justify-between items-center"><h2 className="text-xl font-bold text-white flex items-center"><AlertCircle className="w-6 h-6 mr-2 text-red-400" />Report Issue</h2><button onClick={() => setIsIssueDrawerOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X className="w-6 h-6" /></button></div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <p className="text-gray-600 text-sm">Did you receive the wrong order? Please let the kitchen know.</p>
                  {myIssues.length > 0 && (<div className="space-y-4"><h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Your Reports Today</h3>{myIssues.map(issue => (<div key={issue.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm"><p className="font-bold text-gray-800 mb-1">"{issue.issue}"</p><div className="flex justify-between items-center mt-2"><span className="text-xs text-gray-400">{new Date(issue.timestamp).toLocaleTimeString()}</span>{issue.chefResponse ? <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-bold">Resolved</span> : <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>}</div>{issue.chefResponse && <div className="mt-3 p-3 bg-green-50 text-green-800 rounded border border-green-100 flex items-start"><MessageCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /><span><strong>Chef:</strong> {issue.chefResponse}</span></div>}</div>))}</div>)}
                  <div><label className="block text-sm font-bold text-gray-700 mb-2">Describe the issue</label><textarea value={issueText} onChange={e => setIssueText(e.target.value)} className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none resize-none text-gray-900 bg-white" placeholder="Type your message here..." /></div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50"><button onClick={handleReportIssue} disabled={!issueText.trim()} className={`w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all ${issueText.trim() ? 'bg-slate-900 hover:bg-black transform hover:scale-[1.02]' : 'bg-gray-400 cursor-not-allowed'}`}>Submit Report</button></div>
          </div>
      </div>
      {isIssueDrawerOpen && <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setIsIssueDrawerOpen(false)}></div>}
    </div>
  );
};

export const OrderHistoryView: React.FC = () => {
  const { orders, currentUser, menus } = useStore();
  const myOrders = orders.filter(o => o.userId === currentUser?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const getItemNames = (menuId: string, itemIds: string[]) => {
      const menu = menus.find(m => m.id === menuId);
      if (!menu) return `${itemIds.length} items`;
      const names = menu.items.filter(i => itemIds.includes(i.id)).map(i => i.name).join(', ');
      return names || `${itemIds.length} items`;
  };
  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border-b border-slate-200"><h2 className="text-2xl font-bold text-gray-800">My Order History</h2></div>
       {myOrders.length === 0 ? <div className="text-center py-20 bg-white rounded-xl shadow-sm"><Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">You haven't placed any orders yet.</p></div> : <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-4 text-gray-600">Date</th><th className="p-4 text-gray-600">Items</th><th className="p-4 text-gray-600">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{myOrders.map(order => (<tr key={order.id} className="hover:bg-slate-50"><td className="p-4"><div className="font-medium text-gray-800">{new Date(order.date).toLocaleDateString()}</div></td><td className="p-4"><p className="text-sm text-gray-600">{getItemNames(order.menuId, order.selectedItemIds)}</p></td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span></td></tr>))}</tbody></table></div>}
    </div>
  );
};

// 3. MESSAGES VIEW (FIXED for white screen)
export const MessagesView: React.FC = () => {
    const { messages, currentUser, sendMessage } = useStore();
    const [newItem, setNewItem] = useState('');
    
    // Safety check: ensure currentUser is loaded
    if (!currentUser) return null;

    const myMessages = messages.filter(m => m.fromUserId === currentUser.id || m.toUserId === currentUser.id || (currentUser.role === 'KITCHEN_ADMIN' && m.toUserId === 'kitchen'));
    
    const handleSend = () => { if (!newItem.trim()) return; sendMessage({ id: Date.now().toString(), fromUserId: currentUser.id, fromUserName: currentUser.fullName, toUserId: 'kitchen', content: newItem, timestamp: Date.now(), read: false }); setNewItem(''); };
    return (<div className="max-w-3xl mx-auto h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200"><div className="p-4 border-b border-slate-100 font-bold text-gray-700">Messages to Kitchen</div><div className="flex-1 overflow-y-auto p-4 space-y-4">{myMessages.map(msg => (<div key={msg.id} className={`flex ${msg.fromUserId === currentUser.id ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-lg ${msg.fromUserId === currentUser.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{msg.fromUserId !== currentUser.id && <p className="text-[10px] font-bold text-gray-500 mb-1">{msg.fromUserName}</p>}<p className="text-sm">{msg.content}</p></div></div>))}</div><div className="p-4 border-t border-slate-100 flex gap-2"><input className="flex-1 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Type a message..." value={newItem} onChange={(e) => setNewItem(e.target.value)} /><button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"><Send className="w-5 h-5" /></button></div></div>);
};

export const FeedbackView: React.FC = () => {
    const { comments, currentUser, addComment } = useStore();
    const [feedback, setFeedback] = useState('');
    const handleSubmit = () => { if (!feedback.trim() || !currentUser) return; addComment({ id: Date.now().toString(), userId: currentUser.id, userName: currentUser.fullName, content: feedback, timestamp: Date.now(), responses: [] }); setFeedback(''); alert("Feedback sent to HR."); };
    return (<div className="max-w-2xl mx-auto space-y-6"><div className="bg-white p-6 rounded-xl shadow-sm"><h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-600"/> Submit Feedback</h2><textarea className="w-full border p-3 rounded-lg h-32 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Describe your issue..." value={feedback} onChange={(e) => setFeedback(e.target.value)} /><button onClick={handleSubmit} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700">Submit Feedback</button></div></div>);
};
