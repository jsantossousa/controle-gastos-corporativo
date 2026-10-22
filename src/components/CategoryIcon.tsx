import React from 'react';
import {
  UtensilsCrossed,
  ShoppingCart,
  Car,
  HeartPulse,
  Home,
  Receipt,
  GraduationCap,
  Ticket,
  CircleDashed,
  LucideProps,
} from 'lucide-react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../utils/constants';

const ICONS: Record<CategoryId, React.FC<LucideProps>> = {
  alimentacao: UtensilsCrossed,
  mercado: ShoppingCart,
  transporte: Car,
  saude: HeartPulse,
  moradia: Home,
  servicos: Receipt,
  educacao: GraduationCap,
  lazer: Ticket,
  outro: CircleDashed,
};

interface CategoryIconProps {
  category: CategoryId;
  className?: string;
  /** Render the icon inside a tinted square badge. */
  badge?: boolean;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-4 h-4', badge }) => {
  const cat = CATEGORIES[category] || CATEGORIES.outro;
  const Icon = ICONS[category] || CircleDashed;

  if (!badge) return <Icon className={className} style={{ color: cat.color }} />;

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${cat.color}14` }}
    >
      <Icon className="w-[18px] h-[18px]" style={{ color: cat.color }} strokeWidth={2} />
    </div>
  );
};
