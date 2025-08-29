'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { usePokemonDetails } from '@/hooks/use-pokemon-details';
import { formatPokemonName, getPokemonImageUrl, getTypeColor } from '@/lib/pokemon-utils';
import { ArrowLeft, BarChart3, Heart, Info, Share, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAbilityDetails } from '@/hooks/use-ability-details';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
import { toast } from '@/hooks/use-toast';

const PokemonStatsChart = dynamic(() => import('@/components/pokemon-stats-chart'), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle>Stats Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] md:h-[360px] w-full animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  ),
});

interface PokemonDetailPageProps {
  params: {
    id: string;
  };
}

function AbilityRow({
  name,
  isHidden,
}: {
  name: string;
  isHidden: boolean;
}) {
  const { ability, isLoading, error } = useAbilityDetails(name);
  const effectEntry = ability?.effect_entries?.find((e) => e.language?.name === 'en') ?? ability?.effect_entries?.[0];
  const effect = effectEntry?.effect;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant={isHidden ? 'destructive' : 'default'} className="text-xs">
          {formatPokemonName(name)}
        </Badge>
        {isHidden && (
          <Badge variant="outline" className="text-xs">
            Hidden
          </Badge>
        )}
      </div>
      <div className="text-sm text-gray-600" aria-live="polite">
        {isLoading
          ? 'Loading description…'
          : error
          ? 'Failed to load description.'
          : effect || 'No description available.'}
      </div>
    </div>
  );
}

export default function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pokemon, isLoading, error } = usePokemonDetails(params.id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tab, setTab] = useState<string>(() => {
    const t = searchParams.get('tab');
    return t === 'chart' ? 'chart' : 'details';
  });

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    // Try Web Share API first
    if (navigator.share && pokemon) {
      try {
        await navigator.share({
          title: `${formatPokemonName(pokemon.name)} - Pokédex`,
          text: `Check out ${formatPokemonName(pokemon.name)} in the Pokédex!`,
          url: window.location.href,
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard' });
    } catch {
      toast({ title: 'Unable to copy link' });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite((prev) => {
      const next = !prev;
      try {
        if (pokemon?.id) {
          localStorage.setItem(`favorite:${pokemon.id}`, next ? '1' : '0');
        }
      } catch {}
      return next;
    });
  };

  // Persist favorite state per Pokémon in localStorage
  useEffect(() => {
    if (!pokemon?.id) return;
    try {
      const saved = localStorage.getItem(`favorite:${pokemon.id}`);
      setIsFavorite(saved === '1');
    } catch {}
  }, [pokemon?.id]);

  // Keep tab state in the URL for deep-linking and refresh persistence
  useEffect(() => {
    if (!pathname) return;
    const sp = new URLSearchParams(Array.from(searchParams.entries()));
    sp.set('tab', tab);
    router.replace(`${pathname}?${sp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Respond to browser navigation (back/forward) by syncing tab from URL
  useEffect(() => {
    const t = searchParams.get('tab');
    const next = t === 'chart' ? 'chart' : 'details';
    setTab((prev) => (prev !== next ? next : prev));
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-4" />
                  <Skeleton className="h-64 w-64 mx-auto mb-4 rounded-full" />
                  <Skeleton className="h-8 w-48 mx-auto mb-4" />
                  <div className="flex gap-2 justify-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-16" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-2 flex-1" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800">
            Pokémon Not Found
          </h2>
          <p className="text-gray-600 max-w-md">{error.message}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800">
            Pokémon Not Found
          </h2>
          <p className="text-gray-600 max-w-md">
            The Pokémon you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="sticky top-0 z-20 mb-6 rounded-lg border border-gray-200 bg-white/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3">
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-xl md:text-2xl font-bold">
                <Zap className="h-5 w-5" aria-hidden="true" />
                {formatPokemonName(pokemon.name)}
              </div>
              <div className="text-sm text-muted-foreground">
                #{pokemon.id.toString().padStart(3, '0')}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={toggleFavorite}
                variant={isFavorite ? 'default' : 'outline'}
                size="sm"
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
                <span className="sr-only">{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                aria-label={`Share ${formatPokemonName(pokemon.name)}`}
              >
                <Share className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Share</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList
            className="grid w-full grid-cols-2 rounded-xl shadow-sm bg-gradient-to-r from-blue-50/60 via-white/70 to-purple-50/60 backdrop-blur-md border border-gray-200 p-1 shadow-inner"
            aria-label="Pokémon detail sections"
          >
            <TabsTrigger
              value="details"
              aria-current={tab === 'details' ? 'page' : undefined}
              className="relative gap-2 font-semibold text-muted-foreground rounded-xl px-4 py-2 transition-all hover:bg-blue-50/60 hover:text-blue-700 overflow-hidden data-[state=active]:!text-blue-700 data-[state=active]:!bg-blue-50 data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-blue-200 data-[state=active]:shadow-sm after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-[1px] after:h-0.5 after:rounded-full after:bg-transparent data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-blue-500 data-[state=active]:after:to-purple-500"
            >
              <Info className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="chart"
              aria-current={tab === 'chart' ? 'page' : undefined}
              className="relative gap-2 font-semibold text-muted-foreground rounded-xl px-4 py-2 transition-all hover:bg-purple-50/60 hover:text-purple-700 overflow-hidden data-[state=active]:!text-purple-700 data-[state=active]:!bg-purple-50 data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-purple-200 data-[state=active]:shadow-sm after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-[1px] after:h-0.5 after:rounded-full after:bg-transparent data-[state=active]:after:bg-gradient-to-r data-[state=active]:after:from-purple-500 data-[state=active]:after:to-pink-500"
            >
              <BarChart3 className="h-4 w-4 text-purple-600" aria-hidden="true" />
              <span>Stats Chart</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pokemon Image & Basic Info */}
              <Card className="overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
                <CardContent className="p-6">
                  <div className="text-center">
                    {/* Pokemon Image */}
                    <div className="relative w-64 h-64 mx-auto mb-6">
                      {!imageLoaded && (
                        <Skeleton className="absolute inset-0 rounded-full" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full opacity-50" />
                      {!imageError ? (
                        <Image
                          src={getPokemonImageUrl(pokemon.id)}
                          alt={formatPokemonName(pokemon.name)}
                          fill
                          priority
                          sizes="256px"
                          className={`object-contain transition-all duration-300 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-6xl" role="img" aria-label="Pokémon artwork placeholder">
                          🎯
                        </div>
                      )}
                    </div>

                    {/* Pokemon Types */}
                    {pokemon.types && (
                      <div className="flex gap-2 justify-center mb-6">
                        {pokemon.types.map((typeInfo) => (
                          <Badge
                            key={typeInfo.type.name}
                            variant="outline"
                            className={`px-3 py-1 text-base font-medium text-white border-0 ${getTypeColor(typeInfo.type.name)}`}
                          >
                            {formatPokemonName(typeInfo.type.name)}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Physical Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {pokemon.height ? (pokemon.height / 10).toFixed(1) : '?'} m
                        </div>
                        <div className="text-sm text-muted-foreground">Height</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {pokemon.weight ? (pokemon.weight / 10).toFixed(1) : '?'} kg
                        </div>
                        <div className="text-sm text-muted-foreground">Weight</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Information */}
              <div className="space-y-6">
                {/* Abilities */}
                {pokemon.abilities && pokemon.abilities.length > 0 && (
                  <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Abilities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pokemon.abilities.map((abilityInfo) => (
                          <AbilityRow
                            key={abilityInfo.slot}
                            name={abilityInfo.ability.name}
                            isHidden={abilityInfo.is_hidden}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Base Stats */}
                {pokemon.stats && pokemon.stats.length > 0 && (
                  <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Base Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pokemon.stats.map((stat) => {
                          const statName = stat.stat.name
                            .replace('special-attack', 'Sp. Atk')
                            .replace('special-defense', 'Sp. Def')
                            .replace('hp', 'HP')
                            .replace('attack', 'Attack')
                            .replace('defense', 'Defense')
                            .replace('speed', 'Speed');

                          const percentage = (stat.base_stat / 255) * 100;

                          return (
                            <div key={stat.stat.name} className="flex items-center gap-4">
                              <div className="w-28 text-right text-sm font-medium text-gray-700">
                                {statName}
                              </div>
                              <div className="flex-1">
                                <Progress
                                  value={percentage}
                                  className="h-2"
                                />
                              </div>
                              <div className="w-12 text-right font-bold text-gray-800">
                                {stat.base_stat}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Total Stats */}
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-4">
                            <div className="w-20 text-right text-sm font-bold">
                              Total
                            </div>
                            <div className="flex-1"></div>
                            <div className="w-12 text-right font-bold text-purple-600">
                              {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chart">
            <PokemonStatsChart pokemon={pokemon} />
          </TabsContent>
        </Tabs>
    </div>
  </div>
);
}