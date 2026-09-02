"use client";
import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { COUNTRIES } from "@/lib/data";
import type { Store } from "@/lib/data";
import { Plus, Minus, RotateCcw } from "lucide-react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRY_COORDS: Record<string, [number, number]> = {
  ALBANIE: [20.2, 41.2], ALGERIE: [2.6, 28.0], ALLEMAGNE: [10.5, 51.2],
  ARGENTINE: [-64.0, -34.0], ARMENIE: [44.5, 40.1], BELARUS: [27.9, 53.7],
  BENIN: [2.3, 9.3], BRESIL: [-51.9, -14.2], BULGARIE: [25.5, 42.7],
  CAMEROUN: [12.3, 5.5], CANADA: [-96.8, 56.1], "CAP VERT": [-24.0, 16.0],
  CHILI: [-71.5, -35.7], CONGO: [15.8, -0.2], "COTE IVOIRE": [-5.5, 7.5],
  CROATIE: [15.9, 45.2], EGYPTE: [30.8, 26.8], ESPAGNE: [-3.7, 40.4],
  GABON: [11.6, -0.8], GEORGIE: [43.4, 42.3], GHANA: [-1.0, 7.9],
  GUADELOUPE: [-61.6, 16.3], GUYANE: [-53.1, 3.9], ISRAEL: [34.9, 31.5],
  JORDANIE: [36.2, 31.2], KAZAKHSTAN: [67.0, 48.0], KOSOVO: [20.9, 42.6],
  KOWEIT: [47.5, 29.5], LIBAN: [35.5, 33.9], MADAGASCAR: [46.9, -18.9],
  MARTINIQUE: [-61.0, 14.6], MAURICE: [57.6, -20.3], MAURITANIE: [-10.9, 20.3],
  MOLDAVIE: [28.4, 47.4], MONGOLIE: [103.8, 46.8], "Macédoine": [21.7, 41.6],
  "NOUVELLE CALEDONIE": [165.6, -20.9], OUZBEKISTAN: [64.6, 41.4],
  PARAGUAY: [-58.4, -23.4], PEROU: [-75.0, -9.2], PORTUGAL: [-8.2, 39.4],
  QATAR: [51.2, 25.3], REUNION: [55.5, -21.1], ROUMANIE: [24.9, 45.9],
  RWANDA: [29.9, -1.9], SENEGAL: [-14.5, 14.4], SERBIE: [20.9, 44.0],
  "ST MARTIN": [-63.1, 18.1], "ST PIERRE MIQUELON": [-56.3, 46.8],
  TOGO: [0.8, 8.6], URUGUAY: [-56.0, -32.5], "WEST BANK": [35.3, 31.9],
};

interface Props {
  prospectStores: Store[];
}

export function ProspectMap({ prospectStores }: Props) {
  const [tooltip, setTooltip] = useState<{ country: string; count: number; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([20, 20]);

  const prospectByCountry: Record<string, number> = {};
  prospectStores.forEach((s) => {
    prospectByCountry[s.country] = (prospectByCountry[s.country] ?? 0) + 1;
  });
  const prospectCountryKeys = new Set(Object.keys(prospectByCountry));

  const markers = Object.entries(prospectByCountry)
    .map(([country, count]) => {
      const coords = COUNTRY_COORDS[country];
      if (!coords) return null;
      const meta = COUNTRIES.find((c) => c.codaKey === country);
      return { country, displayName: meta?.name ?? country, flag: meta?.flag ?? "🌍", count, coords };
    })
    .filter(Boolean) as { country: string; displayName: string; flag: string; count: number; coords: [number, number] }[];

  return (
    <div className="relative" style={{ height: 300 }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup zoom={zoom} center={center}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onMoveEnd={({ coordinates, zoom: z }: any) => { setCenter(coordinates); setZoom(z); }}>
          <Geographies geography={GEO_URL}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {({ geographies }: any) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              geographies.map((geo: any) => {
                const geoName = geo.properties.name?.toUpperCase() ?? "";
                const isProspect = Array.from(prospectCountryKeys).some(
                  (k) => k === geoName || geoName.includes(k) || k.includes(geoName.split(" ")[0])
                );
                return (
                  <Geography key={geo.rsmKey} geography={geo}
                    style={{
                      default: { fill: isProspect ? "#EDE9FE" : "#E5E7EB", stroke: "#fff", strokeWidth: 0.4, outline: "none" },
                      hover:   { fill: isProspect ? "#DDD6FE" : "#D1D5DB", stroke: "#fff", strokeWidth: 0.4, outline: "none" },
                      pressed: { fill: isProspect ? "#C4B5FD" : "#9CA3AF", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {markers.map((m) => (
            <Marker key={m.country} coordinates={m.coords}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onMouseEnter={(e: any) => {
                const rect = (e.target as SVGElement).closest("svg")?.getBoundingClientRect();
                if (rect) setTooltip({ country: `${m.flag} ${m.displayName}`, count: m.count, x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}>
              <circle r={Math.min(4 + m.count * 1.5, 10)} fill="#7C3AED" fillOpacity={0.9} stroke="#fff" strokeWidth={1.5} style={{ cursor: "pointer" }} />
              {m.count > 1 && (
                <text textAnchor="middle" y={1} fontSize={8} fontWeight={700} fill="#fff" style={{ pointerEvents: "none" }}>{m.count}</text>
              )}
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Zoom controls */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {[
          { icon: Plus, action: () => setZoom((z) => Math.min(z * 1.5, 8)) },
          { icon: Minus, action: () => setZoom((z) => Math.max(z / 1.5, 0.5)) },
          { icon: RotateCcw, action: () => { setZoom(1); setCenter([20, 20]); } },
        ].map(({ icon: Icon, action }, i) => (
          <button key={i} onClick={action}
            className="w-7 h-7 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center shadow-sm">
            <Icon size={12} />
          </button>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute pointer-events-none z-50 bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl"
          style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}>
          <p className="font-semibold">{tooltip.country}</p>
          <p className="text-violet-300">{tooltip.count} prospect{tooltip.count > 1 ? "s" : ""}</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-violet-600" />
          <span className="text-[10px] text-gray-600 font-medium">Prospect</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-violet-100 border border-violet-200" />
          <span className="text-[10px] text-gray-600 font-medium">Pays prospectable</span>
        </div>
      </div>
    </div>
  );
}
