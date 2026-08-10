import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, GraduationCap, Dribbble, Shield, Monitor, Mic, Calendar, Clock, Users, CheckCircle2, MapPin, Navigation, ExternalLink, XCircle, BookOpen, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const locationConfig: Record<string, { name: string; address: string; lat: number; lng: number; googleMapsUrl: string }> = {
  "Futebol": {
    name: "Campo Da Vila Cretti",
    address: "R. Ingá - Jardim Angela Maria, Carapicuíba - SP",
    lat: -23.5370,
    lng: -46.8280,
    googleMapsUrl: "https://maps.app.goo.gl/BrD1w9ymLqw7X54o6",
  },
  "default": {
    name: "Missão Vida",
    address: "R. Jaci, 314 - Cidade Ariston Estela Azevedo, Carapicuíba - SP, 06396-190",
    lat: -23.5245,
    lng: -46.8355,
    googleMapsUrl: "https://maps.app.goo.gl/Cm6VyPve2Jy6w6ym9",
  },
};

const categoryConfig: Record<string, { icon: typeof Dribbble; color: string; bgColor: string }> = {
  "Futebol": { icon: Dribbble, color: "text-primary", bgColor: "bg-primary/10" },
  "Jiu-jítsu": { icon: Shield, color: "text-accent", bgColor: "bg-accent/10" },
  "Informática": { icon: Monitor, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/10" },
  "Palestras": { icon: Mic, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-500/10" },
};

const dayOrder: Record<string, number> = {
  "Domingo": 0, "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3,
  "Quinta-feira": 4, "Sexta-feira": 5, "Sábado": 6,
  "Segunda": 1, "Terça": 2, "Quarta": 3, "Quinta": 4, "Sexta": 5,
};

function getNextOccurrence(dayOfWeek: string, timeSlot: string): Date | null {
  const dayNum = dayOrder[dayOfWeek];
  if (dayNum === undefined) return null;

  const now = new Date();
  const today = now.getDay();
  let daysUntil = dayNum - today;
  if (daysUntil < 0) daysUntil += 7;

  const timeParts = timeSlot.match(/(\d{1,2}):(\d{2})/);
  if (!timeParts) return null;
  const hours = parseInt(timeParts[1]);
  const minutes = parseInt(timeParts[2]);

  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(hours, minutes, 0, 0);

  // If it's today but already passed, move to next week
  if (next <= now) {
    next.setDate(next.getDate() + 7);
  }

  return next;
}

function formatTimeRemaining(target: Date): string {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `em ${days}d ${hours}h`;
  if (hours > 0) return `em ${hours}h ${minutes}min`;
  return `em ${minutes}min`;
}

type TabType = "categorias" | "minhas";

const Classes = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("categorias");
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes" as any).select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("class_enrollments" as any)
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
        .from("class_enrollments" as any)
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
        .from("class_enrollments" as any)
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

  // Enrolled classes with upcoming occurrences only
  const enrolledClasses = useMemo(() => {
    const enrolled = classes.filter((c: any) => enrolledClassIds.has(c.id));
    return enrolled
      .map((c: any) => {
        const next = getNextOccurrence(c.day_of_week, c.time_slot);
        return { ...c, nextOccurrence: next };
      })
      .filter((c: any) => c.nextOccurrence !== null)
      .sort((a: any, b: any) => a.nextOccurrence!.getTime() - b.nextOccurrence!.getTime());
  }, [classes, enrolledClassIds]);

  const headerTitle = selectedCategory
    ? selectedCategory
    : activeTab === "minhas"
    ? "Minhas Aulas"
    : "Aulas";

  const headerSubtitle = selectedCategory
    ? "Escolha um dia disponível para se inscrever"
    : activeTab === "minhas"
    ? "Aulas em que você está inscrito"
    : "Escolha uma modalidade para ver os dias disponíveis";

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
            {headerTitle}
          </h1>
        </div>
        <p className="text-primary-foreground/70 text-sm">{headerSubtitle}</p>
      </div>

      <div className="px-5 -mt-4 relative z-10 space-y-3">
        {/* Tabs - only show when not in a category detail */}
        {!selectedCategory && (
          <div className="flex gap-2 mb-1">
            <button
              onClick={() => setActiveTab("categorias")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "categorias"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              <GraduationCap className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Modalidades
            </button>
            <button
              onClick={() => setActiveTab("minhas")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                activeTab === "minhas"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-1.5 -mt-0.5" />
              Minhas Aulas
              {enrolledClasses.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {enrolledClasses.length}
                </span>
              )}
            </button>
          </div>
        )}

        {!selectedCategory && activeTab === "categorias" && (
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
        )}

        {!selectedCategory && activeTab === "minhas" && (
          /* My Enrolled Classes */
          <div className="space-y-3">
            {enrolledClasses.length === 0 ? (
              <div className="bg-card rounded-xl p-8 border border-border text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-semibold text-foreground text-sm">Nenhuma inscrição</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Inscreva-se em uma modalidade para ver suas aulas aqui
                </p>
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setActiveTab("categorias")}
                >
                  Ver modalidades
                </Button>
              </div>
            ) : (
              enrolledClasses.map((cls: any) => {
                const config = categoryConfig[cls.category] ?? categoryConfig["Futebol"];
                const Icon = config.icon;
                const timeLeft = cls.nextOccurrence ? formatTimeRemaining(cls.nextOccurrence) : "";
                const loc = locationConfig[cls.category] ?? locationConfig["default"];

                return (
                  <div
                    key={cls.id}
                    className="bg-card rounded-xl p-4 border border-primary/20 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">{cls.title || cls.category}</h4>
                          <p className="text-xs text-muted-foreground">{cls.day_of_week} • {cls.time_slot}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                        onClick={() => unenrollMutation.mutate(cls.id)}
                        disabled={unenrollMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        Sair
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      {timeLeft && (
                        <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-lg">
                          <Timer className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">{timeLeft}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="text-xs">{loc.name}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {selectedCategory && (
          /* Class Days List + Location */
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
                        <h4 className="font-semibold text-foreground text-sm">{cls.title || cls.day_of_week}</h4>
                        {cls.title && <p className="text-xs text-muted-foreground">{cls.day_of_week}</p>}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{cls.time_slot}</span>
                        </div>
                        {cls.address && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{cls.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isAdmin ? (
                      <span className="text-xs text-muted-foreground italic">
                        Admins não se inscrevem
                      </span>
                    ) : isEnrolled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                        onClick={() => unenrollMutation.mutate(cls.id)}
                        disabled={unenrollMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                        Desinscrever-se
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

            {/* Location Section */}
            {(() => {
              const loc = locationConfig[selectedCategory] ?? locationConfig["default"];
              const embedUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${loc.lat},${loc.lng}&zoom=15`;
              const directionsUrl = `https://www.google.com/maps/dir//${loc.lat},${loc.lng}`;
              return (
                <div className="space-y-3 pt-2">
                  <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Local das aulas
                  </h3>
                  <div className="relative rounded-xl overflow-hidden border border-border" style={{ height: "200px" }}>
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Mapa - ${loc.name}`}
                    />
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{loc.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{loc.address}</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full h-11" size="lg" asChild>
                    <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-4 w-4 mr-2" />
                      Abrir rota no Google Maps
                      <ExternalLink className="h-3.5 w-3.5 ml-2" />
                    </a>
                  </Button>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;
