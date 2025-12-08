import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { Order } from '../types';
import { Utensils, User, Phone, Key, CheckCircle, ArrowRight, Building } from 'lucide-react'; // Added Phone icon
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
  const [hostContact, setHostContact] = useState(''); // Renamed for clarity
  const [passcode, setPasscode] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // --- LOGIC ---
  const today = toLocalISOString(new Date());
  
  const activeMenu = menus.find(m => m.date === today && m.companyId === selectedCompanyId);
  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const handleAuth = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!guestName || !hostContact || !selectedCompanyId || !passcode) {
          alert("Please fill in all fields.");
          return;
      }

      if (passcode !== appConfig.guestPasscode) {
          alert("Invalid Daily Passcode. Please check with reception.");
          return;
      }

      setStep('MENU');
  };

  const handlePlaceOrder = async () => {
      if (!activeMenu) return;

      const newOrder: Order = {
          id: 'guest_ord_' + Date.now(),
          menuId: activeMenu.id,
          selectedItemIds: selectedItems,
          date: today,
          // Updated to use the new "Host Contact" label in the notes
          specialInstructions: `GUEST: ${guestName} (Host: ${hostContact})\nNote: ${specialInstructions}`,
          status: 'Pending',
          timestamp: Date.now(),
          companyId: selectedCompanyId,
          guestName: guestName,
          guestHostEmail: hostContact // We store the contact info (email or phone) here
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
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 text-center max-w-md w-full border border-slate-700">
                  <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h1 className="text-2xl font-extrabold text-white mb-2">Order Confirmed!</h1>
                  <p className="text-slate-400 mb-8">
                      Thank you, <strong className="text-white">{guestName}</strong>. Your lunch will be delivered to the <strong className="text-blue-400">{selectedCompany?.name}</strong> area.
                  </p>
                  <button 
                      onClick={() => window.location.reload()} 
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg"
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
          <div className="min-h-screen bg-slate-950 pb-32">
              {/* Header */}
              <div 
                className="p-6 text-white shadow-lg border-b border-white/10"
                style={{ backgroundColor: selectedCompany?.primaryColor || '#0f172a' }}
              >
                  <div className="max-w-4xl mx-auto flex justify-between items-center">
                      <div>
                          <h1 className="text-xl font-bold flex items-center gap-2">
                              <Utensils className="w-6 h-6" /> Guest Ordering
                          </h1>
                          <p className="text-sm opacity-90 font-medium">Visiting: {selectedCompany?.name}</p>
                      </div>
                      <button onClick={logout} className="text-xs bg-black/20 px-4 py-2 rounded hover:bg-black/30 font-bold border border-white/10">Cancel</button>
                  </div>
              </div>

              <div className="max-w-4xl mx-auto p-4 space-y-6 mt-6">
                  {/* Menu Grid */}
                  {activeMenu ? (
                      <>
                        <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
                             <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                                Today's Menu <span className="ml-2 text-sm font-normal text-slate-400">({new Date().toLocaleDateString()})</span>
                             </h2>
                             <MenuGrid items={activeMenu.items} selectedItemIds={selectedItems} onItemClick={toggleItem} />
                        </div>
                        
                        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                            <label className="block text-sm font-bold text-slate-300 mb-2">Special Requests / Allergies</label>
                            <textarea 
                                value={specialInstructions}
                                onChange={e => setSpecialInstructions(e.target.value)}
                                className="w-full p-4 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24 bg-slate-900 text-white placeholder-slate-500"
                                placeholder="E.g. No gravy, allergies..."
                            />
                        </div>
                      </>
                  ) : (
                      <div className="text-center py-20 bg-slate-800 rounded-xl border border-dashed border-slate-700">
                          <p className="text-slate-400 font-medium">No menu published for {selectedCompany?.name} today.</p>
                      </div>
                  )}
              </div>

              {/* Footer */}
              {selectedItems.length > 0 && (
                  <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 shadow-2xl flex justify-center z-50">
                      <button 
                          onClick={handlePlaceOrder}
                          className="bg-green-600 text-white px-10 py-4 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce hover:animate-none hover:bg-green-700 border-4 border-slate-900"
                      >
                          Confirm Order ({selectedItems.length} items) <ArrowRight className="w-5 h-5" />
                      </button>
                  </div>
              )}
          </div>
      );
  }

  // --- RENDER: AUTH SCREEN (Dark Mode) ---
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 relative z-10">
        <div className="bg-slate-800 p-8 text-center border-b border-slate-700">
          <div className="inline-flex p-3 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-900/50">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Guest Portal</h1>
          <p className="text-slate-400 mt-1 text-sm">Please identify yourself to order lunch.</p>
        </div>

        <form onSubmit={handleAuth} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Visiting Company</label>
            <div className="relative">
                <Building className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <select 
                    value={selectedCompanyId}
                    onChange={e => setSelectedCompanyId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-white font-medium"
                >
                    <option value="">-- Choose Company --</option>
                    {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Your Name</label>
            <div className="relative">
                <User className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                <input 
                    type="text" 
                    value={guestName} 
                    onChange={e => setGuestName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-600"
                    placeholder="e.g. John Smith"
                />
            </div>
          </div>

          {/* UPDATED FIELD: Host Contact (Email or CUG) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Host Contact Info (Email or CUG)</label>
            <div className="relative">
                {/* Changed Icon to Phone to signify Contact/CUG */}
                <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                <input 
                    type="text" // Changed from 'email' to 'text' to allow phone numbers
                    value={hostContact} 
                    onChange={e => setHostContact(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-slate-600"
                    placeholder="e.g. jane@facey.com or 876-555-1234"
                />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 ml-1">Required for order verification.</p>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Daily Access Code</label>
            <div className="relative">
                <Key className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" />
                <input 
                    type="text" 
                    value={passcode} 
                    onChange={e => setPasscode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white font-mono tracking-widest placeholder-slate-700"
                    placeholder="XXXX"
                />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 text-right">Ask reception for today's code.</p>
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
              className="w-full text-center text-sm text-slate-500 hover:text-slate-300 mt-4 transition-colors"
          >
              Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
