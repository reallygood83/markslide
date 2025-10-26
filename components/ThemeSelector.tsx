'use client';

import { Card } from '@/components/ui/card';
import { Theme, themes } from '@/lib/themes';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  selectedTheme: Theme | null;
  onSelectTheme: (theme: Theme) => void;
}

export function ThemeSelector({ selectedTheme, onSelectTheme }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {themes.map((theme) => (
        <Card
          key={theme.id}
          className={`theme-card cursor-pointer overflow-hidden ${
            selectedTheme?.id === theme.id
              ? 'ring-2 ring-primary ring-offset-2 glow'
              : 'hover:border-primary/50'
          }`}
          onClick={() => onSelectTheme(theme)}
        >
          {/* Theme Preview */}
          <div
            className="h-32 p-4 flex flex-col justify-between"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
            }}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="w-16 h-2 bg-white/80 rounded-full" />
                <div className="w-24 h-2 bg-white/60 rounded-full" />
              </div>
              {selectedTheme?.id === theme.id && (
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="w-32 h-1.5 bg-white/60 rounded-full" />
              <div className="w-20 h-1.5 bg-white/40 rounded-full" />
            </div>
          </div>

          {/* Theme Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1">{theme.name}</h3>
            <p className="text-sm text-gray-600">{theme.description}</p>

            {/* Color Palette */}
            <div className="flex space-x-2 mt-3">
              {Object.entries(theme.colors)
                .slice(0, 3)
                .map(([key, color]) => (
                  <div
                    key={key}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: color }}
                    title={key}
                  />
                ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
