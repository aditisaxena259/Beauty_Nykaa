import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

interface FurtherRecommendation {
  name: string;
  sku_id: string;
  main_image: string;
  brand: string;
  price: number | null;
  reason: string;
}

interface RecommendationCarouselProps {
  recommendations: FurtherRecommendation[];
}

export const RecommendationCarousel = ({ recommendations }: RecommendationCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Remove duplicates based on sku_id
  const uniqueRecommendations = recommendations.filter((item, index, self) =>
    index === self.findIndex((t) => t.sku_id === item.sku_id)
  );

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollPrev}
          className="z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={scrollNext}
          className="z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {uniqueRecommendations.map((item, index) => (
            <div key={`${item.sku_id}-${index}`} className="flex-[0_0_280px] min-w-0">
              <Card className="p-4 border-0 shadow-beauty hover:shadow-beauty-hover transition-all duration-300 hover:scale-105">
                <div className="space-y-4">
                  {/* Product Image */}
                  <div className="w-full h-32 overflow-hidden rounded-lg">
                    <img
                      src={item.main_image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.reason}
                    </Badge>
                    
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 capitalize">
                      {item.name}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.brand}
                    </p>
                    
                    {item.price && (
                      <p className="text-sm font-semibold text-primary">
                        ${item.price}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};