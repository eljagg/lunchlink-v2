import React from 'react';
import { MenuItem } from '../types';

interface MenuGridProps {
  items: MenuItem[];
  selectedItemIds: string[];
  onItemClick: (id: string) => void;
}

const CATEGORIES = [
  { id: 'Protein', label: 'Protein', color: 'bg-red-700' }, // Darker Red
  { id: 'Carbohydrate', label: 'Carbohydrate', color: 'bg-yellow-600' }, // Darker Yellow
  { id: 'Sides', label: 'Sides', color: 'bg-yellow-600' },
  { id: 'Fibre', label: 'Fibre / Vegetable', color: 'bg-green-700' },
  { id: 'Soup', label: 'Soup', color: 'bg-orange-700' },
  { id: 'Vegetarian', label: 'Vegetarian', color: 'bg-green-700' },
  { id: 'Sandwiches', label: 'Done to Order', color: 'bg-blue-700' },
  { id: 'Special', label: 'Specials', color: 'bg-purple-700' },
];

const getDietaryIcons = (info: string[] | undefined) => {
    if (!info) return null;
    return (
        <span className="ml-2 inline-flex gap-1">
            {info.includes('Vegan') && <span title="Vegan">🌱</span>}
            {info.includes('GF') && <span title="Gluten Free">🌾</span>}
            {info.includes('Spicy') && <span title="Spicy">🌶️</span>}
            {info.includes('Raw') && <span title="Raw">🥗</span>}
        </span>
    );
};

export const MenuGrid: React.FC<MenuGridProps> = ({ items, selectedItemIds, onItemClick }) => {
  
  const renderItemButton = (item: MenuItem | undefined, placeholderLabel: string) => {
      if (!item) {
          return (
              // DARK THEME: Slate-800 background, Slate-600 text
              <div className="w-full text-left p-3 rounded-lg text-xs font-medium border border-slate-700 border-dashed text-slate-500 bg-slate-800/50 mb-2">
                  <div className="font-bold opacity-50">{placeholderLabel}</div>
                  <div className="text-[9px] mt-1 opacity-40">Not Listed</div>
              </div>
          );
      }

      const isSelected = selectedItemIds.includes(item.id);
      return (
        <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            // DARK THEME: Slate-800 card, White text
            className={`w-full text-left p-3 rounded-lg text-xs font-medium transition-all border mb-2 shadow-sm ${
                isSelected 
                ? 'border-blue-500 bg-blue-900/30 text-blue-200 shadow-md transform scale-[1.02] z-10' 
                : 'border-slate-700 hover:border-slate-500 hover:bg-slate-700 text-slate-200 bg-slate-800'
            }`}
        >
            <div className="font-bold flex items-center justify-between">
                <span>{item.name}</span>
                {getDietaryIcons(item.dietaryInfo)}
            </div>
            {item.description && <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">{item.description}</div>}
            {isSelected && <div className="mt-2 text-[9px] text-blue-400 font-bold flex items-center">✓ Selected</div>}
        </button>
      );
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[1000px]"> 
        <div className="grid grid-cols-8 gap-2 mb-2">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className={`${cat.color} text-white p-2 text-center text-xs font-bold uppercase rounded-lg shadow-md`}>
              {cat.label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800 min-h-[200px]">
          {CATEGORIES.map(cat => {
            const categoryItems = items.filter(i => i.category === cat.id);
            if (cat.id === 'Fibre') {
                const steamVegItem = categoryItems.find(i => i.name.toLowerCase().includes('steam'));
                const rawVegItem = categoryItems.find(i => i.name.toLowerCase().includes('raw'));
                return (
                    <div key={cat.id} className="bg-slate-900/30 p-1 rounded-lg border border-slate-800 flex flex-col gap-1">
                        <div className="flex-1 bg-green-900/20 p-2 rounded border border-green-900/30">
                            <span className="text-[10px] font-bold text-green-400 uppercase block mb-2 text-center">Steam Vegetable</span>
                            {renderItemButton(steamVegItem, "Steam Vegetable")}
                        </div>
                        <div className="flex-1 bg-green-900/20 p-2 rounded border border-green-900/30">
                            <span className="text-[10px] font-bold text-green-400 uppercase block mb-2 text-center">Raw Vegetable</span>
                            {renderItemButton(rawVegItem, "Raw Vegetable")}
                        </div>
                    </div>
                );
            }
            return (
              <div key={cat.id} className="bg-slate-900/30 p-2 rounded-lg border border-slate-800">
                {categoryItems.length === 0 && <div className="h-full flex items-center justify-center text-slate-600 text-xs italic p-4 text-center">-</div>}
                {categoryItems.map(item => renderItemButton(item, item.name))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
