import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { Order } from '../types';
import { Utensils, User, Mail, Key, CheckCircle, ArrowRight, Building, Lock } from 'lucide-react';
import { MenuGrid } from '../components/MenuGrid';

const toLocalISOString = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return (new Date(date.getTime() - offset)).toISOString().slice(0, 10);
};

export const GuestPortal: React.FC = () => {
  const { menus, placeGuestOrder, companies, appConfig, logout } = useStore();
  
  // --- STATE ---
  const [step, setStep] = useState<'AUTH' | 'MENU' | 'SUCCESS'>('AUTH');
  const [guestName, setGuestName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // --- LOGIC ---
  const today = toLocalISOString(new Date());
  
  // Find menu for the selected company on today's date
  const activeMenu = menus.find(m => m.date === today && m.companyId === selectedCompanyId);
  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const handleAuth = (e: React.FormEvent) => {
      e.preventDefault();
      
      // 1. Validate Fields
      if (!guestName || !hostEmail || !selectedCompanyId || !passcode) {
          alert("Please fill in all fields.");
          return;
      }

      // 2. Validate Passcode (From App Config)
      if (passcode !== appConfig.guestPasscode) {
          alert("Invalid Daily Passcode. Please check with reception.");
          return;
      }

      // 3. Unlock Menu
      setStep('MENU');
  };

  const handlePlaceOrder = async () => {
      if (!activeMenu) return;

      const newOrder: Order = {
          id: 'guest_ord_' + Date.now(),
          menuId: activeMenu.id,
          selectedItemIds: selectedItems,
          date: today,
          specialInstructions: `GUEST: ${guestName} (Visiting: ${hostEmail})\nNote: ${specialInstructions}`,
          status: 'Pending',
          timestamp: Date.now(),
          companyId: selectedCompanyId,
          // Guest Specific Fields
          guestName: guestName,
          guestHostEmail: hostEmail
      };

      await placeGuestOrder(newOrder);
      setStep('SUCCESS');
  };

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(i => i !== id));
    else setSelectedItems([...selectedItems, id]);
  };

  // --- RENDER: SUCCESS SCREEN ---
  if (step === 'SUCCESS') {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Order Confirmed!</h1>
                  <p className="text-slate-500 mb-8">
                      Thank you, <strong>{guestName}</strong>. Your lunch will be delivered to the <strong>{selectedCompany?.name}</strong> area.
                  </p>
                  <button 
                      onClick={() => window.location.reload()} // Reset for next user
                      className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition"
                  >
                      Back to Home
                  </button>
              </div>
          </div>
      );
  }

  // --- RENDER: MENU SCREEN ---
  if (step === 'MENU') {
      return (
          <div className="min-h-screen bg-slate-50 pb-32">
              {/* Header */}
              <div 
                className="p-6 text-white shadow-lg"
                style={{ backgroundColor: selectedCompany?.primaryColor || '#1e293b' }}
              >
                  <div className="max-w-4xl mx-auto flex justify-between items-center">
                      <div>
                          <h1 className="text-xl font-bold flex items-center gap-2">
                              <Utensils className="w-6 h-6" /> Guest Ordering
                          </h1>
                          <p className="text-sm opacity-80">Visiting: {selectedCompany?.name}</p>
                      </div>
                      <button onClick={logout} className="text-xs bg-white/20 px-3 py-1 rounded hover:bg-white/30">Cancel</button>
                  </div>
              </div>

              <div className="max-w-4xl mx-auto p-4 space-y-6 mt-6">
                  {/* Menu Grid */}
                  {activeMenu ? (
                      <>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                             <h2 className="text-lg font-bold text-slate-700 mb-4">Today's Menu ({new Date().toLocaleDateString()})</h2>
                             <MenuGrid items={activeMenu.items} selectedItemIds={selectedItems} onItemClick={toggleItem} />
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Special Requests / Allergies</label>
                            <textarea 
                                value={specialInstructions}
                                onChange={e => setSpecialInstructions(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                placeholder="E.g. No gravy, allergies..."
                            />
                        </div>
                      </>
                  ) : (
                      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                          <p className="text-slate-500 font-bold">No menu published for {selectedCompany?.name} today.</p>
                      </div>
                  )}
              </div>

              {/* Footer */}
              {selectedItems.length > 0 && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-2xl flex justify-center">
                      <button 
                          onClick={handlePlaceOrder}
                          className="bg-green-600 text-white px-10 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce hover:animate-none"
                      >
                          Confirm Order ({selectedItems.length} items) <ArrowRight className="w-5 h-5" />
                      </button>
                  </div>
              )}
          </div>
      );
  }

  // --- RENDER: AUTH SCREEN (Default) ---
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="bg-slate-800 p-8 text-center border-b border-slate-700">
          <div className="inline-flex p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-900/50">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Guest Portal</h1>
          <p className="text-slate-400 mt-1">Please identify yourself to order lunch.</p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Company Visiting</label>
            <div className="relative">
                <Building className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <select 
                    value={selectedCompanyId}
                    onChange={e => setSelectedCompanyId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-slate-700 font-medium"
                >
                    <option value="">-- Choose Company --</option>
                    {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Name</label>
            <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <input 
                    type="text" 
                    value={guestName} 
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                    placeholder="e.g. John Smith"
                />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Host Email (Who are you visiting?)</label>
            <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <input 
                    type="email" 
                    value={hostEmail} 
                    onChange={e => setHostEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                    placeholder="host@company.com"
                />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Daily Access Code</label>
            <div className="relative">
                <Key className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <input 
                    type="text" 
                    value={passcode} 
                    onChange={e => setPasscode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-mono tracking-widest"
                    placeholder="XXXX"
                />
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">Ask reception for today's code.</p>
          </div>

          <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-[0.98] mt-4"
          >
              Unlock Menu
          </button>
          
          <button 
              type="button" 
              onClick={logout}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-4"
          >
              Back to Employee Login
          </button>
        </form>
      </div>
    </div>
  );
};
