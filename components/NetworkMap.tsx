"use client";

import { useEffect, useRef, useState } from "react";
import type * as L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapaPoint {
  nomeEmpresa: string;
  categoria: string;
  bairro: string;
  cidade: string;
  lat: number;
  lng: number;
}

interface MapaData {
  pontos: MapaPoint[];
  anunciantes: MapaPoint[];
}

const COR_PONTO = "#3B82F6";
const COR_ANUNCIANTE = "#10B981";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function NetworkMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fittedRef = useRef(false);
  const [status, setStatus] = useState<"carregando" | "pronto" | "erro">("carregando");
  const [points, setPoints] = useState<MapaData>({ pontos: [], anunciantes: [] });

  useEffect(() => {
    let active = true;
    (async () => {
      const leaflet = await import("leaflet");
      if (!active || !containerRef.current) return;
      const map = leaflet.map(containerRef.current, {
        scrollWheelZoom: false,
        attributionControl: true,
      });
      mapRef.current = map;
      layerRef.current = leaflet.layerGroup().addTo(map);
      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        })
        .addTo(map);
      map.setView([-14.235, -51.925], 4);
      setStatus("pronto");
    })();
    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/mapa", { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao carregar o mapa");
        const data = (await res.json()) as MapaData;
        if (!active) return;
        setPoints(data);

        const leaflet = await import("leaflet");
        const map = mapRef.current;
        const layer = layerRef.current;
        if (!active || !map || !layer) return;

        layer.clearLayers();
        const all: Array<[number, number]> = [];
        const add = (p: MapaPoint, color: string) => {
          all.push([p.lat, p.lng]);
          leaflet
            .circleMarker([p.lat, p.lng], {
              radius: 9,
              color: "#ffffff",
              weight: 2,
              fillColor: color,
              fillOpacity: 1,
            })
            .bindPopup(
              `<strong>${escapeHtml(p.nomeEmpresa)}</strong><br/>${escapeHtml(
                p.categoria,
              )}<br/>${escapeHtml(p.bairro)} · ${escapeHtml(p.cidade)}`,
            )
            .addTo(layer);
        };
        data.pontos.forEach((p) => add(p, COR_PONTO));
        data.anunciantes.forEach((a) => add(a, COR_ANUNCIANTE));

        if (!fittedRef.current && all.length > 0) {
          fittedRef.current = true;
          map.fitBounds(leaflet.latLngBounds(all), { padding: [48, 48], maxZoom: 14 });
        }
      } catch {
        if (active) setStatus("erro");
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const total = points.pontos.length + points.anunciantes.length;

  return (
    <div>
      <div className="relative z-0 h-[420px] overflow-hidden rounded-2xl border border-edge shadow-sm">
        <div ref={containerRef} className="h-full w-full" />
        {status === "carregando" && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 text-sm text-zinc-500">
            Carregando mapa…
          </div>
        )}
        {status === "erro" && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 text-sm text-zinc-500">
            Não foi possível carregar o mapa. Tente novamente em instantes.
          </div>
        )}
        {status === "pronto" && total === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="rounded-full bg-surface/90 px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm border border-slate-200">
              📍 Mapeamento ativo — cadastre seu ponto para aparecer no radar regional.
            </p>
          </div>
        )}
      </div>
      {total > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: COR_PONTO }} />
            {points.pontos.length} ponto{points.pontos.length === 1 ? "" : "s"} de exibição
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: COR_ANUNCIANTE }} />
            {points.anunciantes.length} anunciante{points.anunciantes.length === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </div>
  );
}