
import { StaticImageData } from "next/image";

export interface Pooja {
  id?: string;
  name?: string;         // legacy fallback
  name_en?: string;
  name_hi?: string;
  name_mr?: string;
  price: number;
  time?: string;
  duration?: string;      // legacy fallback
  duration_en?: string;
  duration_hi?: string;
  duration_mr?: string;
  benefits?: string[];    // legacy fallback
  benefits_en?: string[];
  benefits_hi?: string[];
  benefits_mr?: string[];
  description?: string[]; // legacy fallback
  description_en?: string;
  description_hi?: string;
  description_mr?: string;
  image?: StaticImageData | string;
  category?: string;
  category_en?: string;
  category_hi?: string;
  category_mr?: string;
}

export interface TempleEvent {
  name?: string;          // legacy fallback
  name_en?: string;
  name_hi?: string;
  name_mr?: string;
  date: string;
}

export interface Temple {
  id: number;
  name?: string;          // legacy fallback
  name_en?: string;
  name_hi?: string;
  name_mr?: string;
  location?: string;      // legacy fallback
  location_en?: string;
  location_hi?: string;
  location_mr?: string;
  fullAddress?: string;   // legacy fallback
  fullAddress_en?: string;
  fullAddress_hi?: string;
  fullAddress_mr?: string;
  description?: string;   // legacy fallback
  description_en?: string;
  description_hi?: string;
  description_mr?: string;
  history?: string;       // legacy fallback
  history_en?: string;
  history_hi?: string;
  history_mr?: string;
  image: StaticImageData | string;
  heroImages?: (StaticImageData | string)[];
  gallery?: (StaticImageData | string)[];
  rating: number;
  reviews: number;
  category?: string;      // legacy fallback
  category_en?: string;
  category_hi?: string;
  category_mr?: string;
  liveStatus: boolean;
  openTime: string;
  phone?: string;
  website?: string;
  mapUrl?: string;
  viewers?: string;
  poojas?: Pooja[];
  events?: TempleEvent[];
}
