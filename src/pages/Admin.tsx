import { useState, useEffect } from "react";
import { ArrowLeft, Users, DollarSign, BookOpen, Shield, Calendar, Search, ChevronRight, Plus, Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AdminTab = "alunos" | "doacoes" | "aulas" | "seguranca";

const CATEGORY_LABELS: Record<string, string> = {
  futebol: "⚽ Futebol",
  "jiu-jitsu": "🥋 Jiu-jítsu",
  informatica: "💻 Informática",
  palestras: "🎤 Palestras",
};

const DAY_LABELS: Record<string, string> = {
  segunda: "Segunda", terca: "Terça", quarta: "Quarta", quinta: "Quinta",
  sexta: "Sexta", sabado: "Sábado", domingo: "Domingo",
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("alunos");
  const [search, setSearch] = useState("");

  // Data states
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Class form
  const [showClassForm, setShowClassForm] = useState(false);
  const [classForm, setClassForm] = useState({ category: "", day_of_week: "", time_slot: "", max_capacity: "30" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [enrollRes, donRes, classRes, usersRes] = await Promise.all([
      supabase.from("class_enrollments" as any).select("*, classes(*)"),
      supabase.from("donations" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("classes" as any).select("*"),
      supabase.from("profiles" as any).select("*"),
    ]);

    setEnrollments((enrollRes.data as any[]) || []);
    setDonations((donRes.data as any[]) || []);
    setClasses((classRes.data as any[]) || []);
    setUsers((usersRes.data as any[]) || []);
    setLoading(false);
  };

  const handleCreateClass = async () => {
    if (!classForm.category || !classForm.day_of_week || !classForm.time_slot) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("classes" as any).insert({
      category: classForm.category,
      day_of_week: classForm.day_of_week,
      time_slot: classForm.time_slot,
      max_capacity: parseInt(classForm.max_capacity) || 30,
    } as any);

    if (error) {
      toast({ title: "Erro ao criar aula", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Aula criada com sucesso!" });
      setShowClassForm(false);
      setClassForm({ category: "", day_of_week: "", time_slot: "", max_capacity: "30" });
      loadData();
    }
  };

  const handleDeleteClass = async (id: string) => {
    const { error } = await supabase.from("classes" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Aula excluída" });
      loadData();
    }
  };

  const tabs = [
    { id: "alunos" as AdminTab, label: "Alunos", icon: Users, count: enrollments.length },
    { id: "doacoes" as AdminTab, label: "Doações", icon: DollarSign, count: donations.length },
    { id: "aulas" as AdminTab, label: "Aulas", icon: BookOpen, count: classes.length },
    { id: "seguranca" as AdminTab, label: "Segurança", icon: Shield, count: users.length },
  ];

  const totalDonations = donations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);

  const getEnrollmentsByClass = () => {
    const grouped: Record<string, any[]> = {};
    enrollments.forEach((e: any) => {
      const classInfo = e.classes;
      const key = classInfo ? `${classInfo.category} - ${DAY_LABELS[classInfo.day_of_week] || classInfo.day_of_week} ${classInfo.time_slot}` : "Sem turma";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    });
    return grouped;
  };

  const getUserName = (userId: string) => {
    const profile = users.find((u: any) => u.user_id === userId);
    return profile?.display_name || "Usuário";
  };

  const filteredUsers = users.filter((u: any) =>
    (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/")} className="text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-primary-foreground">Painel Administrativo</h1>
            <p className="text-primary-foreground/70 text-xs">Gestão da ONG Missão Vida</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary-foreground text-primary"
                  : "bg-primary-foreground/10 text-primary-foreground/70"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-primary-foreground/10 text-primary-foreground/50"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando...</div>
        ) : (
          <>
            {/* ALUNOS TAB */}
            {activeTab === "alunos" && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground text-sm mb-1">Total de Matrículas</h3>
                  <p className="text-3xl font-bold text-primary">{enrollments.length}</p>
                </div>

                {Object.entries(getEnrollmentsByClass()).map(([className, students]) => (
                  <div key={className} className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground text-sm">{className}</h3>
                        <Badge variant="secondary" className="text-xs">{students.length} alunos</Badge>
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {students.map((s: any, i: number) => (
                        <div key={i} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{getUserName(s.user_id)}</p>
                            <p className="text-xs text-muted-foreground">
                              Inscrito em {new Date(s.enrolled_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {enrollments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma matrícula encontrada</div>
                )}
              </div>
            )}

            {/* DOAÇÕES TAB */}
            {activeTab === "doacoes" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground">Total Arrecadado</p>
                    <p className="text-2xl font-bold text-primary">
                      R$ {totalDonations.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground">Nº de Doações</p>
                    <p className="text-2xl font-bold text-foreground">{donations.length}</p>
                  </div>
                </div>

                {donations.length > 0 ? (
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30">
                      <h3 className="font-semibold text-foreground text-sm">Histórico de Doações</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {donations.map((d: any) => (
                        <div key={d.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {d.donor_name || getUserName(d.user_id)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(d.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">
                              R$ {Number(d.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                            <Badge variant={d.status === "confirmed" ? "default" : "secondary"} className="text-[10px]">
                              {d.status === "confirmed" ? "Confirmada" : "Pendente"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma doação registrada</div>
                )}
              </div>
            )}

            {/* AULAS TAB */}
            {activeTab === "aulas" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Turmas Cadastradas</h3>
                  <Dialog open={showClassForm} onOpenChange={setShowClassForm}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1.5">
                        <Plus className="h-4 w-4" /> Nova Aula
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Criar Nova Aula</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div>
                          <Label>Categoria</Label>
                          <Select value={classForm.category} onValueChange={(v) => setClassForm({ ...classForm, category: v })}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="futebol">Futebol</SelectItem>
                              <SelectItem value="jiu-jitsu">Jiu-jítsu</SelectItem>
                              <SelectItem value="informatica">Informática</SelectItem>
                              <SelectItem value="palestras">Palestras</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Dia da Semana</Label>
                          <Select value={classForm.day_of_week} onValueChange={(v) => setClassForm({ ...classForm, day_of_week: v })}>
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(DAY_LABELS).map(([val, label]) => (
                                <SelectItem key={val} value={val}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Horário</Label>
                          <Input
                            placeholder="Ex: 14:00 - 16:00"
                            value={classForm.time_slot}
                            onChange={(e) => setClassForm({ ...classForm, time_slot: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Capacidade Máxima</Label>
                          <Input
                            type="number"
                            value={classForm.max_capacity}
                            onChange={(e) => setClassForm({ ...classForm, max_capacity: e.target.value })}
                          />
                        </div>
                        <Button onClick={handleCreateClass} className="w-full">Criar Aula</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {classes.map((c: any) => {
                  const enrolled = enrollments.filter((e: any) => e.class_id === c.id).length;
                  return (
                    <div key={c.id} className="bg-card rounded-xl p-4 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground text-sm">
                            {CATEGORY_LABELS[c.category] || c.category}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {DAY_LABELS[c.day_of_week] || c.day_of_week} • {c.time_slot}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClass(c.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{enrolled}/{c.max_capacity || "∞"} alunos</span>
                        </div>
                        <div className="h-1.5 flex-1 mx-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min((enrolled / (c.max_capacity || 30)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SEGURANÇA TAB */}
            {activeTab === "seguranca" && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-semibold text-foreground text-sm mb-1">Usuários Cadastrados</h3>
                  <p className="text-3xl font-bold text-primary">{users.length}</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuário..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="font-semibold text-foreground text-sm">Lista de Usuários</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {filteredUsers.map((u: any) => (
                      <div key={u.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">
                              {(u.display_name || "U")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{u.display_name || "Sem nome"}</p>
                            <p className="text-xs text-muted-foreground">
                              Desde {new Date(u.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">Usuário</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground text-sm">Informações de Segurança</h3>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>• Usuários não podem alterar configurações do app</p>
                    <p>• Dados protegidos por políticas de acesso (RLS)</p>
                    <p>• Autenticação obrigatória para todas as funcionalidades</p>
                    <p>• Sessões expiram automaticamente após inatividade</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
