'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPokemonName, getPokemonImageUrl } from '@/lib/pokemon-utils';
import { Pokemon } from '@/types/pokemon';
import Image from 'next/image';
import { useState } from 'react';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: (pokemon: Pokemon) => void;
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleClick = () => {
    onClick?.(pokemon);
  };

  return (
    <Card 
      className="group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 border-0 bg-white/90 backdrop-blur-sm overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="text-center">
          {/* Pokemon ID */}
          <div className="text-sm font-medium text-muted-foreground mb-2">
            #{pokemon.id.toString().padStart(3, '0')}
          </div>

          {/* Pokemon Image */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            {!imageLoaded && (
              <Skeleton className="absolute inset-0 rounded-full" />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
            {!imageError ? (
              <Image
                src={getPokemonImageUrl(pokemon.id)}
                alt={formatPokemonName(pokemon.name)}
                fill
                loading="lazy"
                unoptimized
                className={`object-contain transition-all duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } group-hover:scale-110`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-6xl">
                🎯
              </div>
            )}
          </div>

          {/* Pokemon Name */}
          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-200">
            {formatPokemonName(pokemon.name)}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}
