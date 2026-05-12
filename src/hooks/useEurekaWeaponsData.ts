import weaponsData from '@/data/eureka-weapons.json';
import materialsData from '@/data/eureka-materials.json';
import type { EurekaWeapon, EurekaMaterial } from '../types/eureka-gear';

interface State {
  weapons: EurekaWeapon[];
  materials: EurekaMaterial[];
  loading: boolean;
  error: string | null;
}

const WEAPONS = weaponsData as EurekaWeapon[];
const MATERIALS = materialsData as EurekaMaterial[];

export function useEurekaWeaponsData(): State {
  return { weapons: WEAPONS, materials: MATERIALS, loading: false, error: null };
}
