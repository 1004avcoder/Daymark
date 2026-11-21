import React from 'react';
import {
  BookOpen,
  BookMarked,
  Code,
  Flame,
  Dumbbell,
  Laptop,
  Briefcase,
  Coffee,
  Pencil,
  Music,
  Heart,
  Compass,
  Smile,
  Clock,
  Sparkles,
  LucideProps,
} from 'lucide-react';

export const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  BookOpen,
  BookMarked,
  Code,
  Flame,
  Dumbbell,
  Laptop,
  Briefcase,
  Coffee,
  Pencil,
  Music,
  Heart,
  Compass,
  Smile,
  Clock,
  Sparkles,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f97316', // Orange
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#eab308', // Yellow
  '#64748b', // Slate
];

interface ActivityIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const ActivityIcon: React.FC<ActivityIconProps> = ({ name, className = '', size = 20 }) => {
  const IconComponent = ICON_MAP[name] || Sparkles;
  return <IconComponent size={size} className={className} />;
};
