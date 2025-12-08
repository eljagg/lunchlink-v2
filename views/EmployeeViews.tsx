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
  
  const menuForDay = menus.find(m => m.date === selectedDate) || { id: 'temp-empty', date: selectedDate, items: [], notes: '' };
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
            {weekDates.map((dateObj) => { const dateStr = toLocalISOString(dateObj); const isSelected = dateStr === selectedDate; const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }); const dayNum = dateObj.getDate(); const hasMenu = menus.some(m => m.date === dateStr); return (<button key={dateStr} onClick={() => { setSelectedDate(dateStr); setShowAutoSwitchMsg(false); }} className={`flex flex-col items-center justify-center flex-shrink-0 w-36 h-28 p-2 rounded-xl border-2 transition-all relative gap-1 ${isSelected ? 'border-blue-600 bg-blue-600 text-white font-extrabold transform scale-105 shadow-xl z-10' : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400'}`}><span className="text-xs font-bold uppercase tracking-wide">{dayName}</span><span className="text-3xl font-bold">{dayNum}</span>{hasMenu && <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}</button>); })}
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

      <div className={`fixed inset-y-0 right-0 w-96 bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-800 ${isIssueDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}><div className="h-full flex flex-col"><div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center"><h2 className="text-xl font-bold text-white flex items-center"><AlertCircle className="w-6 h-6 mr-2 text-red-400" />Report Issue</h2><button onClick={() => setIsIssueDrawerOpen(false)} className="p-2 hover:bg-slate-80
