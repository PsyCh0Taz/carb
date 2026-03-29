import React, { useState, useEffect, useCallback } from 'react';
import { MapView } from './components/Map';
import { StationList } from './components/StationList';
import { GasStation } from './types';
import { fetchGasStations } from './services/gasService';
import { Map as MapIcon, List as ListIcon, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ViewMode = 'map' | 'list';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (lat: number, lon: number) => {
    setRefreshing(true);
    try {
      const data = await fetchGasStations(lat, lon);
      setStations(data);
      setError(null);
    } catch (err) {
      setError("Impossible de charger les stations. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          loadData(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Fallback to Paris if geolocation fails or is denied for demo purposes
          const fallback: [number, number] = [48.8566, 2.3522];
          setUserLocation(fallback);
          loadData(fallback[0], fallback[1]);
          setError("Géolocalisation refusée. Affichage des stations à Paris.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      setLoading(false);
    }
  }, [loadData]);

  const handleStationSelect = (station: GasStation) => {
    // In a real app, we might open a detail view or zoom to it
    console.log("Selected station:", station);
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={48} className="text-blue-600" />
        </motion.div>
        <p className="mt-4 text-slate-600 font-medium">Recherche des stations...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 font-sans">
      {/* Top Bar */}
      <header className="bg-white px-4 py-3 border-b flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </div>
          <h1 className="font-black text-slate-900 tracking-tight uppercase">MONCARBURANT</h1>
        </div>
        
        <button 
          onClick={() => userLocation && loadData(userLocation[0], userLocation[1])}
          disabled={refreshing}
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {viewMode === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {userLocation && (
                <MapView 
                  stations={stations} 
                  userLocation={userLocation} 
                  onStationSelect={handleStationSelect}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="absolute inset-0"
            >
              <StationList 
                stations={stations} 
                onStationClick={handleStationSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        {error && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-20 left-4 right-4 bg-red-50 border border-red-100 p-3 rounded-xl shadow-lg flex items-center gap-3 z-50"
          >
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-xs text-red-700 font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 text-xs font-bold">OK</button>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t px-6 py-3 flex justify-around items-center z-20 pb-safe">
        <button
          onClick={() => setViewMode('map')}
          className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'map' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${viewMode === 'map' ? 'bg-blue-50' : ''}`}>
            <MapIcon size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Carte</span>
        </button>

        <button
          onClick={() => setViewMode('list')}
          className={`flex flex-col items-center gap-1 transition-all ${viewMode === 'list' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-50' : ''}`}>
            <ListIcon size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Liste</span>
        </button>
      </nav>
    </div>
  );
}
