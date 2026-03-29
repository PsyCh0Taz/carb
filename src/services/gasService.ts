import { GasStation } from "../types";

/**
 * Fetches gas stations in France using the official Open Data API.
 * Radius is 20km by default.
 */
export async function fetchGasStations(lat: number, lon: number): Promise<GasStation[]> {
  try {
    // 1. Fetch the station names mapping JSON
    // We use http as requested, but try to handle CORS/Mixed Content if possible
    let stationNamesMap: Record<string, string> = {};
    try {
      // Use the local proxy endpoint to avoid CORS issues
      const namesResponse = await fetch("/api/proxy/stations");
      if (namesResponse.ok) {
        const namesData = await namesResponse.json();
        // Assuming namesData is an array of objects with com_insee and name
        // or an object where keys are com_insee
        if (Array.isArray(namesData)) {
          namesData.forEach((item: any) => {
            if (item.com_insee) stationNamesMap[item.com_insee] = item.name;
          });
        } else {
          stationNamesMap = namesData;
        }
      }
    } catch (nameError) {
      console.warn("Could not fetch station names mapping:", nameError);
    }

    // 2. Fetch gas stations from official API
    const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?where=within_distance(geom%2C%20geom'POINT(${lon}%20${lat})'%2C%2020km)&limit=100`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch gas stations");

    const data = await response.json();

    return data.results.map((record: any) => {
      const fuels: any[] = [];
      
      if (record.gazole_prix) fuels.push({ name: 'Gazole', price: record.gazole_prix, updatedAt: record.gazole_maj });
      if (record.sp95_prix) fuels.push({ name: 'SP95', price: record.sp95_prix, updatedAt: record.sp95_maj });
      if (record.sp98_prix) fuels.push({ name: 'SP98', price: record.sp98_prix, updatedAt: record.sp98_maj });
      if (record.e10_prix) fuels.push({ name: 'E10', price: record.e10_prix, updatedAt: record.e10_maj });
      if (record.e85_prix) fuels.push({ name: 'E85', price: record.e85_prix, updatedAt: record.e85_maj });
      if (record.gplc_prix) fuels.push({ name: 'GPLc', price: record.gplc_prix, updatedAt: record.gplc_maj });

      // Use the mapping if available. The user says station id corresponds to com_insee.
      // In the API, record.id is usually the station ID.
      const mappedName = stationNamesMap[record.id];
      
      return {
        id: record.id || Math.random().toString(36).substr(2, 9),
        name: mappedName || record.nom || record.adresse || "Station Service",
        brand: record.cp,
        address: record.adresse,
        city: record.ville,
        latitude: record.geom.lat,
        longitude: record.geom.lon,
        distance: record.dist,
        fuels: fuels
      };
    });
  } catch (error) {
    console.error("Error fetching gas stations:", error);
    return [];
  }
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
