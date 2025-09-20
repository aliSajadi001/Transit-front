import {
  Car,
  Palette,
  Globe,
  MapPin,
  Building2,
  Wrench,
  Ship,
  User,
  type LucideIcon,
} from "lucide-react";


type InfoItem = {
  name: string;
  i18nKey: string;
  count: number;
  icon: LucideIcon;
  link: string;
}; // دیتای ماک

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export const infoItems: InfoItem[] = [
  {
    name: "Types of cars",
    i18nKey: "types_of_cars",
    count: 245,
    icon: Car,
    link: `/basic-data/${toSlug("Types of cars")}`,
  },
  {
    name: "Colors",
    i18nKey: "colors",
    count: 12,
    icon: Palette,
    link: `/basic-data/${toSlug("Colors")}`,
  },
  {
    name: "Countries",
    i18nKey: "countries",
    count: 8,
    icon: Globe,
    link: `/basic-data/${toSlug("Countries")}`,
  },
  {
    name: "Destinations",
    i18nKey: "destinations",
    count: 42,
    icon: MapPin,
    link: `/basic-data/${toSlug("Destinations")}`,
  },
  {
    name: "Companies",
    i18nKey: "companies",
    count: 156,
    icon: Building2,
    link: `/basic-data/${toSlug("Companies")}`,
  },
  {
    name: "Accessories",
    i18nKey: "accessories",
    count: 321,
    icon: Wrench,
    link: `/basic-data/${toSlug("Accessories")}`,
  },
  {
    name: "Shipping",
    i18nKey: "shipping",
    count: 0,
    icon: Ship,
    link: `/basic-data/${toSlug("Shipping")}`,
  },
  {
    name: "Clearance agents",
    i18nKey: "clearance_agents",
    count: 3,
    icon: User,
    link: `/basic-data/${toSlug("Clearance agents")}`,
  },
];
