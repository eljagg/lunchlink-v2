import React, { useState } from 'react';
import { useStore } from '../store/SupabaseStore';
import { MenuCategory, MasterFoodItem, DailyMenu, Company } from '../types';
import { Plus, Trash2, MessageCircle, Utensils, Search, Copy, CheckCircle, Clock, AlertCircle, Save, BookOpen, Edit2, X, Building } from 'lucide-react';
import { MenuGrid } from '../components/MenuGrid';

const toLocalISOString = (date: Date) => { const offset = date.getTimezoneOffset() * 60000; return (new Date(date.getTime() - offset)).toISOString().slice(0, 10); };
const formatDateDisplay = (dateStr: string) => { const date = new Date(dateStr + 'T12:00:00'); return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); };

// ... (Keep AdminKitchenDashboard and AdminMenuManager and KitchenMasterDatabase EXACTLY as they were) ...
// (I am omitting them here to save space, but DO NOT DELETE THEM in your file!)
// ...

// --- NEW: COMPANY MANAGER ---
export const AdminCompanyManager: React.FC = () => {
    const { companies, addCompany, updateCompany, deleteCompany } = useStore();
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#2563eb');
    const [secondaryColor, setSecondaryColor] = useState('#1e40af');
    const [tagline, setTagline] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!name.trim()) return;
        const companyData: Company = {
            id: editingId || 'comp_' + Date.now(),
            name,
            logoUrl,
            primaryColor,
            secondaryColor,
            welcomeMessage: name, // Default welcome
            tagline
        };

        if (editingId) {
            updateCompany(companyData);
            alert("Company updated.");
            setEditingId(null);
        } else {
            addCompany(companyData);
            alert("Company added.");
        }
        // Reset
        setName(''); setLogoUrl(''); setTagline(''); setPrimaryColor('#2563eb'); setSecondaryColor('#1e40af');
    };

    const handleEdit = (c: Company) => {
        setEditingId(c.id);
        setName(c.name);
        setLogoUrl(c.logoUrl);
        setPrimaryColor(c.primaryColor);
        setSecondaryColor(c.secondaryColor);
        setTagline(c.tagline || '');
    };

    return (
        <div className="space-y-8 pb-20">
            {/* FORM */}
            <div className="bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Building className="w-6 h-6 mr-2 text-blue-500" />
                    {editingId ? 'Edit Company' : 'Add New Company'}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Company Name</label>
                        <input type="text" className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Seprod" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tagline</label>
                        <input type="text" className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Made in Jamaica" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Logo URL</label>
                        <input type="text" className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-white" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Primary Color</label>
                            <input type="color" className="w-full h-12 bg-transparent cursor-pointer" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Secondary Color</label>
                            <input type="color" className="w-full h-12 bg-transparent cursor-pointer" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex gap-2">
                    <button onClick={handleSubmit} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                        {editingId ? 'Update Company' : 'Add Company'}
                    </button>
                    {editingId && <button onClick={() => setEditingId(null)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Cancel</button>}
                </div>
            </div>

            {/* LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(c => (
                    <div key={c.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                {c.logoUrl ? <img src={c.logoUrl} alt={c.name} className="w-12 h-12 rounded object-contain bg-white p-1" /> : <div className="w-12 h-12 bg-slate-700 rounded flex items-center justify-center"><Building className="text-slate-500" /></div>}
                                <div>
                                    <h3 className="font-bold text-white text-lg">{c.name}</h3>
                                    <p className="text-xs text-slate-400">{c.tagline}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(c)} className="p-2 text-blue-400 hover:bg-blue-900/30 rounded"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => deleteCompany(c.id)} className="p-2 text-red-400 hover:bg-red-900/30 rounded"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <div className="h-2 flex-1 rounded" style={{ backgroundColor: c.primaryColor }}></div>
                            <div className="h-2 flex-1 rounded" style={{ backgroundColor: c.secondaryColor }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AdminUserManager: React.FC = () => <div className="p-8 text-white">User Manager Placeholder</div>;
export const AdminDepts: React.FC = () => <div className="p-8 text-white">Dept Manager Placeholder</div>;
