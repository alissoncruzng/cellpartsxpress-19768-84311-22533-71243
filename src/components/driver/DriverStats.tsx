// @ts-nocheck - Types will be regenerated after migration
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Star, TrendingUp, Package, CheckCircle, XCircle, Clock, Award } from "lucide-react";
import { toast } from "sonner";

interface DriverStats {
  total_deliveries: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  average_rating: number;
  total_earnings: number;
  on_time_deliveries: number;
  late_deliveries: number;
  acceptance_rate: number;
  total_accepted: number;
  total_rejected: number;
}

export default function DriverStats() {
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<string>("Iniciante");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("driver_stats")
        .select("*")
        .eq("driver_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStats(data);
        setRank(calculateRank(data));
      } else {
        // Initialize stats if not exists
        const { error: insertError } = await supabase
          .from("driver_stats")
          .insert({ driver_id: user.id });
        
        if (insertError) throw insertError;
        loadStats();
      }
    } catch (error: any) {
      console.error("Error loading stats:", error);
      toast.error("Erro ao carregar estatísticas");
    } finally {
      setLoading(false);
    }
  };

  const calculateRank = (stats: DriverStats): string => {
    const { completed_deliveries, average_rating, acceptance_rate } = stats;
    
    if (completed_deliveries >= 500 && average_rating >= 4.8 && acceptance_rate >= 95) {
      return "Diamante";
    } else if (completed_deliveries >= 300 && average_rating >= 4.5 && acceptance_rate >= 90) {
      return "Platina";
    } else if (completed_deliveries >= 150 && average_rating >= 4.2 && acceptance_rate >= 85) {
      return "Ouro";
    } else if (completed_deliveries >= 50 && average_rating >= 4.0 && acceptance_rate >= 80) {
      return "Prata";
    } else if (completed_deliveries >= 10 && average_rating >= 3.5 && acceptance_rate >= 70) {
      return "Bronze";
    }
    return "Iniciante";
  };

  const getRankColor = (rank: string): string => {
    const colors: Record<string, string> = {
      "Diamante": "from-cyan-400 to-blue-500",
      "Platina": "from-gray-300 to-gray-500",
      "Ouro": "from-yellow-400 to-yellow-600",
      "Prata": "from-gray-400 to-gray-600",
      "Bronze": "from-orange-400 to-orange-600",
      "Iniciante": "from-green-400 to-green-600"
    };
    return colors[rank] || colors["Iniciante"];
  };

  const getRankIcon = (rank: string): string => {
    const icons: Record<string, string> = {
      "Diamante": "💎",
      "Platina": "🏆",
      "Ouro": "🥇",
      "Prata": "🥈",
      "Bronze": "🥉",
      "Iniciante": "🌱"
    };
    return icons[rank] || icons["Iniciante"];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const completionRate = stats.total_deliveries > 0 
    ? ((stats.completed_deliveries / stats.total_deliveries) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-4">
      {/* Rank Card */}
      <Card className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${getRankColor(rank)}`}></div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Ranking e Desempenho
              </CardTitle>
              <CardDescription>Seu nível atual e estatísticas</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-1">{getRankIcon(rank)}</div>
              <Badge className={`bg-gradient-to-r ${getRankColor(rank)} text-white border-0`}>
                {rank}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                Avaliação Média
              </span>
              <span className="text-2xl font-bold">{stats.average_rating.toFixed(2)}</span>
            </div>
            <Progress value={stats.average_rating * 20} className="h-2" />
          </div>

          {/* Acceptance Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Taxa de Aceitação
              </span>
              <span className="text-2xl font-bold">{stats.acceptance_rate.toFixed(1)}%</span>
            </div>
            <Progress value={stats.acceptance_rate} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Aceitos: {stats.total_accepted}</span>
              <span>Recusados: {stats.total_rejected}</span>
            </div>
          </div>

          {/* Completion Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                Taxa de Conclusão
              </span>
              <span className="text-2xl font-bold">{completionRate}%</span>
            </div>
            <Progress value={Number(completionRate)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Concluídas: {stats.completed_deliveries}</span>
              <span>Canceladas: {stats.cancelled_deliveries}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Package className="h-8 w-8 text-primary mb-2" />
              <div className="text-2xl font-bold">{stats.total_deliveries}</div>
              <div className="text-xs text-muted-foreground">Total de Entregas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <div className="text-2xl font-bold">{stats.completed_deliveries}</div>
              <div className="text-xs text-muted-foreground">Concluídas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold">{stats.on_time_deliveries}</div>
              <div className="text-xs text-muted-foreground">No Prazo</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold">
                R$ {stats.total_earnings.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Total Ganho</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Rank Info */}
      {rank !== "Diamante" && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm">
              <div className="font-semibold mb-2">🎯 Próximo Nível</div>
              <div className="text-muted-foreground space-y-1">
                {rank === "Iniciante" && (
                  <>
                    <div>• Complete 10 entregas</div>
                    <div>• Mantenha avaliação acima de 3.5</div>
                    <div>• Taxa de aceitação acima de 70%</div>
                  </>
                )}
                {rank === "Bronze" && (
                  <>
                    <div>• Complete 50 entregas</div>
                    <div>• Mantenha avaliação acima de 4.0</div>
                    <div>• Taxa de aceitação acima de 80%</div>
                  </>
                )}
                {rank === "Prata" && (
                  <>
                    <div>• Complete 150 entregas</div>
                    <div>• Mantenha avaliação acima de 4.2</div>
                    <div>• Taxa de aceitação acima de 85%</div>
                  </>
                )}
                {rank === "Ouro" && (
                  <>
                    <div>• Complete 300 entregas</div>
                    <div>• Mantenha avaliação acima de 4.5</div>
                    <div>• Taxa de aceitação acima de 90%</div>
                  </>
                )}
                {rank === "Platina" && (
                  <>
                    <div>• Complete 500 entregas</div>
                    <div>• Mantenha avaliação acima de 4.8</div>
                    <div>• Taxa de aceitação acima de 95%</div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
