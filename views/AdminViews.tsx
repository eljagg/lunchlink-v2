import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { MenuCategory, MasterFoodItem, DailyMenu, Company } from '../types';
import { 
  Plus, Trash2, MessageCircle, Utensils, Search, Copy, CheckCircle, 
  Clock, AlertCircle, Save, BookOpen, Edit2, X, Building 
} from 'lucide-react';
import { MenuGrid } from '../components/MenuGrid';

const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 10);
};
const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00'); 
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// =========================================================
// 1. KITCHEN DASHBOARD
// =========================================================
export const AdminKitchenDashboard: React.FC = () => {
  const { orders, menuIssues, respondToIssue } = useStore();
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const today = toLocalISOString(new Date());
  const activeIssues = menuIssues.filter(i => i.status === 'Open');
  const resolvedIssues = menuIssues.filter(i => i.status === 'Resolved');
  const todaysOrders = orders.filter(o => o.date === today);
  const pendingOrders = todaysOrders.filter(o => o.status === 'Pending').length;

  const handleReply = (issueId: string) => {
      if (!replyText[issueId]) return;
      respondToIssue(issueId, replyText[issueId]);
      alert("Response sent.");
      setReplyText(prev => ({ ...prev, [issueId]: '' }));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-white">Kitchen Command Center</h1>
          <span className="text-slate-400 font-medium">{formatDateDisplay(today)}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border-l-8 border-blue-600">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Orders Today</h3>
                      <p className="text-5xl font-extrabold text-white mt-2">{todaysOrders.length}</p>
                  </div>
                  <div className="p-3 bg-blue-900/30 rounded-full"><Utensils className="w-6 h-6 text-blue-400" /></div>
              </div>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border-l-8 border-yellow-500">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Prep</h3>
                      <p className="text-5xl font-extrabold text-white mt-2">{pendingOrders}</p>
                  </div>
                  <div className="p-3 bg-yellow-900/30 rounded-full"><Clock className="w-6 h-6 text-yellow-500" /></div>
              </div>
          </div>
          <div className={`p-8 rounded-2xl shadow-lg border-l-8 ${activeIssues.length > 0 ? 'bg-red-900/20 border-red-600' : 'bg-slate-800 border-green-500'}`}>
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className={`${activeIssues.length > 0 ? 'text-red-400' : 'text-slate-400'} text-xs font-bold uppercase tracking-wider`}>Active Issues</h3>
                      <p className={`text-5xl font-extrabold mt-2 ${activeIssues.length > 0 ? 'text-red-500' : 'text-white'}`}>{activeIssues.length}</p>
                  </div>
                  <div className={`p-3 rounded-full ${activeIssues.length > 0 ? 'bg-red-900/50 animate-pulse' : 'bg-green-900/30'}`}><AlertCircle className={`w-6 h-6 ${activeIssues.length > 0 ? 'text-red-500' : 'text-green-500'}`} /></div>
              </div>
          </div>
      </div>

      <div className="bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-700">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center"><MessageCircle className="w-5 h-5 mr-2 text-blue-400" /> Live Feedback Feed</h2>
              {activeIssues.length > 0 && <span className="animate-bounce px-4 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">{activeIssues.length} NEEDS ATTENTION</span>}
          </div>
          <div className="p-6 space-y-6">
              {activeIssues.length === 0 && resolvedIssues.length === 0 && <div className="text-center py-12"><CheckCircle className="w-16 h-16 text-green-900 mx-auto mb-4" /><p className="text-slate-500 font-medium">All clear! No issues reported.</p></div>}
              {activeIssues.map(issue => (
                  <div key={issue.id} className="border border-red-500/30 bg-red-900/10 rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                          <div><span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide mr-2">New Alert</span><span className="text-xs text-slate-400 font-mono">{new Date(issue.timestamp).toLocaleTimeString()}</span></div>
                          <span className="text-xs font-bold text-slate-300 bg-slate-700 px-2 py-1 rounded border border-slate-600">ID: {issue.userId}</span>
                      </div>
                      <p className="font-bold text-white text-xl mb-6">"{issue.issue}"</p>
                      <div className="flex gap-2">
                          <input type="text" placeholder="Write a reply..." className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none" value={replyText[issue.id] || ''} onChange={e => setReplyText(prev => ({ ...prev, [issue.id]: e.target.value }))} />
                          <button onClick={() => handleReply(issue.id)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg">Reply & Close</button>
                      </div>
                  </div>
              ))}
              {resolvedIssues.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-700">
                      <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 tracking-wider">Recently Resolved</h4>
                      <div className="space-y-2">
                        {resolvedIssues.slice(0, 5).map(issue => (<div key={issue.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-700 text-sm"><span className="text-slate-300 font-medium">"{issue.issue}"</span><div className="flex items-center text-green-400 bg-green-900/30 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1" /> Fixed</div></div>))}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

// =========================================================
// 2. MENU MANAGER (With Menu Bank)
// =========================================================
export const AdminMenuManager: React.FC = () => {
  const { menus, masterFoodItems, addMenu, updateMenu, saveTemplate, loadTemplate, menuTemplates, deleteTemplate, currentUser } = useStore();
  const [selectedDate, setSelectedDate] = useState(toLocalISOString(new Date()));
  const [weekOffset, setWeekOffset] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('Protein');
  const [selectedMasterItemId, setSelectedMasterItemId] = useState('');
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [mode, setMode] = useState<'SAVE' | 'LOAD'>('LOAD');

  const currentMenu = menus.find(m => m.date === selectedDate);
  const menuItems = currentMenu?.items || [];
  const dropdownOptions = masterFoodItems.filter(item => item.category === selectedCategory);

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

  const handleAddItem = () => {
      if (!selectedMasterItemId) return;
      const masterItem = masterFoodItems.find(i => i.id === selectedMasterItemId);
      if (!masterItem) return;
      if (!currentMenu) { addMenu({ id: Date.now().toString(), date: selectedDate, items: [masterItem], notes: notes }); } 
      else { updateMenu({ ...currentMenu, items: [...currentMenu.items, masterItem], notes: notes }); }
      setSelectedMasterItemId('');
  };

  const handleRemoveItem = (itemId: string) => {
      if (!currentMenu) return;
      updateMenu({ ...currentMenu, items: currentMenu.items.filter(i => i.id !== itemId) });
  };

  const handleSaveTemplate = () => {
      if (!newTemplateName.trim()) return;
      saveTemplate(newTemplateName, selectedDate, isShared);
      setNewTemplateName('');
      setIsTemplateModalOpen(false);
      alert("Menu saved to bank!");
  };

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
          <h1 className="text-2xl font-extrabold text-white">Menu Planner</h1>
          <div className="flex gap-2">
              <button onClick={() => { setMode('SAVE'); setIsTemplateModalOpen(true); }} className="flex items-center text-green-400 bg-green-900/30 hover:bg-green-900/50 px-4 py-2 rounded-lg font-bold transition-colors border border-green-800">
                  <Save className="w-4 h-4 mr-2" /> Save to Bank
              </button>
              <button onClick={() => { setMode('LOAD'); setIsTemplateModalOpen(true); }} className="flex items-center text-blue-400 bg-blue-900/30 hover:bg-blue-900/50 px-4 py-2 rounded-lg font-bold transition-colors border border-blue-800">
                  <BookOpen className="w-4 h-4 mr-2" /> Load from Bank
              </button>
          </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <div className="flex gap-4 overflow-x-auto pb-2">
              {weekDates.map((dateObj) => { 
                  const dateStr = toLocalISOString(dateObj); 
                  const isSelected = dateStr === selectedDate; 
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); 
                  const dayNum = dateObj.getDate(); 
                  const hasMenu = menus.some(m => m.date === dateStr); 
                  return (
                      <button 
                          key={dateStr} 
                          onClick={() => setSelectedDate(dateStr)} 
                          className={`flex flex-col items-center justify-center flex-shrink-0 w-24 h-24 p-2 rounded-xl border-2 transition-all relative gap-1 ${
                              isSelected 
                              ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-lg transform scale-105' 
                              : 'border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-300'
                          }`}
                      >
                          <span className="text-xs uppercase">{dayName}</span>
                          <span className="text-3xl">{dayNum}</span>
                          {hasMenu && <div className={`w-2 h-2 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}
                      </button>
                  ); 
              })}
          </div>
      </div>

      <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded-r-xl shadow-sm">
          <label className="block text-sm font-bold text-yellow-500 mb-2">Daily Notes & Prices (Visible to Staff)</label>
          <textarea value={currentMenu ? currentMenu.notes : notes} onChange={(e) => { setNotes(e.target.value); if(currentMenu) updateMenu({...currentMenu, notes: e.target.value}); }} className="w-full p-3 rounded border border-yellow-700 bg-slate-900 focus:ring-2 focus:ring-yellow-500 outline-none text-sm h-20 text-white placeholder-slate-500" placeholder="Type menu notes here..." />
      </div>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">1. Choose Category</label>
                  <select className="w-full p-3 border border-slate-600 rounded-lg bg-slate-900 text-white" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as MenuCategory)}><option value="Protein">Protein</option><option value="Carbohydrate">Carbohydrate</option><option value="Sides">Sides</option><option value="Fibre">Fibre / Vegetable</option><option value="Soup">Soup</option><option value="Vegetarian">Vegetarian</option><option value="Sandwiches">Sandwiches</option><option value="Special">Special</option></select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">2. Select Food Item</label>
                  <select className="w-full p-3 border border-slate-600 rounded-lg bg-slate-900 text-white" value={selectedMasterItemId} onChange={(e) => setSelectedMasterItemId(e.target.value)}><option value="">-- Select Item --</option>{dropdownOptions.map(item => (<option key={item.id} value={item.id}>{item.name}</option>))}</select>
              </div>
              <button onClick={handleAddItem} disabled={!selectedMasterItemId} className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center ${selectedMasterItemId ? 'bg-green-600 hover:bg-green-700 hover:-translate-y-1' : 'bg-slate-700 cursor-not-allowed text-slate-500'}`}><Plus className="w-5 h-5 mr-2" /> Add Item</button>
          </div>
      </div>

      <div className="space-y-4">
          <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-400">Preview: {formatDateDisplay(selectedDate)}</h3>
              <span className="text-xs font-bold bg-red-900/50 text-red-200 px-3 py-1.5 rounded border border-red-800 uppercase tracking-wide">Click items below to remove them</span>
          </div>
          <div className="relative group ring-4 ring-slate-800 rounded-xl p-1"><MenuGrid items={menuItems} selectedItemIds={[]} onItemClick={(id) => { if(confirm("Remove this item from the menu?")) handleRemoveItem(id); }} /></div>
      </div>

      {isTemplateModalOpen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-700">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                      <h3 className="font-bold text-lg text-white">{mode === 'SAVE' ? 'Save to Bank' : 'Load from Bank'}</h3>
                      <button onClick={() => setIsTemplateModalOpen(false)} className="text-slate-400 hover:text-white">Close</button>
                  </div>
                  <div className="p-6">
                      {mode === 'SAVE' ? (
                          <div className="space-y-4">
                              <input type="text" placeholder="Template Name (e.g. Jerk Chicken Special)" className="w-full p-3 border border-slate-600 rounded-lg bg-slate-900 text-white outline-none" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} />
                              <div className="flex items-center"><input type="checkbox" id="share" checked={isShared} onChange={e => setIsShared(e.target.checked)} className="w-5 h-5 text-blue-600 rounded bg-slate-900 border-slate-600" /><label htmlFor="share" className="ml-2 text-slate-300 font-medium">Share with Kitchen Team?</label></div>
                              <button onClick={handleSaveTemplate} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">Save Menu</button>
                          </div>
                      ) : (
                          <div className="max-h-[400px] overflow-y-auto space-y-2">
                              {menuTemplates.length === 0 && <p className="text-center text-slate-500">No saved menus.</p>}
                              {menuTemplates.map(tpl => (
                                  <div key={tpl.id} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors group cursor-pointer" onClick={() => { loadTemplate(tpl.id, selectedDate); setIsTemplateModalOpen(false); }}>
                                      <div className="flex-1">
                                          <p className="font-bold text-white">{tpl.name}</p>
                                          <p className="text-xs text-slate-400 mt-1">Saved by {tpl.createdByName} • {new Date(tpl.createdAt).toLocaleDateString()}</p>
                                      </div>
                                      {(tpl.createdById === currentUser?.id || currentUser?.role === 'SUPER_ADMIN') && (<button onClick={(e) => { e.stopPropagation(); deleteTemplate(tpl.id); }} className="p-2 text-red-400 hover:text-red-200 hover:bg-red-900/30 rounded-full"><Trash2 className="w-4 h-4" /></button>)}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// =========================================================
// 3. KITCHEN MASTER DATABASE
// =========================================================
export const KitchenMasterDatabase: React.FC = () => {
  const { masterFoodItems, addMasterItem, updateMasterItem, deleteMasterItem } = useStore();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MenuCategory>('Protein');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = () => {
      if(!name.trim()) return;
      if (editingId) {
          const oldItem = masterFoodItems.find(i => i.id === editingId);
          if (oldItem) { updateMasterItem({ ...oldItem, name: name, category: category }); alert("Item updated."); }
          setEditingId(null);
      } else {
          addMasterItem({ id: 'mfi_' + Date.now(), name, category, description: 'Chef Added', calories: 0, dietaryInfo: [], isAvailable: true });
          alert("Item added.");
      }
      setName('');
  };

  const handleEditClick = (item: MasterFoodItem) => {
      setEditingId(item.id); setName(item.name); setCategory(item.category as MenuCategory);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredItems = masterFoodItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) ||
