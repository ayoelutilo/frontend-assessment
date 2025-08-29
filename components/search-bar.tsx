'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Search, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  favoritesOnly?: boolean;
  onToggleFavoritesOnly?: (value: boolean) => void;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search Pokémon by name or ability...',
  className,
  favoritesOnly = false,
  onToggleFavoritesOnly,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 z-20" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className="pl-12 pr-28 h-14 text-lg bg-white/80 backdrop-blur-sm border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl shadow-lg transition-all duration-200"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={favoritesOnly ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onToggleFavoritesOnly?.(!favoritesOnly)}
                  aria-pressed={favoritesOnly}
                  aria-label={favoritesOnly ? 'Show all Pokémon' : 'Show favourited Pokémon only'}
                  className={cn('h-10 w-10 rounded-full', favoritesOnly ? 'bg-pink-50 text-pink-600 hover:bg-pink-100' : '')}
                >
                  <Heart
                    className={cn('h-4 w-4', favoritesOnly ? 'text-pink-600' : 'text-gray-400')}
                    fill={favoritesOnly ? 'currentColor' : 'none'}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {favoritesOnly ? 'Show all Pokémon' : 'Show favourited Pokémon only'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              aria-label="Clear search"
              className="h-10 w-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
