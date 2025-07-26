import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { RecommendationCarousel } from './RecommendationCarousel';

interface Recommendation {
  name: string;
  price: number | null;
  score: number;
  sku_id: string;
  main_image: string;
  brand: string;
}

interface FurtherRecommendation {
  name: string;
  sku_id: string;
  main_image: string;
  brand: string;
  price: number | null;
  reason: string;
}

interface RecommendationResultProps {
  recommendation: Recommendation;
  furtherRecommendations: FurtherRecommendation[];
  questionsLength: number;
  onStartOver: () => void;
}

export const RecommendationResult = ({
  recommendation,
  furtherRecommendations,
  questionsLength,
  onStartOver,
}: RecommendationResultProps) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <Button
        variant="outline"
        onClick={onStartOver}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Start Over
      </Button>

      {/* Primary Recommendation */}
      <div className="text-center">
        <Card className="max-w-2xl mx-auto p-8 border-0 shadow-beauty-hover">
          <div className="mb-6">
            <div className="w-20 h-20 bg-beauty-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Perfect Match Found!
            </h2>
          </div>

          <div className="space-y-6">
            {/* Product Image */}
            <div className="w-48 h-48 mx-auto overflow-hidden rounded-2xl shadow-beauty">
              <img
                src={recommendation.main_image}
                alt={recommendation.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-primary capitalize">
                {recommendation.name}
              </h3>
              
              <p className="text-lg font-medium text-muted-foreground capitalize">
                {recommendation.brand}
              </p>
              
              {recommendation.price && (
                <p className="text-lg font-semibold text-foreground">
                  ${recommendation.price}
                </p>
              )}
            </div>

            {/* Match Score */}
            <div className="bg-secondary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Match Score</p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(recommendation.score / questionsLength) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {recommendation.score} out of {questionsLength} features matched
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Further Recommendations Carousel */}
      {furtherRecommendations.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              More Options for You
            </h3>
            <p className="text-muted-foreground">
              Explore similar products that match your preferences
            </p>
          </div>
          
          <RecommendationCarousel recommendations={furtherRecommendations} />
        </div>
      )}

      {/* Action Button */}
      <div className="text-center">
        <Button 
          onClick={onStartOver}
          className="px-8 py-3"
          size="lg"
        >
          Find Another Product
        </Button>
      </div>
    </div>
  );
};