import type { HelpPointCategory } from "@/types";

export interface CategoryMeta {
  id: HelpPointCategory;
  label: string;
  labelTamil: string;
  icon: string; // lucide icon name
  color: string; // brand color hex
  bgColor: string; // light bg for card
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "police",
    label: "Police Assistance",
    labelTamil: "காவல் உதவி",
    icon: "shield",
    color: "#1e3a5f",
    bgColor: "#e8edf3",
  },
  {
    id: "medical",
    label: "Medical Help",
    labelTamil: "மருத்துவ உதவி",
    icon: "cross",
    color: "#dc2626",
    bgColor: "#fde8e8",
  },
  {
    id: "toilet",
    label: "Toilets",
    labelTamil: "கழிவறைகள்",
    icon: "building-2",
    color: "#0891b2",
    bgColor: "#e0f5f9",
  },
  {
    id: "water",
    label: "Drinking Water",
    labelTamil: "குடிநீர்",
    icon: "droplets",
    color: "#2563eb",
    bgColor: "#dbeafe",
  },
  // TODO: Uncomment when Tavix hotel booking is ready for Deepam
  // {
  //   id: "hotel",
  //   label: "Hotels & Stays",
  //   labelTamil: "தங்கும் விடுதி",
  //   icon: "bed-double",
  //   color: "#ea580c",
  //   bgColor: "#ffedd5",
  // },
  {
    id: "parking",
    label: "Parking",
    labelTamil: "வாகன நிறுத்தம்",
    icon: "car",
    color: "#0369a1",
    bgColor: "#e0f2fe",
  },
  {
    id: "bus-stand",
    label: "Temp Bus Stands",
    labelTamil: "தற்காலிக பேருந்து நிலையம்",
    icon: "bus",
    color: "#7c3aed",
    bgColor: "#ede9fe",
  },
  {
    id: "bike-ambulance",
    label: "Bike Ambulance",
    labelTamil: "பைக் ஆம்புலன்ஸ்",
    icon: "bike",
    color: "#e11d48",
    bgColor: "#ffe4e6",
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<HelpPointCategory, CategoryMeta>;
