'use client';

import { LoadingGrid } from '@/components/loading-grid';
import { NoPokemonFound } from '@/components/no-pokemon-found';
import { PokemonCard } from '@/components/pokemon-card';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { usePokemonList } from '@/hooks/use-pokemon-list';
import { Pokemon } from '@/types/pokemon';
import { RefreshCw, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
 

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const { pokemon: allPokemon, isLoading, error } = usePokemonList();

  // Filter Pokemon based on favorites and search query
  const filteredPokemon = useMemo(() => {
    if (!allPokemon) return allPokemon;

    let result = allPokemon;

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((p) => {
        try {
          return localStorage.getItem(`favorite:${p.id}`) === '1';
        } catch {
          return false;
        }
      });
    }

    // Search filter
    const q = searchQuery.trim().toLowerCase();
    if (!q) return result;

    return result.filter((pokemon) => {
      if (pokemon.name.toLowerCase().includes(q)) return true;
      if (pokemon.abilities) {
        return pokemon.abilities.some((ability) =>
          ability.ability.name.toLowerCase().includes(q)
        );
      }
      return false;
    });
  }, [allPokemon, searchQuery, showFavoritesOnly]);

  const handlePokemonClick = (pokemon: Pokemon) => {
    router.push(`/pokemon/${pokemon.id}`);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800">
            Something went wrong
          </h2>
          <p className="text-gray-600 max-w-md">{error.message}</p>
          <Button onClick={handleRetry} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pokédex
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Discover, explore, and build teams with Pokémon
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search with embedded Favourited toggle */}
        <div className="mx-auto mb-6 max-w-2xl">
          <SearchBar
            onSearch={setSearchQuery}
            className="w-full"
            favoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={setShowFavoritesOnly}
          />
        </div>

        {isLoading ? (
          <LoadingGrid />
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6">
              <p className="text-gray-600 text-center">
                {searchQuery ? (
                  <>
                    Found{' '}
                    <span className="font-semibold text-blue-600">
                      {filteredPokemon?.length || 0}
                    </span>{' '}
                    Pokémon
                    {searchQuery && (
                      <span> matching &ldquo;{searchQuery}&rdquo;</span>
                    )}
                    {showFavoritesOnly && ' in favorites'}
                  </>
                ) : (
                  <>
                    Showing{' '}
                    <span className="font-semibold text-blue-600">
                      {filteredPokemon?.length ?? 0}
                    </span>{' '}
                    Pokémon{showFavoritesOnly && ' (favorites only)'}
                  </>
                )}
              </p>
            </div>

            {/* Pokemon Grid */}
            {filteredPokemon && filteredPokemon.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredPokemon.map((pokemon) => (
                  <PokemonCard 
                    key={pokemon.id} 
                    pokemon={pokemon} 
                    onClick={handlePokemonClick}
                  />
                ))}
              </div>
            ) : (
              <NoPokemonFound />
            )}
          </>
        )}
      </div>
    </div>
  );
}
