export interface FuelPrice {
  name: string;
  price: number;
  updatedAt: string;
}

export interface GasStation {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  distance?: number;
  fuels: FuelPrice[];
  brand?: string;
}

export type FuelType = 'Gazole' | 'SP95' | 'SP98' | 'E10' | 'E85' | 'GPLc';

export const FUEL_TYPES: FuelType[] = ['Gazole', 'E10', 'SP95', 'SP98', 'E85', 'GPLc'];
