import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface Recommendation {
  intervention: string;
  explanation: string;
  reductionPercent: number;
  cellId: string;
  cellType: string;
  emission: number;
}

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function RecommendationPanel({
  recommendations,
  isVisible,
  onToggleVisibility
}: RecommendationPanelProps) {
  const bestRecommendation = recommendations[0];
  const alternatives = recommendations.slice(1, 4); // Get 3 alternatives

  return (
    <div className="relative">
      {/* Collapsed State - Small Bar */}
      {!isVisible && (
        <div
          className="bg-white border rounded-lg shadow-sm cursor-pointer transition-all duration-300 ease-in-out hover:shadow-md"
          onClick={onToggleVisibility}
        >
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Show Recommendations</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      )}

      {/* Expanded State - Full Card */}
      {isVisible && (
        <Card
          className="p-4 h-fit transition-all duration-300 ease-in-out sticky top-4"
          style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
          {/* Header with Hide Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Recommendations
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleVisibility}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Click "Recommend" to generate recommendations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Best Recommendation */}
              {bestRecommendation && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-blue-600 text-white">Top Recommendation</Badge>
                    <Badge variant="outline" className="text-xs">
                      {bestRecommendation.cellType}
                    </Badge>
                  </div>
                  
                  <h4 className="text-base font-semibold text-gray-900 mb-2">
                    {bestRecommendation.intervention}
                  </h4>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {bestRecommendation.explanation}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                    <div className="text-sm">
                      <span className="text-gray-600">Cell:</span>{' '}
                      <span className="font-medium">{bestRecommendation.cellId}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        -{bestRecommendation.reductionPercent.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">CO₂ Reduction</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alternative Suggestions */}
              {alternatives.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Alternative Suggestions
                  </h4>
                  <div className="space-y-2">
                    {alternatives.map((alt, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {alt.intervention}
                          </span>
                          <Badge variant="outline" className="text-xs ml-2">
                            {alt.cellType}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{alt.explanation}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Cell {alt.cellId}</span>
                          <span className="font-semibold text-green-600">
                            -{alt.reductionPercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

