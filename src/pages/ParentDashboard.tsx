import { useMemo } from "react";
import { ArrowLeft, Users, BookOpen, UserCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: links = [], isLoading: linksLoading } = useQuery({
    queryKey: ["parent-child-links", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parent_child_links" as any)
        .select("*")
        .eq("parent_user_id", user!.id);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const childIds = useMemo(() => links.map((link: any) => link.child_user_id), [links]);

  const { data: profiles = [] } = useQuery({
    queryKey: ["children-profiles", childIds],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles" as any).select("*").in("user_id", childIds);
      if (error) throw error;
      return data as any[];
    },
    enabled: childIds.length > 0,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["children-enrollments", childIds],
    queryFn: async () => {
      const { data, error } = await supabase.from("class_enrollments" as any).select("*, classes(*)").in("user_id", childIds);
      if (error) throw error;
      return data as any[];
    },
    enabled: childIds.length > 0,
  });

  const { data: attendance = [] } = useQuery({
    queryKey: ["children-attendance", childIds],
    queryFn: async () => {
      const { data, error } = await supabase.from("class_attendance" as any).select("*").in("student_user_id", childIds).order("confirmed_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: childIds.length > 0,
  });

  const getChildName = (id: string) => profiles.find((p: any) => p.user_id === id)?.display_name || "Aluno";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-primary px-5 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="text-primary-foreground"><ArrowLeft className="h-5 w-5" /></button>
          <div>
            <h1 className="font-display text-xl font-bold text-primary-foreground">Conta dos Pais</h1>
            <p className="text-primary-foreground/70 text-sm">Acompanhe aulas e presenças do filho</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-xl p-3 border border-border text-center"><Users className="h-4 w-4 text-primary mx-auto mb-1" /><p className="font-bold text-foreground">{childIds.length}</p><p className="text-[0.65rem] text-muted-foreground">Filhos</p></div>
          <div className="bg-card rounded-xl p-3 border border-border text-center"><BookOpen className="h-4 w-4 text-primary mx-auto mb-1" /><p className="font-bold text-foreground">{enrollments.length}</p><p className="text-[0.65rem] text-muted-foreground">Aulas</p></div>
          <div className="bg-card rounded-xl p-3 border border-border text-center"><UserCheck className="h-4 w-4 text-primary mx-auto mb-1" /><p className="font-bold text-foreground">{attendance.length}</p><p className="text-[0.65rem] text-muted-foreground">Presenças</p></div>
        </div>

        {linksLoading ? (
          <div className="text-center py-10 text-sm text-muted-foreground">Carregando...</div>
        ) : childIds.length === 0 ? (
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-sm">Nenhum filho vinculado</h3>
            <p className="text-xs text-muted-foreground mt-1">Peça para um administrador vincular sua conta à conta do aluno.</p>
          </div>
        ) : (
          childIds.map((childId: string) => {
            const childEnrollments = enrollments.filter((e: any) => e.user_id === childId);
            const childAttendance = attendance.filter((a: any) => a.student_user_id === childId);
            return (
              <div key={childId} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="font-semibold text-foreground text-sm">{getChildName(childId)}</h3>
                  <p className="text-xs text-muted-foreground">{childEnrollments.length} aulas inscritas</p>
                </div>
                <div className="divide-y divide-border">
                  {childEnrollments.map((enrollment: any) => {
                    const cls = enrollment.classes;
                    const wasPresent = childAttendance.some((a: any) => a.enrollment_id === enrollment.id);
                    return (
                      <div key={enrollment.id} className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{cls?.category || "Aula"}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{cls?.day_of_week} • {cls?.time_slot}</p>
                        </div>
                        <Badge variant={wasPresent ? "default" : "secondary"} className="text-[10px]">{wasPresent ? "Presença confirmada" : "Sem presença"}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
