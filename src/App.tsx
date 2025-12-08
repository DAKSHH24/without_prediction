import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card } from './components/ui/card';
import { toast } from "sonner";
import { FixedGridMap } from './components/FixedGridMap';
import { SimulationControls } from './components/SimulationControls';
import { KPIMetrics } from './components/KPIMetrics';
import { InterventionPanel } from './components/InterventionPanel';
import { RecommendationPanel } from './components/RecommendationPanel';
import { Map, BarChart3, Settings, TrendingUp, Search } from 'lucide-react';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Slider } from './components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';


// Types
interface GridCell {
  id: string;
  x: number;
  y: number;
  emission: number;
  type: 'residential' | 'industrial' | 'commercial' | 'transport';
  interventions: Intervention[];
}

interface Intervention {
  id: string;
  type: 'capture_unit' | 'vertical_garden' | 'solar_panel';
  efficiency: number;
  name: string;
  icon: string;
}

interface InterventionType {
  id: string;
  name: string;
  type: 'capture_unit' | 'vertical_garden' | 'solar_panel';
  efficiency: number;
  cost: number;
  description: string;
  icon: string;
  suitableFor: string[];
}

interface SimulationParameters {
  green: number;
  building: number;
  water: number;
  vehicles: number;
  industrial: number;
  energy: number;
  congestion: number;
  publicTransport: number;
}

interface Recommendation {
  intervention: string;
  explanation: string;
  reductionPercent: number;
  cellId: string;
  cellType: string;
  emission: number;
}

export default function App() {
  // State
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionType | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('Default Scenario');
  const [showInterventions, setShowInterventions] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Prediction parameters
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [populationGrowth, setPopulationGrowth] = useState<number>(0);
  const [vehicleGrowth, setVehicleGrowth] = useState<number>(0);
  const [industrialGrowth, setIndustrialGrowth] = useState<number>(0);
  const [residentialGrowth, setResidentialGrowth] = useState<number>(0);
  const [commercialGrowth, setCommercialGrowth] = useState<number>(0);
  const [predictionYears, setPredictionYears] = useState<number>(5);
  const [predictionResults, setPredictionResults] = useState<Array<{ year: number; emission: number }>>([]);
  const [showCharts, setShowCharts] = useState<boolean>(true);

  // Simulation parameters - new factors
  const [parameters, setParameters] = useState<SimulationParameters>({
    green: 30,
    building: 60,
    water: 15,
    vehicles: 70,
    industrial: 50,
    energy: 65,
    congestion: 55,
    publicTransport: 40,
  });

  // Mock data
  const [gridData, setGridData] = useState<GridCell[]>(() => {
    const cells: GridCell[] = [];
    for (let i = 0; i < 144; i++) { // 12x12 grid
      const x = i % 12;
      const y = Math.floor(i / 12);
      const types: GridCell['type'][] = ['residential', 'industrial', 'commercial', 'transport'];
      const type = types[Math.floor(Math.random() * types.length)];

      let baseEmission = 0;
      switch (type) {
        case 'industrial': baseEmission = Math.random() * 60 + 30; break;
        case 'commercial': baseEmission = Math.random() * 40 + 20; break;
        case 'transport': baseEmission = Math.random() * 35 + 15; break;
        case 'residential': baseEmission = Math.random() * 25 + 5; break;
      }

      cells.push({
        id: `${x}-${y}`,
        x,
        y,
        emission: baseEmission,
        type,
        interventions: []
      });
    }
    return cells;
  });

  const availableInterventions: InterventionType[] = [
    {
      id: 'capture_unit_1',
      name: 'Industrial CO₂ Capture Unit',
      type: 'capture_unit',
      efficiency: 35,
      cost: 50000,
      description: 'High-capacity capture system for industrial emissions',
      icon: '🏭',
      suitableFor: ['industrial', 'commercial']
    },
    {
      id: 'capture_unit_2',
      name: 'Compact Capture System',
      type: 'capture_unit',
      efficiency: 20,
      cost: 25000,
      description: 'Smaller capture unit for moderate emission sources',
      icon: '⚙️',
      suitableFor: ['commercial', 'transport']
    },
    {
      id: 'vertical_garden_1',
      name: 'Vertical Garden Wall',
      type: 'vertical_garden',
      efficiency: 15,
      cost: 8000,
      description: 'Living wall system that absorbs CO₂ naturally',
      icon: '🌿',
      suitableFor: ['residential', 'commercial']
    },
    {
      id: 'vertical_garden_2',
      name: 'Rooftop Garden System',
      type: 'vertical_garden',
      efficiency: 25,
      cost: 15000,
      description: 'Extensive rooftop vegetation for CO₂ absorption',
      icon: '🌱',
      suitableFor: ['residential', 'commercial', 'industrial']
    },
    {
      id: 'solar_panel_1',
      name: 'Solar Panel Array',
      type: 'solar_panel',
      efficiency: 12,
      cost: 12000,
      description: 'Reduces emissions by replacing grid electricity',
      icon: '☀️',
      suitableFor: ['residential', 'commercial', 'industrial']
    }
  ];

  const placedInterventions = gridData.flatMap(cell =>
    cell.interventions.map(intervention => ({
      id: `${cell.id}-${intervention.id}`,
      cellId: cell.id,
      interventionType: availableInterventions.find(a => a.id === intervention.id)!,
      efficiency: intervention.efficiency
    }))
  ).filter(p => p.interventionType);

  // Calculate KPIs
  const calculateKPIs = (data: GridCell[]) => {
    const baseEmissions = data.reduce((sum, cell) => sum + cell.emission, 0);
    const currentEmissions = data.reduce((sum, cell) => {
      let reduction = 0;
      cell.interventions.forEach(intervention => {
        reduction += cell.emission * (intervention.efficiency / 100);
      });
      return sum + (cell.emission - reduction);
    }, 0);

    const totalReduction = baseEmissions - currentEmissions;
    const reductionPercentage = (totalReduction / baseEmissions) * 100;
    const interventionCount = data.reduce((sum, cell) => sum + cell.interventions.length, 0);
    const totalCost = placedInterventions.reduce((sum, p) => sum + p.interventionType.cost, 0);
    const hotspotCount = data.filter(cell => {
      const currentEmission = cell.emission - cell.interventions.reduce((sum, i) => sum + cell.emission * (i.efficiency / 100), 0);
      return currentEmission > 30;
    }).length;
    const avgEfficiency = interventionCount > 0 ?
      placedInterventions.reduce((sum, p) => sum + p.efficiency, 0) / interventionCount : 0;

    return {
      totalEmissions: currentEmissions,
      emissionReduction: reductionPercentage,
      interventionEfficiency: avgEfficiency,
      costEffectiveness: totalReduction > 0 ? totalCost / totalReduction : 0,
      projectedSavings: totalReduction,
      hotspotCount
    };
  };

  const baselineKPIs = {
    totalEmissions: gridData.reduce((sum, cell) => sum + cell.emission, 0),
    emissionReduction: 0,
    interventionEfficiency: 0,
    costEffectiveness: 0,
    projectedSavings: 0,
    hotspotCount: gridData.filter(cell => cell.emission > 30).length
  };

  const currentKPIs = calculateKPIs(gridData);

  // Mock historical and projection data
  const historicalData = [
    { year: 2020, emissions: baselineKPIs.totalEmissions * 0.95, interventions: 0 },
    { year: 2021, emissions: baselineKPIs.totalEmissions * 0.98, interventions: 2 },
    { year: 2022, emissions: baselineKPIs.totalEmissions * 1.02, interventions: 5 },
    { year: 2023, emissions: baselineKPIs.totalEmissions, interventions: 8 },
    { year: 2024, emissions: currentKPIs.totalEmissions, interventions: placedInterventions.length },
  ];

  const emissionsByType = [
    { type: 'Residential', baseline: 420, current: 350 },
    { type: 'Industrial', baseline: 680, current: 580 },
    { type: 'Commercial', baseline: 340, current: 310 },
    { type: 'Transport', baseline: 290, current: 275 }
  ];

  // Convert grid data to 2D emissions array for FixedGridMap
  const cellEmissions: number[][] = React.useMemo(() => {
    const emissions: number[][] = [];
    for (let row = 0; row < 12; row++) {
      emissions[row] = [];
      for (let col = 0; col < 12; col++) {
        const index = row * 12 + col;
        const cell = gridData[index];
        emissions[row][col] = cell ? cell.emission : 0;
      }
    }
    return emissions;
  }, [gridData]);

  // Event handlers
  const handleCellClick = (cell: GridCell) => {
    setSelectedCell(cell);
  };

  const handleCellSelect = (data: { row: number; col: number; cellId: string; bounds: [[number, number], [number, number]] }) => {
    const index = data.row * 12 + data.col;
    const cell = gridData[index];
    if (cell) {
      setSelectedCell(cell);
    }
  };

  const handleParameterChange = (key: keyof SimulationParameters, value: number) => {
    setParameters(prev => ({ ...prev, [key]: value }));
    // Update grid data in real-time based on factor changes
    updateGridDataFromParameters({ ...parameters, [key]: value });
  };

  // Update grid data based on current parameters
  const updateGridDataFromParameters = (params: SimulationParameters) => {
    setGridData(prev => prev.map(cell => {
      // Base emission for this cell type
      let baseEmission = 0;
      switch (cell.type) {
        case 'industrial': baseEmission = Math.random() * 60 + 30; break;
        case 'commercial': baseEmission = Math.random() * 40 + 20; break;
        case 'transport': baseEmission = Math.random() * 35 + 15; break;
        case 'residential': baseEmission = Math.random() * 25 + 5; break;
      }

      // Apply factor modifiers
      let emission = baseEmission;

      // Green areas reduce emissions
      emission *= (1 - params.green / 200);

      // Building density increases emissions
      emission *= (0.5 + params.building / 100);

      // Water bodies reduce emissions slightly
      emission *= (1 - params.water / 300);

      // Vehicles increase emissions
      emission *= (0.4 + params.vehicles / 100);

      // Industrial activity affects industrial zones more
      if (cell.type === 'industrial') {
        emission *= (0.5 + params.industrial / 80);
      } else {
        emission *= (0.7 + params.industrial / 200);
      }

      // Energy consumption increases emissions
      emission *= (0.5 + params.energy / 100);

      // Congestion increases transport emissions
      if (cell.type === 'transport') {
        emission *= (0.6 + params.congestion / 100);
      } else {
        emission *= (0.8 + params.congestion / 200);
      }

      // Public transport reduces emissions
      emission *= (1.2 - params.publicTransport / 150);

      return {
        ...cell,
        emission: Math.max(0, emission)
      };
    }));
  };

  const handleRunSimulation = () => {
    setIsSimulationRunning(true);
    toast.success('Recalculating emissions and generating recommendations...');

    setTimeout(() => {
      // Recalculate emissions based on current slider values
      updateGridDataFromParameters(parameters);

      // Generate recommendations based on updated grid data
      const recs = generateRecommendations();
      setRecommendations(recs);

      // Show the recommendation panel
      setShowRecommendations(true);

      setIsSimulationRunning(false);
      toast.success('Recommendations generated successfully!');
    }, 1000);
  };

  const handlePlaceIntervention = (interventionId: string, cellId: string) => {
    const interventionType = availableInterventions.find(a => a.id === interventionId);
    if (!interventionType) return;

    const newIntervention: Intervention = {
      id: interventionId,
      type: interventionType.type,
      efficiency: interventionType.efficiency,
      name: interventionType.name,
      icon: interventionType.icon
    };

    setGridData(prev => prev.map(cell =>
      cell.id === cellId
        ? { ...cell, interventions: [...cell.interventions, newIntervention] }
        : cell
    ));

    toast.success(`${interventionType.name} placed successfully!`);
  };

  const handleRemoveIntervention = (interventionId: string) => {
    // Parse the interventionId: format is "cellId-interventionTypeId"
    // cellId is "x-y" format, so we need to extract it properly
    const parts = interventionId.split('-');

    // Cell ID is always "x-y" (first two parts), intervention type ID is the rest
    // Handle cases where intervention type ID might also contain dashes
    let cellId: string;
    let interventionTypeId: string;

    // Try to find a valid cell ID pattern (x-y where x and y are digits)
    // Since cell.id is always "x-y", we can safely assume first two parts are cellId
    if (parts.length >= 3) {
      // cellId is "x-y", interventionTypeId is everything after
      cellId = `${parts[0]}-${parts[1]}`;
      interventionTypeId = parts.slice(2).join('-');
    } else {
      // Fallback: assume first part is cellId (shouldn't happen with current format)
      cellId = parts[0];
      interventionTypeId = parts.slice(1).join('-');
    }

    setGridData(prev => prev.map(cell =>
      cell.id === cellId
        ? {
          ...cell,
          interventions: cell.interventions.filter(intervention => intervention.id !== interventionTypeId)
        }
        : cell
    ));

    toast.success('Intervention removed');
  };

  // Generate recommendations: 1 best + 3 alternatives
  const generateRecommendations = (): Recommendation[] => {
    const recs: Recommendation[] = [];

    // Get all cells with emissions, sorted by emission (highest first)
    const highEmissionCells = gridData
      .filter(cell => cell.emission > 0)
      .sort((a, b) => b.emission - a.emission);

    // Generate recommendations for top cells
    highEmissionCells.forEach((cell) => {
      let intervention = "";
      let explanation = "";
      let reductionPercent = 0;

      if (cell.type === "industrial") {
        intervention = "Industrial CO₂ Capture Unit";
        explanation = "This area has high industrial emissions. A high-capacity capture unit will significantly reduce CO₂ output from manufacturing processes.";
        reductionPercent = 35; // Based on availableInterventions efficiency
      } else if (cell.type === "commercial") {
        intervention = "Rooftop Garden + Solar";
        explanation = "Commercial buildings in this zone can benefit from combined rooftop vegetation and solar panels, reducing both direct emissions and energy consumption.";
        reductionPercent = 25; // Combined effect
      } else if (cell.type === "transport") {
        intervention = "Compact Roadside Capture";
        explanation = "High traffic emissions detected. A compact capture system placed near this transport corridor will capture vehicle emissions effectively.";
        reductionPercent = 20;
      } else if (cell.type === "residential") {
        intervention = "Vertical Garden Wall";
        explanation = "Residential areas benefit from natural CO₂ absorption. A vertical garden wall provides both aesthetic value and emission reduction.";
        reductionPercent = 15;
      }

      if (intervention) {
        recs.push({
          intervention,
          explanation,
          reductionPercent,
          cellId: cell.id,
          cellType: cell.type,
          emission: cell.emission,
        });
      }
    });

    // Return top 4 (1 best + 3 alternatives)
    return recs.slice(0, 4);
  };

  // Location search function
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      toast.error('Please enter a location to search');
      return;
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'CO2-Capture-Digital-Twin/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        toast.error('Location not found. Please try a different search term.');
        return;
      }

      const firstResult = data[0];
      const lat = parseFloat(firstResult.lat);
      const lon = parseFloat(firstResult.lon);
      const name = firstResult.display_name || query;

      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid coordinates received from API');
      }

      setSelectedLocation({ lat, lon, name });
      toast.success(`Location selected: ${name}`);
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('Failed to search location. Please try again.');
    }
  };

  // Monte Carlo Prediction Function
  const runMonteCarloPrediction = () => {
    const currentYear = new Date().getFullYear();
    const startEmission = currentKPIs.totalEmissions;
    const predictedData: Array<{ year: number; emission: number }> = [];

    // For each prediction year
    for (let yearOffset = 1; yearOffset <= predictionYears; yearOffset++) {
      const year = currentYear + yearOffset;
      const simulationResults: number[] = [];

      // Run 500 Monte Carlo simulations for this year
      for (let run = 0; run < 500; run++) {
        // Start with previous year's emission (or start emission for first year)
        let emission = yearOffset === 1 ? startEmission : predictedData[yearOffset - 2].emission;

        // Apply random variations to each growth factor
        // Population growth: ±0.5 variation
        const popVariation = (Math.random() * 2 - 1) * 0.5; // Random between -0.5 and 0.5
        emission *= (1 + (populationGrowth * 0.01) * (1 + popVariation));

        // Vehicle growth: ±0.4 variation
        const vehicleVariation = (Math.random() * 2 - 1) * 0.4; // Random between -0.4 and 0.4
        emission *= (1 + (vehicleGrowth * 0.01) * (1 + vehicleVariation));

        // Industrial growth: ±0.6 variation
        const industrialVariation = (Math.random() * 2 - 1) * 0.6; // Random between -0.6 and 0.6
        emission *= (1 + (industrialGrowth * 0.01) * (1 + industrialVariation));

        // Residential growth: ±0.3 variation
        const residentialVariation = (Math.random() * 2 - 1) * 0.3; // Random between -0.3 and 0.3
        emission *= (1 + (residentialGrowth * 0.01) * (1 + residentialVariation));

        // Commercial growth: ±0.3 variation
        const commercialVariation = (Math.random() * 2 - 1) * 0.3; // Random between -0.3 and 0.3
        emission *= (1 + (commercialGrowth * 0.01) * (1 + commercialVariation));

        simulationResults.push(emission);
      }

      // Calculate mean of 500 runs
      const meanEmission = simulationResults.reduce((sum, val) => sum + val, 0) / simulationResults.length;

      predictedData.push({
        year,
        emission: meanEmission
      });
    }

    // Save to state
    setPredictionResults(predictedData);
  };

  // Calculate sector contributions for pie chart
  const calculateSectorContributions = () => {
    if (predictionResults.length === 0) return [];

    // Get the latest year's emission
    const latestEmission = predictionResults[predictionResults.length - 1].emission;

    // Calculate sector contributions based on growth factors
    // Normalize growth factors to get proportions
    const totalGrowth = industrialGrowth + residentialGrowth + commercialGrowth + vehicleGrowth + (populationGrowth * 0.5);

    if (totalGrowth === 0) {
      // Equal distribution if no growth
      return [
        { name: 'Industrial', value: latestEmission * 0.25, color: '#ef4444' },
        { name: 'Residential', value: latestEmission * 0.25, color: '#22c55e' },
        { name: 'Commercial', value: latestEmission * 0.25, color: '#3b82f6' },
        { name: 'Transport', value: latestEmission * 0.25, color: '#f59e0b' },
      ];
    }

    const industrialShare = industrialGrowth / totalGrowth;
    const residentialShare = residentialGrowth / totalGrowth;
    const commercialShare = commercialGrowth / totalGrowth;
    const transportShare = vehicleGrowth / totalGrowth;
    const populationShare = (populationGrowth * 0.5) / totalGrowth;

    // Distribute population growth across sectors
    const industrialFinal = industrialShare + (populationShare * 0.2);
    const residentialFinal = residentialShare + (populationShare * 0.3);
    const commercialFinal = commercialShare + (populationShare * 0.3);
    const transportFinal = transportShare + (populationShare * 0.2);

    // Normalize to ensure they sum to 1
    const sum = industrialFinal + residentialFinal + commercialFinal + transportFinal;

    return [
      { name: 'Industrial', value: (latestEmission * industrialFinal / sum), color: '#ef4444' },
      { name: 'Residential', value: (latestEmission * residentialFinal / sum), color: '#22c55e' },
      { name: 'Commercial', value: (latestEmission * commercialFinal / sum), color: '#3b82f6' },
      { name: 'Transport', value: (latestEmission * transportFinal / sum), color: '#f59e0b' },
    ];
  };

  // Calculate prediction summary statistics
  const calculatePredictionSummary = () => {
    if (predictionResults.length === 0) {
      return {
        finalYearEmission: 0,
        averageGrowthRate: 0,
        highestContributingSector: 'N/A',
        confidenceScore: 0,
      };
    }

    // Final Year Emission
    const finalYearEmission = predictionResults[predictionResults.length - 1].emission;
    const initialEmission = currentKPIs.totalEmissions;

    // Average Annual Growth Rate
    const totalYears = predictionResults.length;
    const totalGrowth = ((finalYearEmission - initialEmission) / initialEmission) * 100;
    const averageGrowthRate = totalYears > 0 ? totalGrowth / totalYears : 0;

    // Highest Contributing Sector (based on growth factors)
    const sectors = [
      { name: 'Industrial', growth: industrialGrowth },
      { name: 'Residential', growth: residentialGrowth },
      { name: 'Commercial', growth: commercialGrowth },
      { name: 'Transport', growth: vehicleGrowth },
    ];
    const highestSector = sectors.reduce((max, sector) =>
      sector.growth > max.growth ? sector : max
    );

    // Monte Carlo Confidence Score (based on variance)
    // Lower variance = higher confidence
    // We'll simulate variance by looking at the range of growth factors
    const growthFactors = [industrialGrowth, residentialGrowth, commercialGrowth, vehicleGrowth, populationGrowth];
    const maxGrowth = Math.max(...growthFactors);
    const minGrowth = Math.min(...growthFactors);
    const variance = maxGrowth - minGrowth;
    // Confidence score: 0-100, higher variance = lower confidence
    // Normalize: if variance is 0-20, confidence is 80-100
    const confidenceScore = Math.max(0, Math.min(100, 100 - (variance * 2)));

    return {
      finalYearEmission,
      averageGrowthRate,
      highestContributingSector: highestSector.name,
      confidenceScore,
    };
  };

  const predictionSummary = calculatePredictionSummary();

  return (
    <div className="min-h-screen bg-green-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl">VayuVision</h1>
              <p className="text-gray-600 mt-1">
                Simulate, visualize, and plan carbon capture strategies for urban neighborhoods
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="w-full flex flex-row gap-2">
            <TabsTrigger value="dashboard" className="flex-1">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>

            <TabsTrigger value="map" className="flex-1">
              <Map className="w-4 h-4 mr-2" />
              Interactive Map
            </TabsTrigger>

            <TabsTrigger value="simulation" className="flex-1">
              <Settings className="w-4 h-4 mr-2" />
              Simulation
            </TabsTrigger>

            <TabsTrigger value="prediction" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-2" />
              Prediction
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <KPIMetrics
              currentKPI={currentKPIs}
              baselineKPI={baselineKPIs}
              historicalData={historicalData}
              emissionsByType={emissionsByType}
            />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Map - takes full left width */}
              {/* Map Layout with Side Panel */}
              {/* Details (Left), Map (Center), Interventions (Right) */}

              {/* Left Side: Cell Details Panel */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="p-4 h-full">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-500" />
                    Cell Details
                  </h3>

                  {selectedCell ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Cell ID</div>
                        <div className="text-2xl font-mono font-medium">{selectedCell.id}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">Zone Type</div>
                        <Badge variant="outline" className="text-base capitalize">
                          {selectedCell.type}
                        </Badge>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">Current Emission</div>
                        <div className={`text-xl font-bold ${selectedCell.emission > 150 ? 'text-red-600' :
                          selectedCell.emission > 50 ? 'text-orange-500' : 'text-green-600'
                          }`}>
                          {selectedCell.emission.toFixed(1)} <span className="text-sm font-normal text-gray-600">tons/year</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">Active Interventions</div>
                        {selectedCell.interventions.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedCell.interventions.map((i, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                                <span>{i.icon}</span>
                                <span>{i.name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 italic">No interventions placed yet</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-center">
                      <Map className="w-12 h-12 mb-2 opacity-20" />
                      <p>Select a grid cell on the map to view details</p>
                    </div>
                  )}
                </Card>

                {/* Intervention Details Linked to Selection */}
                {selectedIntervention && (
                  <Card className="p-4 animate-in slide-in-from-top duration-300 border-blue-200 bg-blue-50/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{selectedIntervention.icon}</span>
                      <h3 className="text-lg font-semibold">New Intervention</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedIntervention.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficiency:</span>
                        <span className="text-green-600 font-medium">-{selectedIntervention.efficiency}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{selectedIntervention.description}</p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Center Column: Map (Span 2) */}
              <div className="lg:col-span-2 min-h-[500px]">
                <FixedGridMap
                  cellEmissions={cellEmissions}
                  onCellSelect={handleCellSelect}
                  selectedCellId={selectedCell?.id || null}
                />
              </div>
              {/* Intervention List - right side only */}
              <div className="lg:col-span-1">
                <InterventionPanel
                  availableInterventions={availableInterventions}
                  placedInterventions={placedInterventions}
                  selectedCellId={selectedCell?.id || null}
                  selectedCellType={selectedCell?.type || null}
                  onPlaceIntervention={handlePlaceIntervention}
                  onRemoveIntervention={handleRemoveIntervention}
                  onSelectIntervention={setSelectedIntervention}
                  selectedIntervention={selectedIntervention}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SimulationControls
                parameters={parameters}
                onParameterChange={handleParameterChange}
                onRunSimulation={handleRunSimulation}
                onResetSimulation={() => {
                  const defaultParams = {
                    green: 30,
                    building: 60,
                    water: 15,
                    vehicles: 70,
                    industrial: 50,
                    energy: 65,
                    congestion: 55,
                    publicTransport: 40,
                  };
                  setParameters(defaultParams);
                  updateGridDataFromParameters(defaultParams);
                  toast.success('Parameters reset to default');
                }}
                onSaveScenario={() => {
                  toast.success('Scenario saved as "Custom Scenario"');
                  setCurrentScenario('Custom Scenario');
                }}
                isRunning={isSimulationRunning}
                currentScenario={currentScenario}
              />
              {/* Map and Recommendation Panel side by side */}
              <div className="lg:col-span-2 flex flex-col lg:flex-row gap-4 items-start">
                {/* Map - takes 65-70% of the space */}
                <div className="w-full lg:w-[68%] flex-shrink-0">
                  <FixedGridMap
                    cellEmissions={cellEmissions}
                    onCellSelect={handleCellSelect}
                    selectedCellId={selectedCell?.id || null}
                  />
                </div>
                {/* Recommendation Panel - takes remaining space */}
                <div className="w-full lg:w-[32%] flex-shrink-0">
                  <RecommendationPanel
                    recommendations={recommendations}
                    isVisible={showRecommendations}
                    onToggleVisibility={() => setShowRecommendations(!showRecommendations)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="prediction" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Left Panel - Controls */}
              <div className="flex flex-col h-[calc(100vh-250px)]">
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 bg-white border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">CO₂ Prediction Model</h2>

                    {/* Location Search */}
                    <div className="mb-6">
                      <Label htmlFor="location-search" className="mb-2 block">
                        Location Search
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="location-search"
                          type="text"
                          placeholder="Enter location..."
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              searchLocation(locationQuery);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => searchLocation(locationQuery)}
                          className="bg-blue-600 text-white"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </Button>
                      </div>
                    </div>

                    {/* Growth Factor Sliders */}
                    <div className="space-y-6 mb-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="population-growth">Population Growth</Label>
                          <span className="text-sm text-gray-600">{populationGrowth}%</span>
                        </div>
                        <Slider
                          id="population-growth"
                          min={0}
                          max={10}
                          step={0.1}
                          value={[populationGrowth]}
                          onValueChange={(value) => setPopulationGrowth(value[0])}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="vehicle-growth">Vehicle Growth</Label>
                          <span className="text-sm text-gray-600">{vehicleGrowth}%</span>
                        </div>
                        <Slider
                          id="vehicle-growth"
                          min={0}
                          max={15}
                          step={0.1}
                          value={[vehicleGrowth]}
                          onValueChange={(value) => setVehicleGrowth(value[0])}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="industrial-growth">Industrial Growth</Label>
                          <span className="text-sm text-gray-600">{industrialGrowth}%</span>
                        </div>
                        <Slider
                          id="industrial-growth"
                          min={0}
                          max={20}
                          step={0.1}
                          value={[industrialGrowth]}
                          onValueChange={(value) => setIndustrialGrowth(value[0])}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="residential-growth">Residential Growth</Label>
                          <span className="text-sm text-gray-600">{residentialGrowth}%</span>
                        </div>
                        <Slider
                          id="residential-growth"
                          min={0}
                          max={10}
                          step={0.1}
                          value={[residentialGrowth]}
                          onValueChange={(value) => setResidentialGrowth(value[0])}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor="commercial-growth">Commercial Growth</Label>
                          <span className="text-sm text-gray-600">{commercialGrowth}%</span>
                        </div>
                        <Slider
                          id="commercial-growth"
                          min={0}
                          max={10}
                          step={0.1}
                          value={[commercialGrowth]}
                          onValueChange={(value) => setCommercialGrowth(value[0])}
                        />
                      </div>
                    </div>

                    {/* Prediction Years Input */}
                    <div className="mb-6">
                      <Label htmlFor="prediction-years" className="mb-2 block">
                        Prediction Years
                      </Label>
                      <Input
                        id="prediction-years"
                        type="number"
                        min={1}
                        max={20}
                        value={predictionYears}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 1 && val <= 20) {
                            setPredictionYears(val);
                          }
                        }}
                        className="w-full"
                      />
                    </div>

                    {/* Run Prediction Button */}
                    <div className="mt-4">
                      <Button
                        onClick={() => {
                          // Validation checks
                          if (!selectedLocation) {
                            toast.error("Please select a location first");
                            return;
                          }

                          if (predictionYears <= 0) {
                            toast.error("Prediction years must be greater than 0");
                            return;
                          }

                          // Show running toast
                          toast.info("Running prediction...");

                          // Run prediction
                          runMonteCarloPrediction();

                          // Show completion toast
                          toast.success("Prediction complete! 🎉");
                        }}
                        className="w-full mt-4 bg-black text-white py-3 text-lg font-semibold rounded-lg"
                      >
                        Run Prediction
                      </Button>
                    </div>

                    {/* Prediction Summary Card */}
                    {predictionResults.length > 0 && (
                      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Prediction Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Final Year Emission:</span>
                            <span className="text-sm font-semibold text-gray-800">
                              {predictionSummary.finalYearEmission.toFixed(2)} tons CO₂
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Average Annual Growth Rate:</span>
                            <span className={`text-sm font-semibold ${predictionSummary.averageGrowthRate >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {predictionSummary.averageGrowthRate >= 0 ? '+' : ''}{predictionSummary.averageGrowthRate.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Highest Contributing Sector:</span>
                            <span className="text-sm font-semibold text-gray-800">
                              {predictionSummary.highestContributingSector}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Monte Carlo Confidence Score:</span>
                            <span className={`text-sm font-semibold ${predictionSummary.confidenceScore >= 70 ? 'text-green-600' :
                              predictionSummary.confidenceScore >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                              {predictionSummary.confidenceScore.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Results */}
              <div className="p-6 bg-white border rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">Predicted CO₂ Emissions</h3>
                  {predictionResults.length > 0 && (
                    <Button
                      onClick={() => setShowCharts(!showCharts)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {showCharts ? 'Hide' : 'Show'}
                    </Button>
                  )}
                </div>
                {selectedLocation && (
                  <p className="text-sm text-gray-600 mb-4">
                    Location: <span className="font-medium text-gray-800">{selectedLocation.name}</span>
                  </p>
                )}

                {predictionResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Run prediction to generate results</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-6">
                    {showCharts ? (
                      /* Charts Section */
                      <div className="space-y-6">
                        {/* Line Chart - CO₂ Emissions Over Time */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-lg font-semibold mb-4">CO₂ Emissions Trend</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={predictionResults.map(r => ({ year: r.year.toString(), emission: r.emission }))}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis />
                              <Tooltip
                                formatter={(value: number) => [`${value.toFixed(2)} tons CO₂`, 'Emission']}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="emission"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Predicted CO₂ Emission"
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Pie Chart - Sector Contribution */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-lg font-semibold mb-4">Sector Contribution Breakdown</h4>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={calculateSectorContributions()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {calculateSectorContributions().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value: number) => [`${value.toFixed(2)} tons CO₂`, 'Emission']}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      /* Compact Table */
                      <div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Year</TableHead>
                              <TableHead className="text-right">Predicted CO₂ Emission (tons)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {predictionResults.map((result, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{result.year}</TableCell>
                                <TableCell className="text-right text-blue-600 font-semibold">
                                  {result.emission.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
