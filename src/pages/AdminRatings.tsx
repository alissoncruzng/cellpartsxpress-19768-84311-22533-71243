// @ts-nocheck
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Star,
  MessageCircle,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  BarChart3
} from "lucide-react";
import Header from "@/components/Header";
import backgroundPattern from "@/assets/background-pattern.jpeg";

interface Rating {
  id: string;
  score: number;
  comment: string;
  created_at: string;
  order_id: string;
  driver: {
    first_name: string;
    last_name: string;
  };
  client: {
    first_name: string;
    last_name: string;
  };
}

interface RatingStats {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  topRatedDrivers: Array<{
    driver_id: string;
    driver_name: string;
    average_rating: number;
    total_ratings: number;
  }>;
}

// Paleta de Cores Dinâmica - 4 variações de verde neon lime conforme especificações
const roleColors = [
  { primary: "84 100% 60%", glow: "84 100% 50%" }, // Neon Lime Principal
  { primary: "84 95% 55%", glow: "84 100% 45%" },   // Lime variant 1
  { primary: "84 90% 65%", glow: "84 100% 55%" },  // Lime variant 2
  { primary: "84 85% 58%", glow: "84 95% 48%" },   // Lime variant 3
];

export default function AdminRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterDriver, setFilterDriver] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentColorIndex] = useState(0);

  const currentColor = roleColors[currentColorIndex];

  useEffect(() => {
    loadRatings();
    loadStats();
  }, []);

  const loadRatings = async () => {
    try {
      let query = supabase
        .from("ratings")
        .select(`
          *,
          driver:profiles!ratings_driver_id_fkey(first_name, last_name),
          client:profiles!ratings_client_id_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (filterRating !== "all") {
        query = query.eq("score", parseInt(filterRating));
      }

      if (filterDriver !== "all") {
        query = query.eq("driver_id", filterDriver);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      if (searchTerm) {
        filteredData = filteredData.filter(rating =>
          rating.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${rating.driver.first_name} ${rating.driver.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${rating.client.first_name} ${rating.client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setRatings(filteredData);
    } catch (error: any) {
      toast.error("Erro ao carregar avaliações");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Total de avaliações e média geral
      const { data: ratingData, error: ratingError } = await supabase
        .from("ratings")
        .select("score");

      if (ratingError) throw ratingError;

      const totalRatings = ratingData?.length || 0;
      const averageRating = totalRatings > 0
        ? ratingData.reduce((sum, r) => sum + r.score, 0) / totalRatings
        : 0;

      // Distribuição por estrelas
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratingData?.forEach(r => {
        distribution[r.score as keyof typeof distribution]++;
      });

      // Top motoristas por avaliação
      const { data: driverStats, error: driverError } = await supabase
        .rpc("get_driver_ratings_stats");

      const topRatedDrivers = driverStats || [];

      setStats({
        totalRatings,
        averageRating,
        ratingDistribution: distribution,
        topRatedDrivers
      });
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  const refreshData = () => {
    setLoading(true);
    loadRatings();
    loadStats();
  };

  useEffect(() => {
    loadRatings();
  }, [filterRating, filterDriver, searchTerm]);

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= score ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{score}/5</span>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(${backgroundPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Efeito radial dinâmico */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, hsl(${currentColor.glow} / 0.15), transparent 60%)`,
        }}
      />

      <Header userRole="admin" />

      <div className="relative z-10 flex-1 container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold mb-2 transition-all duration-1000"
              style={{
                color: `hsl(${currentColor.primary})`,
                textShadow: `0 0 20px hsl(${currentColor.glow} / 0.6)`,
              }}
            >
              Avaliações dos Motoristas
            </h1>
            <p className="text-white/80">
              Gerencie e analise as avaliações dos clientes
            </p>
          </div>
          <Button
            onClick={refreshData}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total de Avaliações</p>
                    <p className="text-2xl font-bold text-white">{stats.totalRatings}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-white/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Média Geral</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.averageRating.toFixed(1)} ⭐
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Avaliações 5⭐</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.ratingDistribution[5] || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Motoristas Ativos</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.topRatedDrivers.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-white/60" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rating Distribution */}
        {stats && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Distribuição de Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="text-center">
                    <div className="flex justify-center mb-2">
                      {renderStars(stars)}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stats.ratingDistribution[stars] || 0}
                    </div>
                    <div className="text-sm text-white/60">
                      {stats.totalRatings > 0
                        ? `${((stats.ratingDistribution[stars] || 0) / stats.totalRatings * 100).toFixed(1)}%`
                        : "0%"
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
                  <Input
                    placeholder="Buscar por motorista, cliente ou comentário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filtrar por estrelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as avaliações</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 estrelas</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4 estrelas</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3 estrelas</SelectItem>
                  <SelectItem value="2">⭐⭐ 2 estrelas</SelectItem>
                  <SelectItem value="1">⭐ 1 estrela</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setSearchTerm("");
                  setFilterRating("all");
                  setFilterDriver("all");
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 gap-2"
              >
                <Filter className="w-4 h-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ratings List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-white/60" />
            </div>
          ) : ratings.length === 0 ? (
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">Nenhuma avaliação encontrada</p>
              </CardContent>
            </Card>
          ) : (
            ratings.map((rating) => (
              <Card key={rating.id} className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {rating.driver.first_name[0]}{rating.driver.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {rating.driver.first_name} {rating.driver.last_name}
                        </p>
                        <p className="text-sm text-white/60">
                          Avaliado por {rating.client.first_name} {rating.client.last_name}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white">
                      Pedido #{rating.order_id.slice(0, 8)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {renderStars(rating.score)}
                    <span className="text-sm text-white/60">
                      {new Date(rating.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {rating.comment && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-white/80 italic">"{rating.comment}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
