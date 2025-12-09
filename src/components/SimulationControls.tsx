import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Play, RotateCcw, Save } from 'lucide-react';

interface SimulationParameters {
  green: number; // green areas/parks percentage
  building: number; // building density percentage
  water: number; // water bodies percentage
  vehicles: number; // vehicle traffic percentage
  industrial: number; // industrial activity percentage
  energy: number; // energy consumption percentage
  congestion: number; // traffic congestion percentage
  publicTransport: number; // public transport availability percentage
}

interface SimulationControlsProps {
  parameters: SimulationParameters;
  onParameterChange: (key: keyof SimulationParameters, value: number) => void;
  onRunSimulation: () => void;
  onResetSimulation: () => void;
  onSaveScenario: () => void;
  isRunning: boolean;
  currentScenario: string;
  selectedCellId?: string | null;
}

export function SimulationControls({
  parameters,
  onParameterChange,
  onRunSimulation,
  onResetSimulation,
  onSaveScenario,
  isRunning,
  currentScenario,
  selectedCellId
}: SimulationControlsProps) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg">Emission Factors</h3>
      </div>

      <div className="space-y-4">
        {!selectedCellId && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              🔸 Select a cell on the map to apply local simulation changes
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm mb-2">
            Green Areas: {parameters.green}%
          </label>
          <Slider
            value={[parameters.green]}
            onValueChange={(value) => onParameterChange('green', value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
            disabled={!selectedCellId}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Building Density: {parameters.building}%
          </label>
          <Slider
            value={[parameters.building]}
            onValueChange={(value) => onParameterChange('building', value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
            disabled={!selectedCellId}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Water Bodies: {parameters.water}%
          </label>
          <Slider
            value={[parameters.water]}
            onValueChange={(value) => onParameterChange('water', value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
            disabled={!selectedCellId}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Vehicles: {parameters.vehicles}%
          </label>
          <Slider
            value={[parameters.vehicles]}
            onValueChange={(value) => onParameterChange('vehicles', value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
            disabled={!selectedCellId}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Industrial Activity: {parameters.industrial}%
          </label>
          <Slider
            value={[parameters.industrial]}
            onValueChange={(value) => onParameterChange('industrial', value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
            disabled={!selectedCellId}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Energy Consumption: {parameters.energy}%
          </label>
          <Slider
            value={[parameters.energy]}
            onValueChange={(value) => onParameterChange('energy', value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
            disabled={!selectedCellId}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Traffic Congestion: {parameters.congestion}%
          </label>
          <Slider
            value={[parameters.congestion]}
            onValueChange={(value) => onParameterChange('congestion', value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
            disabled={!selectedCellId}
          />
        </div>

        <div>
          <label className="block text-sm mb-2">
            Public Transport: {parameters.publicTransport}%
          </label>
          <Slider
            value={[parameters.publicTransport]}
            onValueChange={(value) => onParameterChange('publicTransport', value[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
            disabled={!selectedCellId}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-6">
<<<<<<< HEAD
        <Button
=======
        {/* <Button
>>>>>>> 5849f9d15c2908b9db4a595283c80536ac190aa1
          onClick={onRunSimulation}
          disabled={isRunning}
          className="flex-1"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Generating...' : 'Recommend'}
<<<<<<< HEAD
        </Button>
=======
        </Button> */}
>>>>>>> 5849f9d15c2908b9db4a595283c80536ac190aa1

        <Button
          onClick={onResetSimulation}
          variant="outline"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          onClick={onSaveScenario}
          variant="outline"
        >
          <Save className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
        <p className="text-blue-800">
          💡 Select a cell on the map, then adjust the sliders to see localized impact on that cell and its neighbors.
        </p>
      </div>
    </Card>
  );
}