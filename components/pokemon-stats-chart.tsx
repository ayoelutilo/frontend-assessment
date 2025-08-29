"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadarChart,
  Radar,
} from "recharts";
import { calculateAbilityEffect } from "@/lib/abilityEffects";
import { Pokemon } from "@/types/pokemon";
import { formatPokemonName } from "@/lib/pokemon-utils";
import { BarChart3, Zap } from "lucide-react";

type Props = {
  pokemon: Pokemon;
};

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

function sanitizeStatKey(key: string) {
  return key.toLowerCase();
}

export default function PokemonStatsChart({ pokemon }: Props) {
  const abilities = pokemon.abilities?.map((a) => a.ability.name) ?? [];
  const [selectedAbility, setSelectedAbility] = React.useState<string>("none");

  // Restore saved ability selection per Pokémon
  React.useEffect(() => {
    if (!pokemon?.id) return;
    try {
      const saved = localStorage.getItem(`chartAbility:${pokemon.id}`);
      if (saved) {
        if (saved === "none" || abilities.includes(saved)) {
          setSelectedAbility(saved);
        } else {
          setSelectedAbility("none");
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon?.id]);

  // Persist ability selection when it changes
  React.useEffect(() => {
    if (!pokemon?.id) return;
    try {
      localStorage.setItem(`chartAbility:${pokemon.id}`, selectedAbility);
    } catch {}
  }, [pokemon?.id, selectedAbility]);

  const baseStats = (pokemon.stats ?? []).map((s) => ({
    key: sanitizeStatKey(s.stat.name),
    label: STAT_LABELS[s.stat.name as keyof typeof STAT_LABELS] ?? s.stat.name,
    value: s.base_stat,
  }));

  const data = baseStats.map((s) => {
    if (!selectedAbility || selectedAbility === "none") {
      return { stat: s.label, base: s.value, modified: s.value };
    }
    const { modified } = calculateAbilityEffect(selectedAbility, s.key, s.value);
    return { stat: s.label, base: s.value, modified };
  });

  const maxDomain = Math.max(
    120,
    ...data.map((d) => Math.max(d.base, d.modified))
  );

  const chartConfig = {
    base: {
      label: "Base",
      color: "hsl(var(--chart-2))",
      // color-matched square used in legend and tooltip
      icon: (() => (
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 rounded-[2px]"
          style={{ backgroundColor: "var(--color-base)" }}
        />
      )) as React.ComponentType,
    },
    modified: {
      label:
        selectedAbility && selectedAbility !== "none"
          ? `With ${formatPokemonName(selectedAbility)}`
          : "Modified",
      color: "hsl(var(--chart-1))",
      icon: (() => (
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 rounded-[2px]"
          style={{ backgroundColor: "var(--color-modified)" }}
        />
      )) as React.ComponentType,
    },
  } as const;

  const modifications = baseStats
    .map((s) => {
      if (!selectedAbility || selectedAbility === "none") return null;
      const res = calculateAbilityEffect(selectedAbility, s.key, s.value);
      if (res.modified !== s.value) {
        return `${s.label}: ${res.effect}`;
      }
      return null;
    })
    .filter(Boolean) as string[];

  if (!pokemon.stats || pokemon.stats.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
              <BarChart3 className="h-5 w-5 text-purple-600" aria-hidden="true" />
              Stats Chart
            </CardTitle>
            <CardDescription>
              Compare base stats vs ability-modified stats.
            </CardDescription>
          </div>
          <div className="min-w-[220px]">
            <Select value={selectedAbility} onValueChange={setSelectedAbility}>
              <SelectTrigger aria-label="Select ability" className="pl-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" aria-hidden="true" />
                  <SelectValue placeholder="Select ability" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {abilities.map((name) => (
                  <SelectItem key={name} value={name}>
                    {formatPokemonName(name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[280px] md:h-[360px] w-full rounded-md border bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30"
        >
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="stat" />
            <PolarRadiusAxis domain={[0, maxDomain]} tickCount={6} />
            <Radar
              name="Base"
              dataKey="base"
              stroke="var(--color-base)"
              fill="var(--color-base)"
              fillOpacity={0.2}
            />
            <Radar
              name="Modified"
              dataKey="modified"
              stroke="var(--color-modified)"
              fill="var(--color-modified)"
              fillOpacity={0.35}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>

        {selectedAbility && selectedAbility !== "none" && (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              Ability effects for {formatPokemonName(selectedAbility)}:
            </div>
            {modifications.length > 0 ? (
              <ul className="list-disc pl-5 text-sm">
                {modifications.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            ) : (
              <Badge variant="secondary">No direct stat modifications</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
