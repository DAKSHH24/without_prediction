import React, { useEffect } from "react";
import { MapContainer, TileLayer, Rectangle, useMap } from "react-leaflet";
import L from "leaflet";

// Define the fixed bounding box for Pune
const PUNE_BOUNDS = {
  topLeft: [18.5600, 73.8000] as [number, number],     // [lat, lng]
  bottomRight: [18.5000, 73.9000] as [number, number], // [lat, lng]
};

const GRID_SIZE = 12;

interface GridCell {
  row: number;
  col: number;
  cellId: string;
  bounds: [[number, number], [number, number]];
}

interface FixedGridMapProps {
  cellEmissions?: number[][];
  onCellSelect?: (data: { row: number; col: number; cellId: string; bounds: [[number, number], [number, number]] }) => void;
  selectedCellId?: string | null;
  affectedCellIds?: string[];
}

// Component to create the grid pane and render rectangles
function FixedGridOverlay({ cellEmissions, onCellSelect, selectedCellId, affectedCellIds }: FixedGridMapProps) {
  const map = useMap();
  const [paneReady, setPaneReady] = React.useState(false);

  // Create pane only once when map is ready
  useEffect(() => {
    if (!map) return;

    // Create pane only if it doesn't already exist
    if (!map.getPane("gridPane")) {
      map.createPane("gridPane");
      map.getPane("gridPane")!.style.zIndex = "500";
    }

    // Now rectangles are allowed to render
    setPaneReady(true);
  }, [map]);

  // Stop rendering rectangles until pane exists
  if (!paneReady) return null;

  // Calculate grid cell bounds
  const createGridCells = (): GridCell[] => {
    const cells: GridCell[] = [];
    const topLat = PUNE_BOUNDS.topLeft[0];
    const bottomLat = PUNE_BOUNDS.bottomRight[0];
    const leftLng = PUNE_BOUNDS.topLeft[1];
    const rightLng = PUNE_BOUNDS.bottomRight[1];

    const latStep = (topLat - bottomLat) / GRID_SIZE;
    const lngStep = (rightLng - leftLng) / GRID_SIZE;

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cellTopLat = topLat - row * latStep;
        const cellBottomLat = topLat - (row + 1) * latStep;
        const cellLeftLng = leftLng + col * lngStep;
        const cellRightLng = leftLng + (col + 1) * lngStep;

        const bounds: [[number, number], [number, number]] = [
          [cellBottomLat, cellLeftLng],
          [cellTopLat, cellRightLng]
        ];

        cells.push({
          row,
          col,
          cellId: `${col}-${row}`,
          bounds
        });
      }
    }

    return cells;
  };

  const getCellEmission = (row: number, col: number): number =>
    cellEmissions?.[row]?.[col] ?? 0;

  const getEmissionColor = (emission: number): string => {
    if (emission >= 250) return "#dc2626";
    if (emission >= 150) return "#ea580c";
    if (emission >= 50) return "#eab308";
    return "#22c55e";
  };

  const gridCells = createGridCells();

  return (
    <>
      {gridCells.map(cell => {
        const isSelected = cell.cellId === selectedCellId;
        const isAffected = affectedCellIds?.includes(cell.cellId);

        return (
          <Rectangle
            key={cell.cellId}
            bounds={cell.bounds}
            pane="gridPane"
            pathOptions={{
              fillOpacity: isAffected ? 0.6 : 0.35, // More opaque if affected
              color: isSelected ? "#2563eb" : isAffected ? "#f59e0b" : "#ffffff", // Blue if selected, orange if affected, white otherwise
              weight: isSelected ? 3 : isAffected ? 2 : 0.7, // Thicker border if selected or affected
              fillColor: getEmissionColor(getCellEmission(cell.row, cell.col)),
            }}
            eventHandlers={{
              click: () => {
                onCellSelect?.({
                  row: cell.row,
                  col: cell.col,
                  cellId: cell.cellId,
                  bounds: cell.bounds
                });
              },
            }}
          />
        );
      })}
    </>
  );
}

// Main FixedGridMap component
export function FixedGridMap({ cellEmissions, onCellSelect, selectedCellId, affectedCellIds }: FixedGridMapProps) {
  // Calculate center of the bounding box
  const center: [number, number] = [
    (PUNE_BOUNDS.topLeft[0] + PUNE_BOUNDS.bottomRight[0]) / 2,
    (PUNE_BOUNDS.topLeft[1] + PUNE_BOUNDS.bottomRight[1]) / 2,
  ];

  return (
    <div className="bg-white p-6 rounded-lg border">
      {/* TITLE + LEGEND */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg">Neighborhood CO₂ Emissions Map</h3>

        <div className="flex items-center gap-3 text-xs">
          {[
            ["#22c55e", "<50 (Low)"],
            ["#eab308", "50-150 (Medium)"],
            ["#ea580c", "150-250 (High)"],
            ["#dc2626", "≥250 (Very High)"],
          ].map(([color, label]) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAP CONTAINER */}
      <div className="relative w-full" style={{ height: 560 }}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="rounded-lg"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Fixed Geographic Grid */}
          <FixedGridOverlay
            cellEmissions={cellEmissions}
            onCellSelect={onCellSelect}
            selectedCellId={selectedCellId}
            affectedCellIds={affectedCellIds}
          />
        </MapContainer>
      </div>
    </div>
  );
}
