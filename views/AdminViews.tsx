import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { MenuCategory, MasterFoodItem, DailyMenu } from '../types';
import { Plus, Trash2, MessageCircle, Utensils, Search, Copy, CheckCircle, Clock, AlertCircle, Save, BookOpen, Edit2, X } from 'lucide-react';
import { MenuGrid } from '../components/MenuGrid';

const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 10);
};
const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00'); 
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// 1. KITCHEN DASHBOARD
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
          <h1 className="text-3xl font-extrabold text-gray-800">Kitchen Command Center</h1>
          <span className="text-gray-500 font-medium">{formatDateDisplay(today)}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-blue-600">
              <div className="flex justify-between items-start">
                  <div><h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Orders Today</h3><p className="text-5xl font-extrabold text-gray-900 mt-2">{todaysOrders.length}</p></div>
                  <div className="p-3 bg-blue-50 rounded-full"><Utensils className="w-6 h-6 text-blue-600" /></div>
              </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-yellow-500">
              <div className="flex justify-between items-start">
                  <div><h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Prep</h3><p className="text-5xl font-extrabold text-gray-900 mt-2">{pendingOrders}</p></div>
                  <div className="p-3 bg-yellow-50 rounded-full"><Clock className="w-6 h-6 text-yellow-600" /></div>
              </div>
          </div>
          <div className={`p-8 rounded-2xl shadow-sm border-l-8 ${activeIssues.length > 0 ? 'bg-red-50 border-red-600' : 'bg-white border-green-500'}`}>
              <div className="flex justify-between items-start">
                  <div><h3 className={`${activeIssues.length > 0 ? 'text-red-800' : 'text-gray-400'} text-xs font-bold uppercase tracking-wider`}>Active Issues</h3><p className={`text-5xl font-extrabold mt-2 ${activeIssues.length > 0 ? 'text-red-700' : 'text-gray-900'}`}>{activeIssues.length}</p></div>
                  <div className={`p-3 rounded-full ${activeIssues.length > 0 ? 'bg-red-200 animate-pulse' : 'bg-green-50'}`}><AlertCircle className={`w-6 h-6 ${activeIssues.length > 0 ? 'text-red-700' : 'text-green-600'}`} /></div>
              </div>
          </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center"><MessageCircle className="w-5 h-5 mr-2" /> Live Feedback Feed</h2>
              {activeIssues.length > 0 && <span className="animate-bounce px-4 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg">{activeIssues.length} NEEDS ATTENTION</span>}
          </div>
          <div className="p-6 space-y-6">
              {activeIssues.length === 0 && resolvedIssues.length === 0 && <div className="text-center py-12"><CheckCircle className="w-16 h-16 text-green-200 mx-auto mb-4" /><p className="text-gray-400 font-medium">All clear! No issues reported.</p></div>}
              {activeIssues.map(issue => (
                  <div key={issue.id} className="border-2 border-red-100 bg-red-50 rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                          <div><span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide mr-2">New Alert</span><span className="text-xs text-gray-500 font-mono">{new Date(issue.timestamp).toLocaleTimeString()}</span></div>
                          <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded border">ID: {issue.userId}</span>
                      </div>
                      <p className="font-bold text-gray-900 text-xl mb-6">"{issue.issue}"</p>
                      <div className="flex gap-2">
                          <input type="text" placeholder="Write a reply..." className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={replyText[issue.id] || ''} onChange={e => setReplyText(prev => ({ ...prev, [issue.id]: e.target.value }))} />
                          <button onClick={() => handleReply(issue.id)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-lg">Reply & Close</button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};

// 2. MENU PLANNER
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
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-800">Menu Planner</h1>
          <div className="flex gap-2">
              <button onClick={() => { setMode('SAVE'); setIsTemplateModalOpen(true); }} className="flex items-center text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg font-bold transition-colors border border-green-200">
                  <Save className="w-4 h-4 mr-2" /> Save to Bank
              </button>
              <button onClick={() => { setMode('LOAD'); setIsTemplateModalOpen(true); }} className="flex items-center text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold transition-colors border border-blue-200">
                  <BookOpen className="w-4 h-4 mr-2" /> Load from Bank
              </button>
          </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm"><div className="flex gap-4 overflow-x-auto pb-2">{weekDates.map((dateObj) => { const dateStr = toLocalISOString(dateObj); const isSelected = dateStr === selectedDate; const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); const dayNum = dateObj.getDate(); const hasMenu = menus.some(m => m.date === dateStr); return (<button key={dateStr} onClick={() => setSelectedDate(dateStr)} className={`flex flex-col items-center justify-center flex-shrink-0 w-24 h-24 p-2 rounded-xl border-2 transition-all relative gap-1 ${isSelected ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-lg transform scale-105' : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-500'}`}><span className="text-xs uppercase">{dayName}</span><span className="text-3xl">{dayNum}</span>{hasMenu && <div className={`w-2 h-2 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}</button>); })}</div></div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl shadow-sm"><label className="block text-sm font-bold text-yellow-800 mb-2">Daily Notes & Prices</label><textarea value={currentMenu ? currentMenu.notes : notes} onChange={(e) => { setNotes(e.target.value); if(currentMenu) updateMenu({...currentMenu, notes: e.target.value}); }} className="w-full p-3 rounded border border-yellow-200 bg-white focus:ring-2 focus:ring-yellow-500 outline-none text-sm h-20" placeholder="Type menu notes here..." /></div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><div className="grid md:grid-cols-3 gap-4 items-end"><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">1. Choose Category</label><select className="w-full p-3 border rounded-lg bg-gray-50 font-medium" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as MenuCategory)}><option value="Protein">Protein</option><option value="Carbohydrate">Carbohydrate</option><option value="Sides">Sides</option><option value="Fibre">Fibre / Vegetable</option><option value="Soup">Soup</option><option value="Vegetarian">Vegetarian</option><option value="Sandwiches">Sandwiches</option><option value="Special">Special</option></select></div><div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">2. Select Food Item</label><select className="w-full p-3 border rounded-lg bg-gray-50 font-medium" value={selectedMasterItemId} onChange={(e) => setSelectedMasterItemId(e.target.value)}><option value="">-- Select Item --</option>{dropdownOptions.map(item => (<option key={item.id} value={item.id}>{item.name}</option>))}</select></div><button onClick={handleAddItem} disabled={!selectedMasterItemId} className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center ${selectedMasterItemId ? 'bg-green-600 hover:bg-green-700 hover:-translate-y-1' : 'bg-gray-300 cursor-not-allowed'}`}><Plus className="w-5 h-5 mr-2" /> Add Item</button></div></div>
      <div className="space-y-4"><div className="flex items-center justify-between"><h3 className="text-xl font-bold text-gray-800">Preview: {formatDateDisplay(selectedDate)}</h3><span className="text-xs text-gray-400 bg-white px-2 py-1 rounded border">Click items below to remove them</span></div><div className="relative group ring-4 ring-gray-100 rounded-xl p-1"><MenuGrid items={menuItems} selectedItemIds={[]} onItemClick={(id) => { if(confirm("Remove this item from the menu?")) handleRemoveItem(id); }} /></div></div>

      {isTemplateModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-lg text-gray-800">{mode === 'SAVE' ? 'Save to Bank' : 'Load from Bank'}</h3>
                      <button onClick={() => setIsTemplateModalOpen(false)} className="text-gray-400 hover:text-gray-600">Close</button>
                  </div>
                  <div className="p-6">
                      {mode === 'SAVE' ? (
                          <div className="space-y-4">
                              <input type="text" placeholder="Template Name (e.g. Jerk Chicken Special)" className="w-full p-3 border rounded-lg bg-gray-50 outline-none" value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} />
                              <div className="flex items-center"><input type="checkbox" id="share" checked={isShared} onChange={e => setIsShared(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" /><label htmlFor="share" className="ml-2 text-gray-700 font-medium">Share with Kitchen Team?</label></div>
                              <button onClick={handleSaveTemplate} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">Save Menu</button>
                          </div>
                      ) : (
                          <div className="max-h-[400px] overflow-y-auto space-y-2">
                              {menuTemplates.length === 0 && <p className="text-center text-gray-400">No saved menus.</p>}
                              {menuTemplates.map(tpl => (
                                  <div key={tpl.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 transition-colors group">
                                      <div className="cursor-pointer flex-1" onClick={() => { loadTemplate(tpl.id, selectedDate); setIsTemplateModalOpen(false); }}>
                                          <p className="font-bold text-gray-800">{tpl.name}</p>
                                          <p className="text-xs text-gray-500 mt-1">Saved by {tpl.createdByName} • {new Date(tpl.createdAt).toLocaleDateString()}</p>
                                      </div>
                                      {(tpl.createdById === currentUser?.id || currentUser?.role === 'SUPER_ADMIN') && (<button onClick={() => deleteTemplate(tpl.id)} className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4" /></button>)}
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

// 3. KITCHEN MASTER DATABASE
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

  const filteredItems = masterFoodItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 pb-20">
        <div className={`p-8 rounded-2xl shadow-sm border transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
            <h2 className={`text-2xl font-bold mb-6 flex items-center ${editingId ? 'text-blue-800' : 'text-gray-800'}`}>
                {editingId ? <Edit2 className="w-6 h-6 mr-2" /> : <Utensils className="w-6 h-6 mr-2 text-blue-600" />} {editingId ? 'Edit Master Item' : 'Add New Master Item'}
            </h2>
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label><input type="text" placeholder="e.g. Curried Shrimp" className="w-full p-3 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="w-full md:w-64"><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label><select className="w-full p-3 border rounded-lg bg-white" value={category} onChange={e => setCategory(e.target.value as MenuCategory)}><option value="Protein">Protein</option><option value="Carbohydrate">Carbohydrate</option><option value="Sides">Sides</option><option value="Fibre">Fibre / Vegetable</option><option value="Soup">Soup</option><option value="Vegetarian">Vegetarian</option><option value="Sandwiches">Sandwiches</option><option value="Special">Special</option><option value="Condiments">Condiments</option></select></div>
                <button onClick={handleSubmit} disabled={!name} className={`px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all ${name ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300'}`}>{editingId ? 'Update Item' : 'Add Item'}</button>
                {editingId && (<button onClick={() => { setEditingId(null); setName(''); }} className="px-4 py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-200"><X className="w-5 h-5" /></button>)}
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"><div className="p-4 border-b border-gray-100 flex items-center bg-gray-50"><Search className="w-5 h-5 text-gray-400 mr-2" /><input type="text" placeholder="Search database..." className="bg-transparent outline-none flex-1 font-medium" value={search} onChange={e => setSearch(e.target.value)} /></div><div className="max-h-[500px] overflow-y-auto"><table className="w-full text-left"><thead className="bg-gray-100 sticky top-0 shadow-sm"><tr><th className="p-4 text-xs font-bold text-gray-500 uppercase">Item Name</th><th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th><th className="p-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredItems.map(item => (<tr key={item.id} className={`transition-colors group ${editingId === item.id ? 'bg-blue-50' : 'hover:bg-blue-50'}`}><td className="p-4 font-bold text-gray-800">{item.name}</td><td className="p-4 text-sm"><span className="px-2 py-1 bg-white border rounded text-xs font-medium text-gray-500">{item.category}</span></td><td className="p-4 text-right flex justify-end gap-2"><button onClick={() => handleEditClick(item)} className="text-blue-400 hover:text-blue-600 p-2 hover:bg-blue-100 rounded-full transition-all" title="Edit"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteMasterItem(item.id)} className="text-gray-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button></td></tr>))}</tbody></table></div></div>
    </div>
  );
};

export const AdminUserManager: React.FC = () => <div className="p-8">User Manager Placeholder</div>;
export const AdminDepts: React.FC = () => <div className="p-8">Dept Manager Placeholder</div>;
