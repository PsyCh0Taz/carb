import React, { useState } from 'react';
import { GasStation, FuelType, FUEL_TYPES } from '../types';
import { Search, Filter, Fuel, Navigation, ChevronRight, ArrowUpDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StationListProps {
  stations: GasStation[];
  onStationClick: (station: GasStation) => void;
}

export const StationList: React.FC<StationListProps> = ({ stations, onStationClick }) => {
  const [selectedFuel, setSelectedFuel] = useState<FuelType>('Gazole');
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price');

  const filteredStations = stations
    .filter(s => s.fuels.some(f => f.name === selectedFuel))
    .sort((a, b) => {
      if (sortBy === 'price') {
        const priceA = a.fuels.find(f => f.name === selectedFuel)?.price || 999;
        const priceB = b.fuels.find(f => f.name === selectedFuel)?.price || 999;
        return priceA - priceB;
      } else {
        return (a.distance || 0) - (b.distance || 0);
      }
    });

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header & Filters */}
      <div className="bg-white p-4 shadow-sm border-b sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Stations à proximité</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setSortBy(sortBy === 'price' ? 'distance' : 'price')}
              className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ArrowUpDown size={18} />
            </button>
          </div>
        </div>

        {/* Fuel Type Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          {FUEL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFuel(type)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedFuel === type 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredStations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Fuel size={48} className="mb-4 opacity-20" />
            <p>Aucune station trouvée pour ce carburant</p>
          </div>
        ) : (
          filteredStations.map((station) => {
            const fuelInfo = station.fuels.find(f => f.name === selectedFuel);
            return (
              <div
                key={station.id}
                onClick={() => onStationClick(station)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {station.brand || "Station"}
                      </span>
                      {station.distance && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Navigation size={10} />
                          {(station.distance / 1000).toFixed(1)} km
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 line-clamp-1">{station.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{station.address}, {station.city}</p>
                  </div>
                  
                  <div className="text-right ml-4 flex flex-col items-end">
                    <div className="text-2xl font-black text-slate-900 leading-none">
                      {fuelInfo?.price.toFixed(3)}
                      <span className="text-sm font-medium ml-0.5">€</span>
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                      {selectedFuel}
                    </div>
                    {fuelInfo?.updatedAt && (
                      <div className="text-[9px] text-slate-300 font-medium mt-0.5">
                        Màj: {new Date(fuelInfo.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex gap-2">
                    {station.fuels.slice(0, 3).map(f => (
                      <span key={f.name} className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded">
                        {f.name}
                      </span>
                    ))}
                    {station.fuels.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{station.fuels.length - 3}</span>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
