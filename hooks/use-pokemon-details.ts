import { getPokemonDetails } from '@/lib/api';
import { Pokemon } from '@/types/pokemon';
import { useQuery } from './use-query';

export function usePokemonDetails(pokemonId: string | number | null) {
  const key = pokemonId !== null ? String(pokemonId) : null;
  const { data, isLoading, error } = useQuery<Pokemon | null>(
    'pokemon-details',
    key,
    getPokemonDetails
  );

  return {
    pokemon: data,
    isLoading,
    error,
  };
}