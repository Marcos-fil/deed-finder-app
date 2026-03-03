import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, GraduationCap, Dribbble, Shield, Monitor, Mic, Calendar, Clock, Users, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const categoryConfig: Record<string, { icon: typeof Dribbble; color: string; bgColor: string }> = {
  "Futebol": { icon: Dribbble, color: "text-primary", bgColor: "bg-primary/10" },
  "Jiu-jítsu": { icon: Shield, color: "text-accent", bgColor: "bg-accent/10" },
  "Informática": { icon: Monitor, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/10" },
  "Palestras": { icon: Mic, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-500/10" },
};

const Classes = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_enrollments")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const enrollMutation = useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from("class_enrollments")
        .insert({ class_id: classId, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({ title: "Inscrição realizada!", description: "Você foi inscrito na aula com sucesso." });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: async (classId: string) => {
      const { error } = await supabase
        .from("class_enrollments")
        .delete()
        .eq("class_id", classId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({ title: "Inscrição cancelada", description: "Sua inscrição foi removida." });
    },
  });

  const categories = [...new Set(classes.map((c: any) => c.category))];
  const enrolledClassIds = new Set(enrollments.map((e: any) => e.class_id));
  const filteredClasses = selectedCategory
    ? classes.filter((c: any) => c.category === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-4">
          {selectedCategory ? (
            <button onClick={() => setSelectedCategory(null)} className="text-primary-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={() => navigate(-1)} className="text-primary-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="font-display text-xl font-bold text-primary-foreground">
            {selectedCategory ?? "Aulas"}
          </h1>
        </div>
        <p className="text-primary-foreground/70 text-sm">
          {selectedCategory
            ? "Escolha um dia disponível para se inscrever"
            : "Escolha uma modalidade para ver os dias disponíveis"}
        </p>
      </div>

      <div className="px-5 -mt-4 relative z-10 space-y-3">
        {!selectedCategory ? (
          /* Category Grid */
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const config = categoryConfig[cat as string] ?? categoryConfig["Futebol"];
              const Icon = config.icon;
              const count = classes.filter((c: any) => c.category === cat).length;
              return (
                <button
                  key={cat as string}
                  onClick={() => setSelectedCategory(cat as string)}
                  className="bg-card rounded-xl p-5 border border-border shadow-sm text-left transition-all active:scale-[0.97] hover:shadow-md"
                >
                  <div className={`h-12 w-12 rounded-xl ${config.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`h-6 w-6 ${config.color}`} />
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-base">{cat as string}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{count} dias disponíveis</p>
                </button>
              );
            })}
          </div>
        ) : (
          /* Class Days List */
          <div className="space-y-3">
            {filteredClasses.map((cls: any) => {
              const isEnrolled = enrolledClassIds.has(cls.id);
              const config = categoryConfig[cls.category] ?? categoryConfig["Futebol"];
              return (
                <div
                  key={cls.id}
                  className={`bg-card rounded-xl p-4 border shadow-sm transition-all ${
                    isEnrolled ? "border-primary/40 bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                        <Calendar className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">{cls.day_of_week}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{cls.time_slot}</span>
                        </div>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/30 text-primary gap-1.5"
                        onClick={() => unenrollMutation.mutate(cls.id)}
                        disabled={unenrollMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Inscrito
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => enrollMutation.mutate(cls.id)}
                        disabled={enrollMutation.isPending}
                      >
                        Inscrever-se
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;
