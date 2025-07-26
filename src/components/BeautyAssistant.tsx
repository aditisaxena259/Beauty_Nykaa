import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Menu, MessageCircle, Package, Search } from 'lucide-react';
import { RecommendationResult } from './RecommendationResult';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import eyelinerImage from '@/assets/eyeliner.jpg';
import lipglossImage from '@/assets/lipgloss.jpg';
import foundationImage from '@/assets/foundation.jpg';
import blushImage from '@/assets/blush.jpg';
import mascaraImage from '@/assets/Mascara.jpeg';
import lipColorImage from '@/assets/Lip color.jpeg';
import eyeShadowImage from '@/assets/Eye shadow.jpeg';
import highlighterImage from '@/assets/Highligher.jpeg';
import tonerImage from '@/assets/Toner.jpeg';
import perfumeImage from '@/assets/Perfume.jpeg';
import serumImage from '@/assets/Serum.jpeg';

interface Question {
  attribute: string;
  question: string;
  options: string[];
}

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

interface ApiResponse {
  recommendation: Recommendation;
  further_recommendations: FurtherRecommendation[];
}

interface Category {
  name: string;
  image: string;
}

interface InventoryResult {
  sku: string;
  name: string;
  is_in_stock: number;
  quantity: number;
  mrp: number;
  brand: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type Stage = 'categories' | 'questions' | 'recommendation' | 'chat' | 'inventory' | 'comparer';

const BeautyAssistant = () => {
  const [stage, setStage] = useState<Stage>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [furtherRecommendations, setFurtherRecommendations] = useState<FurtherRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Settings
  const [storeId, setStoreId] = useState<string>('WH001');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatRecommendations, setChatRecommendations] = useState<FurtherRecommendation[]>([]);
  
  // Inventory
  const [inventoryInput, setInventoryInput] = useState('');
  const [inventoryResults, setInventoryResults] = useState<InventoryResult[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  
  // Comparer
  const [compareProduct1, setCompareProduct1] = useState('');
  const [compareProduct2, setCompareProduct2] = useState('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparerLoading, setIsComparerLoading] = useState(false);
  
  const { toast } = useToast();

  // Replace the hardcoded NGROK_URL with environment variable
  const API_URL = import.meta.env.VITE_API_URL;

  // Default categories
  const defaultCategories = [
    { name: 'Eyeliner', image: eyelinerImage },
    { name: 'Lipgloss', image: lipglossImage },
    { name: 'Foundation', image: foundationImage },
    { name: 'Blush', image: blushImage },
    { name: 'Mascara', image: mascaraImage },
    { name: 'Lip Color', image: lipColorImage },
    { name: 'Eye Shadow', image: eyeShadowImage },
    { name: 'Highlighter', image: highlighterImage },
    { name: 'Toner', image: tonerImage },
    { name: 'Perfume', image: perfumeImage },
    { name: 'Serum', image: serumImage },
  ];

  // Load categories on mount - FIXED: using useEffect instead of useState
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          setCategories(defaultCategories);
        }
      } else {
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.log('Using default categories');
      setCategories(defaultCategories);
    }
  };

  const fetchQuestions = async (category: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setStage('questions');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          selected_answers: selectedAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendation');
      }

      const data: ApiResponse = await response.json();
      setRecommendation(data.recommendation);
      setFurtherRecommendations(data.further_recommendations || []);
      setStage('recommendation');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          store_id: storeId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get chat response');
      }

      const data = await response.json();
      
      // Add assistant response
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);

      // Store recommendations for card display
      if (data.recommendations && data.recommendations.length > 0) {
        setChatRecommendations(data.recommendations);
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get chat response. Please try again.",
        variant: "destructive",
      });
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleInventoryCheck = async () => {
    if (!inventoryInput.trim()) return;

    setIsInventoryLoading(true);
    try {
      const response = await fetch(`${API_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input: inventoryInput,
          store_id: storeId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check inventory');
      }

      const data = await response.json();
      setInventoryResults(data.results || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const handleComparer = async () => {
    if (!compareProduct1.trim() || !compareProduct2.trim()) return;

    setIsComparerLoading(true);
    try {
      const response = await fetch(`${API_URL}/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          product1: compareProduct1,
          product2: compareProduct2,
          store_id: storeId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to compare products');
      }

      const data = await response.json();
      setComparisonResult(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to compare products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsComparerLoading(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedAnswers({});
    fetchQuestions(category);
  };

  const handleAnswerSelect = (attribute: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [attribute]: answer,
    }));
  };

  const startOver = () => {
    setStage('categories');
    setSelectedCategory('');
    setQuestions([]);
    setSelectedAnswers({});
    setRecommendation(null);
    setFurtherRecommendations([]);
    setChatMessages([]);
    setChatRecommendations([]);
    setInventoryResults([]);
    setCompareProduct1('');
    setCompareProduct2('');
    setComparisonResult(null);
  };

  const hasEnoughAnswers = Object.keys(selectedAnswers).length >= 2;

  if (loading && stage !== 'chat' && stage !== 'inventory') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            {stage === 'categories' ? 'Loading questions...' : 'Getting your recommendation...'}
          </p>
        </div>
      </div>
    );
  }

  // Add this helper function to parse and format the analysis text
  const formatAnalysisText = (text: string) => {
    if (!text) return null;
    
    // Split text by sections and format
    const sections = text.split(/\*\*([^*]+)\*\*/g);
    
    return (
      <div className="space-y-4 text-gray-700 leading-relaxed">
        {sections.map((section, index) => {
          // Every odd index is a bold section
          if (index % 2 === 1) {
            return (
              <h4 key={index} className="font-semibold text-lg text-blue-900 mt-6 mb-3 border-b border-blue-100 pb-2">
                {section}
              </h4>
            );
          } else if (section.trim()) {
            // Process regular text and handle bullet points
            const lines = section.split('\n').filter(line => line.trim());
            return (
              <div key={index} className="space-y-2">
                {lines.map((line, lineIndex) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;
                  
                  // Handle bullet points
                  if (trimmedLine.startsWith('*') || trimmedLine.startsWith('•')) {
                    return (
                      <div key={lineIndex} className="flex items-start space-x-3 ml-4">
                        <span className="text-blue-500 font-bold text-lg">•</span>
                        <span className="flex-1">{trimmedLine.substring(1).trim()}</span>
                      </div>
                    );
                  }
                  
                  // Regular paragraphs
                  return (
                    <p key={lineIndex} className="text-gray-700 leading-relaxed">
                      {trimmedLine}
                    </p>
                  );
                })}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Header with Hamburger Menu */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="store-id">Store ID</Label>
                  <Input
                    id="store-id"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    placeholder="Enter store ID (e.g., WH001)"
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Beauty Assistant
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover your perfect makeup match
            </p>
          </div>

          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        {/* Navigation Options */}
        {stage === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => setStage('chat')}
              className="h-16 flex items-center gap-3"
            >
              <MessageCircle className="h-5 w-5" />
              Custom Chat
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setStage('inventory')}
              className="h-16 flex items-center gap-3"
            >
              <Package className="h-5 w-5" />
              Inventory Check
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setStage('comparer')}
              className="h-16 flex items-center gap-3"
            >
              <Search className="h-5 w-5" />
              Product Comparer
            </Button>
          </div>
        )}

        {/* Categories Stage */}
        {stage === 'categories' && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Choose a Category
              </h2>
              <p className="text-muted-foreground">
                Select the type of product you're looking for
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <Card
                  key={category.name}
                  className="group cursor-pointer border-0 bg-card shadow-beauty hover:shadow-beauty-hover transform hover:scale-105 transition-all duration-300 ease-beauty"
                  onClick={() => handleCategorySelect(category.name)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-6 text-center">
                    <div className="mb-4 overflow-hidden rounded-2xl">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground">
                      Find your perfect {category.name.toLowerCase()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Stage */}
        {stage === 'chat' && (
          <div className="space-y-6 animate-fade-in-up">
            <Button
              variant="outline"
              onClick={startOver}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <Card className="p-6 border-0 shadow-beauty">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Custom Beauty Chat
              </h2>
              <p className="text-muted-foreground mb-6">
                Ask me anything about beauty products and get personalized recommendations
              </p>

              {/* Chat Messages */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary text-secondary-foreground p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Recommendations Display */}
              {chatRecommendations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Recommended Products:</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {chatRecommendations.map((product, index) => (
                      <Card key={index} className="flex-shrink-0 w-64 p-4 border-0 shadow-beauty hover:shadow-beauty-hover transition-all duration-300">
                        <div className="space-y-3">
                          {product.main_image && (
                            <div className="w-full h-32 overflow-hidden rounded-lg">
                              <img
                                src={product.main_image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-foreground text-sm line-clamp-2 capitalize">
                              {product.name}
                            </h4>
                            <p className="text-xs text-muted-foreground capitalize">
                              {product.brand}
                            </p>
                            {product.price && (
                              <p className="text-sm font-semibold text-primary">
                                ₹{product.price}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku_id}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about any beauty product..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                />
                <Button 
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isChatLoading}
                >
                  Send
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Inventory Stage */}
        {stage === 'inventory' && (
          <div className="space-y-6 animate-fade-in-up">
            <Button
              variant="outline"
              onClick={startOver}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <Card className="p-6 border-0 shadow-beauty">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Inventory Check
              </h2>
              <p className="text-muted-foreground mb-6">
                Check product availability by entering product name or SKU ID
              </p>

              {/* Search Input */}
              <div className="flex gap-2 mb-6">
                <Input
                  value={inventoryInput}
                  onChange={(e) => setInventoryInput(e.target.value)}
                  placeholder="Enter product name or SKU ID..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleInventoryCheck}
                  disabled={!inventoryInput.trim() || isInventoryLoading}
                >
                  {isInventoryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
                </Button>
              </div>

              {/* Results */}
              {inventoryResults.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Results:</h3>
                  {inventoryResults.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-foreground">{result.name}</h4>
                          <p className="text-sm text-muted-foreground">SKU: {result.sku}</p>
                          <p className="text-sm text-muted-foreground">Brand: {result.brand}</p>
                          {result.mrp > 0 && (
                            <p className="text-sm text-foreground">Price: ₹{result.mrp}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              result.is_in_stock > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {result.is_in_stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </div>
                          {result.is_in_stock > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Qty: {result.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Product Comparer Stage */}
        {stage === 'comparer' && (
          <div className="space-y-6 animate-fade-in-up">
            <Button
              variant="outline"
              onClick={startOver}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <Card className="p-6 border-0 shadow-beauty">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                Product Comparer
              </h2>
              <p className="text-muted-foreground mb-6">
                Compare two products by entering their names or SKU IDs
              </p>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="product1">Product 1</Label>
                  <Input
                    id="product1"
                    value={compareProduct1}
                    onChange={(e) => setCompareProduct1(e.target.value)}
                    placeholder="Enter product name or SKU..."
                  />
                </div>
                <div>
                  <Label htmlFor="product2">Product 2</Label>
                  <Input
                    id="product2"
                    value={compareProduct2}
                    onChange={(e) => setCompareProduct2(e.target.value)}
                    placeholder="Enter product name or SKU..."
                  />
                </div>
              </div>

              <Button 
                onClick={handleComparer}
                disabled={!compareProduct1.trim() || !compareProduct2.trim() || isComparerLoading}
                className="w-full mb-6"
              >
                {isComparerLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Compare Products
              </Button>

              {/* Enhanced Comparison Results */}
              {comparisonResult && (
                <div className="space-y-8">
                  {/* Products Side by Side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Product 1 Card */}
                    <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                      <div className="relative">
                        {comparisonResult.product1?.main_image && (
                          <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                            <img
                              src={comparisonResult.product1.main_image}
                              alt={comparisonResult.product1.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Product 1
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground line-clamp-2">
                            {comparisonResult.product1?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            by <span className="font-medium">{comparisonResult.product1?.brand}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          {comparisonResult.product1?.price && (
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-green-600">
                                ₹{comparisonResult.product1.price}
                              </span>
                            </div>
                          )}
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">SKU</p>
                            <p className="text-sm font-mono">{comparisonResult.product1?.sku_id}</p>
                          </div>
                        </div>

                        {/* Product Attributes */}
                        <div className="space-y-3">
                          {comparisonResult.product1?.category && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-muted-foreground">Category</span>
                              <span className="text-sm font-medium capitalize">
                                {comparisonResult.product1.category}
                              </span>
                            </div>
                          )}
                          
                          {comparisonResult.product1?.colors && comparisonResult.product1.colors.length > 0 && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-muted-foreground">Colors</span>
                              <div className="flex flex-wrap gap-1">
                                {comparisonResult.product1.colors.slice(0, 3).map((color, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                                    {color}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {comparisonResult.product1?.finishes && comparisonResult.product1.finishes.length > 0 && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-muted-foreground">Finish</span>
                              <span className="text-sm font-medium capitalize">
                                {comparisonResult.product1.finishes[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    {/* VS Divider */}
                    <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="bg-white border-4 border-gray-200 rounded-full p-4 shadow-lg">
                        <span className="text-xl font-bold text-gray-600">VS</span>
                      </div>
                    </div>

                    {/* Product 2 Card */}
                    <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                      <div className="relative">
                        {comparisonResult.product2?.main_image && (
                          <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                            <img
                              src={comparisonResult.product2.main_image}
                              alt={comparisonResult.product2.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Product 2
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground line-clamp-2">
                            {comparisonResult.product2?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            by <span className="font-medium">{comparisonResult.product2?.brand}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          {comparisonResult.product2?.price && (
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-green-600">
                                ₹{comparisonResult.product2.price}
                              </span>
                            </div>
                          )}
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">SKU</p>
                            <p className="text-sm font-mono">{comparisonResult.product2?.sku_id}</p>
                          </div>
                        </div>

                        {/* Product Attributes */}
                        <div className="space-y-3">
                          {comparisonResult.product2?.category && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-muted-foreground">Category</span>
                              <span className="text-sm font-medium capitalize">
                                {comparisonResult.product2.category}
                              </span>
                            </div>
                          )}
                          
                          {comparisonResult.product2?.colors && comparisonResult.product2.colors.length > 0 && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-muted-foreground">Colors</span>
                              <div className="flex flex-wrap gap-1">
                                {comparisonResult.product2.colors.slice(0, 3).map((color, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded capitalize">
                                    {color}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {comparisonResult.product2?.finishes && comparisonResult.product2.finishes.length > 0 && (
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                              <span className="text-sm text-muted-foreground">Finish</span>
                              <span className="text-sm font-medium capitalize">
                                {comparisonResult.product2.finishes[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Detailed Analysis Section */}
                  {comparisonResult.analysis && (
                    <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">✨</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-foreground mb-3">
                            Expert Analysis
                          </h4>
                          <div className="prose prose-sm max-w-none">
                            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                              {comparisonResult.analysis}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      onClick={() => {
                        setCompareProduct1('');
                        setCompareProduct2('');
                        setComparisonResult(null);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Compare Different Products
                    </Button>
                    <Button 
                      onClick={startOver}
                      className="flex-1"
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Questions Stage */}
        {stage === 'questions' && (
          <div className="space-y-8 animate-fade-in-up">
            <Button
              variant="outline"
              onClick={startOver}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold text-foreground mb-2">
                {selectedCategory} Preferences
              </h2>
              <p className="text-muted-foreground">
                Answer a few questions to get personalized recommendations
              </p>
            </div>

            <div className="space-y-8">
              {questions.map((question, qIndex) => (
                <Card key={qIndex} className="p-6 border-0 shadow-beauty">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {question.question}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {question.options.map((option, oIndex) => (
                      <Button
                        key={oIndex}
                        variant={selectedAnswers[question.attribute] === option ? "default" : "outline"}
                        onClick={() => handleAnswerSelect(question.attribute, option)}
                        className="h-auto py-3 px-4 text-left justify-start capitalize transition-all duration-200"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation Stage */}
        {stage === 'recommendation' && recommendation && (
          <RecommendationResult
            recommendation={recommendation}
            furtherRecommendations={furtherRecommendations}
            questionsLength={questions.length}
            onStartOver={startOver}
          />
        )}

        {/* Fixed Bottom Button for Questions */}
        {stage === 'questions' && hasEnoughAnswers && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
            <div className="max-w-4xl mx-auto">
              <Button
                onClick={fetchRecommendation}
                className="w-full h-14 text-lg font-semibold shadow-beauty-hover"
                size="lg"
              >
                Get My Recommendation ✨
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeautyAssistant;