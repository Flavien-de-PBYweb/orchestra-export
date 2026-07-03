"use client";
import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { COUNTRIES, STORES } from "@/lib/data";
import { useCodaSyncStore } from "@/lib/store";
import { Plus, Minus, RotateCcw } from "lucide-react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COUNTRY_COORDS: Record<string, [number, number]> = {
  ALBANIE: [20.2, 41.2],
  ALGERIE: [2.6, 28.0],
  ALLEMAGNE: [10.5, 51.2],
  ARMENIE: [44.5, 40.1],
  CANADA: [-96.8, 56.1],
  "COTE IVOIRE": [-5.5, 7.5],
  CROATIE: [15.9, 45.2],
  ESPAGNE: [-3.7, 40.4],
  FRANCE: [2.3, 46.2],
  GEORGIE: [43.4, 42.3],
  GRECE: [21.8, 39.1],
  ISRAEL: [34.9, 31.5],
  JORDANIE: [36.2, 31.2],
  KAZAKHSTAN: [67.0, 48.0],
  "KOWEÏT": [47.5, 29.3],
  LIBAN: [35.5, 33.9],
  LIBYE: [17.2, 26.3],
  MAROC: [-7.1, 31.8],
  MARTINIQUE: [-61.0, 14.6],
  MAURITANIE: [-10.9, 20.3],
  MOLDAVIE: [28.4, 47.4],
  MONTENEGRO: [19.4, 42.7],
  "NOUVELLE CALEDONIE": [165.6, -20.9],
  "PAYS BAS": [5.3, 52.1],
  POLOGNE: [19.2, 52.1],
  PORTUGAL: [-8.2, 39.4],
  REUNION: [55.5, -21.1],
  ROUMANIE: [24.9, 45.9],
  SENEGAL: [-14.5, 14.4],
  SERBIE: [20.9, 44.0],
  SUISSE: [8.2, 46.8],
  TUNISIE: [9.5, 33.9],
  TURQUIE: [35.2, 38.9],
  OUZBEKISTAN: [64.6, 41.4],
  GHANA: [-1.0, 7.9],
  MADAGASCAR: [46.9, -18.9],
  MONGOLIE: [103.8, 46.8],
  MAURICE: [57.6, -20.3],
  PARAGUAY: [-58.4, -23.4],
  KOSOVO: [20.9, 42.6],
  "ST MARTIN": [-63.1, 18.1],
  "ST PIERRE MIQUELON": [-56.3, 46.8],
};

export function WorldMap() {
  const { stores: syncedStores } = useCodaSyncStore();
  const stores = syncedStores ?? STORES;
  const [tooltip, setTooltip] = useState<{ country: string; count: number; x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([20, 20]);

  const storesByCountry = COUNTRIES.reduce<Record<string, number>>((acc, c) => {
    const count = stores.filter((s) => s.country === c.codaKey).length;
    if (count > 0) acc[c.codaKey] = count;
    return acc;
  }, {});

  const maxStores = Math.max(...Object.values(storesByCountry), 1);

  return (
    <div className="relative w-full h-[360px] bg-gradient-to-b from-blue-50 to-white rounded-2xl border border-gray-100 overflow-hidden">
      <ComposableMap
        projectionConfig={{ scale: 140 }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          zoom={zoom}
          center={center}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onMoveEnd={({ zoom: z, coordinates }: any) => {
            setZoom(z);
            setCenter(coordinates);
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: unknown[] }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E8EDF5"
                  stroke="#C8D3E8"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#D0D9EE", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {Object.entries(storesByCountry).map(([codaKey, count]) => {
            const coords = COUNTRY_COORDS[codaKey];
            if (!coords) return null;
            const country = COUNTRIES.find((c) => c.codaKey === codaKey);
            const size = 4 + (count / maxStores) * 14;
            return (
              <Marker
                key={codaKey}
                coordinates={coords}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onMouseEnter={(e: any) => {
                  setTooltip({
                    country: `${country?.flag ?? ""} ${country?.name ?? codaKey}`,
                    count,
                    x: e.clientX ?? 0,
                    y: e.clientY ?? 0,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                <circle
                  r={size}
                  fill="#E40E20"
                  fillOpacity={0.75}
                  stroke="white"
                  strokeWidth={1.5}
                  style={{ cursor: "pointer" }}
                />
                {count >= 3 && (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize={size * 0.75}
                    fontWeight={700}
                    style={{ pointerEvents: "none" }}
                  >
                    {count}
                  </text>
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
        >
          <p className="font-semibold">{tooltip.country}</p>
          <p className="text-gray-300">{tooltip.count} magasin{tooltip.count > 1 ? "s" : ""}</p>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.5, 12))}
          className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          title="Zoomer"
        >
          <Plus size={14} className="text-gray-600" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 1.5, 0.5))}
          className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          title="Dézoomer"
        >
          <Minus size={14} className="text-gray-600" />
        </button>
        <button
          onClick={() => { setZoom(1); setCenter([20, 20]); }}
          className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          title="Réinitialiser"
        >
          <RotateCcw size={12} className="text-gray-600" />
        </button>
      </div>

      <div className="absolute bottom-3 left-14 text-[10px] text-gray-400">
        Scroll pour zoomer · Clic-glisser pour naviguer
      </div>
      <div className="absolute top-3 right-4 flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-75" />
        <span className="text-[10px] text-gray-500">Présence Orchestra</span>
      </div>
    </div>
  );
}
