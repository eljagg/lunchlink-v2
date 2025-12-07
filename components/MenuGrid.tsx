import React from 'react';
import { MenuItem } from '../types';

interface MenuGridProps {
  items: MenuItem[];
  selectedItemIds: string[];
  onItemClick: (id: string) => void;
}

const CATEGORIES = [
  { id: 'Protein', label: 'Protein', color: 'bg-red-600' },
  { id: 'Carbohydrate', label: 'Carbohydrate', color: 'bg-yellow-500' },
  { id: 'Sides', label: 'Sides', color: 'bg-yellow-500' },
  { id: 'Fibre', label: 'Fibre / Vegetable', color: 'bg-green-700' },
  { id: 'Soup', label: 'Soup', color: 'bg-yellow-600' },
  { id: 'Vegetarian', label: 'Vegetarian', color: 'bg-green-600' },
  { id: 'Sandwiches', label: 'Done to Order', color: 'bg-blue-500' },
  { id: 'Special', label: 'Specials', color: 'bg-purple-600' },
];

// Helper to get icons
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
              <div className="w-full text-left p-2 rounded text-xs font-medium border-2 border-dashed border-gray-200 text-gray-400 bg-gray-50 mb-1">
                  <div className="font-bold opacity-50">{placeholderLabel}</div>
                  <div className="text-[9px] mt-1">Not Listed</div>
              </div>
          );
      }

      const isSelected = selectedItemIds.includes(item.id);
      return (
        <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`w-full text-left p-2 rounded text-xs font-medium transition-all border-2 mb-1 ${
                isSelected 
                ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md transform scale-105 z-10' 
                : 'border-transparent hover:bg-gray-50 text-gray-700 bg-white'
            }`}
        >
            <div className="font-bold flex items-center">
                {item.name}
                {getDietaryIcons(item.dietaryInfo)}
            </div>
            {item.description && <div className="text-[10px] text-gray-500 line-clamp-2">{item.description}</div>}
            {isSelected && <div className="mt-1 text-[9px] text-blue-600 font-bold">✓ Selected</div>}
        </button>
      );
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[1000px]"> 
        <div className="grid grid-cols-8 gap-1 mb-2">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className={`${cat.color} text-white p-2 text-center text-xs font-bold uppercase rounded-t-md shadow-sm`}>
              {cat.label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-8 gap-1 bg-gray-100 p-1 rounded-b-md min-h-[200px]">
          {CATEGORIES.map(cat => {
            const categoryItems = items.filter(i => i.category === cat.id);
            if (cat.id === 'Fibre') {
                const steamVegItem = categoryItems.find(i => i.name.toLowerCase().includes('steam'));
                const rawVegItem = categoryItems.find(i => i.name.toLowerCase().includes('raw'));
                return (
                    <div key={cat.id} className="bg-white p-1 rounded-sm border border-gray-200 flex flex-col gap-1">
                        <div className="flex-1 bg-green-50 p-1 rounded border border-green-100">
                            <span className="text-[10px] font-bold text-green-800 uppercase block mb-1 text-center">Steam Vegetable</span>
                            {renderItemButton(steamVegItem, "Steam Vegetable")}
                        </div>
                        <div className="flex-1 bg-green-50 p-1 rounded border border-green-100">
                            <span className="text-[10px] font-bold text-green-800 uppercase block mb-1 text-center">Raw Vegetable</span>
                            {renderItemButton(rawVegItem, "Raw Vegetable")}
                        </div>
                    </div>
                );
            }
            return (
              <div key={cat.id} className="bg-white p-1 rounded-sm space-y-2 border border-gray-200">
                {categoryItems.length === 0 && <div className="h-full flex items-center justify-center text-gray-200 text-xs italic p-4 text-center">-</div>}
                {categoryItems.map(item => renderItemButton(item, item.name))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};