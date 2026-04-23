import { useState, useEffect } from "react";
import { ArrowLeft, Users, DollarSign, BookOpen, Shield, Search, Plus, Trash2, UserCheck, Link2, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

type AdminTab = "alunos" | "doacoes" | "assinaturas" | "aulas" | "presencas" | "responsaveis" | "seguranca";

const CATEGORY_LABELS: Record<string, string> = {
  futebol: "⚽ Futebol",
  Futebol: "⚽ Futebol",
  "jiu-jitsu": "🥋 Jiu-jítsu",
  "Jiu-jítsu": "🥋 Jiu-jítsu",
  informatica: "💻 Informática",
  "Informática": "💻 Informática",
  palestras: "🎤 Palestras",
  Palestras: "🎤 Palestras",
};

const DAY_LABELS: Record<string, string> = {
  segunda: "Segunda", terca: "Terça", quarta: "Quarta", quinta: "Quinta",
  sexta: "Sexta", sabado: "Sábado", domingo: "Domingo",
  "Segunda-feira": "Segunda", "Terça-feira": "Terça", "Quarta-feira": "Quarta", "Quinta-feira": "Quinta",
  "Sexta-feira": "Sexta", "Sábado": "Sábado", "Domingo": "Domingo",
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("alunos");
  const [search, setSearch] = useState("");

  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [parentLinks, setParentLinks] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showClassForm, setShowClassForm] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [classForm, setClassForm] = useState({ category: "", day_of_week: "", time_slot: "", max_capacity: "30" });
  const [linkForm, setLinkForm] = useState({ parent_user_id: "", child_user_id: "", relationship: "responsável" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [enrollRes, donRes, classRes, usersRes, attendanceRes, linksRes, subsRes] = await Promise.all([
      supabase.from("class_enrollments" as any).select("*, classes(*)"),
      supabase.from("donations" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("classes" as any).select("*"),
      supabase.from("profiles" as any).select("*"),
      supabase.from("class_attendance" as any).select("*").order("confirmed_at", { ascending: false }),
      supabase.from("parent_child_links" as any).select("*"),
      supabase.from("subscription_registrations" as any).select("*").order("created_at", { ascending: false }),
    ]);

    setEnrollments((enrollRes.data as any[]) || []);
    setDonations((donRes.data as any[]) || []);
    setClasses((classRes.data as any[]) || []);
    setUsers((usersRes.data as any[]) || []);
    setAttendance((attendanceRes.data as any[]) || []);
    setParentLinks((linksRes.data as any[]) || []);
    setSubscriptions((subsRes.data as any[]) || []);
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
    if (error) toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Aula excluída" });
      loadData();
    }
  };

  const handleToggleAttendance = async (enrollment: any) => {
    const today = new Date().toISOString().slice(0, 10);
    const existing = attendance.find((a) => a.enrollment_id === enrollment.id && a.class_date === today);

    const { error } = existing
      ? await supabase.from("class_attendance" as any).delete().eq("id", existing.id)
      : await supabase.from("class_attendance" as any).insert({
          enrollment_id: enrollment.id,
          class_id: enrollment.class_id,
          student_user_id: enrollment.user_id,
          confirmed_by: user!.id,
          class_date: today,
        } as any);

    if (error) toast({ title: "Erro ao atualizar presença", description: error.message, variant: "destructive" });
    else {
      toast({ title: existing ? "Presença removida" : "Presença confirmada" });
      loadData();
    }
  };

  const handleCreateLink = async () => {
    if (!linkForm.parent_user_id || !linkForm.child_user_id) {
      toast({ title: "Selecione responsável e aluno", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("parent_child_links" as any).insert(linkForm as any);
    if (error) toast({ title: "Erro ao vincular", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Responsável vinculado ao aluno" });
      setShowLinkForm(false);
      setLinkForm({ parent_user_id: "", child_user_id: "", relationship: "responsável" });
      loadData();
    }
  };

  const tabs = [
    { id: "alunos" as AdminTab, label: "Alunos", icon: Users, count: enrollments.length },
    { id: "doacoes" as AdminTab, label: "Doações", icon: DollarSign, count: donations.length },
    { id: "assinaturas" as AdminTab, label: "Assinaturas", icon: CalendarDays, count: subscriptions.length },
    { id: "aulas" as AdminTab, label: "Aulas", icon: BookOpen, count: classes.length },
    { id: "presencas" as AdminTab, label: "Presenças", icon: UserCheck, count: attendance.length },
    { id: "responsaveis" as AdminTab, label: "Pais", icon: Link2, count: parentLinks.length },
    { id: "seguranca" as AdminTab, label: "Segurança", icon: Shield, count: users.length },
  ];

  const totalDonations = donations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);

  const getEnrollmentsByClass = () => {
    const grouped: Record<string, any[]> = {};
    enrollments.forEach((e: any) => {
      const classInfo = e.classes;
      const key = classInfo ? `${CATEGORY_LABELS[classInfo.category] || classInfo.category} - ${DAY_LABELS[classInfo.day_of_week] || classInfo.day_of_week} ${classInfo.time_slot}` : "Sem turma";
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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-background pb-24">
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

        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? "bg-primary-foreground text-primary" : "bg-primary-foreground/10 text-primary-foreground/70"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-primary-foreground/10 text-primary-foreground/50"}`}>
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
                      {students.map((s: any) => (
                        <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{getUserName(s.user_id)}</p>
                            <p className="text-xs text-muted-foreground">Inscrito em {new Date(s.enrolled_at).toLocaleDateString("pt-BR")}</p>
                          </div>
                          <Badge variant={attendance.some((a) => a.enrollment_id === s.id && a.class_date === today) ? "default" : "secondary"} className="text-[10px]">
                            {attendance.some((a) => a.enrollment_id === s.id && a.class_date === today) ? "Presente" : "Pendente"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {enrollments.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma matrícula encontrada</div>}
              </div>
            )}

            {activeTab === "doacoes" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground">Total Arrecadado</p>
                    <p className="text-2xl font-bold text-primary">R$ {totalDonations.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="bg-card rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground">Nº de Doações</p>
                    <p className="text-2xl font-bold text-foreground">{donations.length}</p>
                  </div>
                </div>

                {donations.length > 0 ? (
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30"><h3 className="font-semibold text-foreground text-sm">Histórico de Doações</h3></div>
                    <div className="divide-y divide-border">
                      {donations.map((d: any) => (
                        <div key={d.id} className="px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{d.donor_name || getUserName(d.user_id)}</p>
                            <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">R$ {Number(d.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                            <Badge variant={d.status === "confirmed" ? "default" : "secondary"} className="text-[10px]">{d.status === "confirmed" ? "Confirmada" : "Pendente"}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma doação registrada</div>}
              </div>
            )}

            {activeTab === "aulas" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Turmas Cadastradas</h3>
                  <Dialog open={showClassForm} onOpenChange={setShowClassForm}>
                    <DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Nova Aula</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Criar Nova Aula</DialogTitle></DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div><Label>Categoria</Label><Select value={classForm.category} onValueChange={(v) => setClassForm({ ...classForm, category: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Futebol">Futebol</SelectItem><SelectItem value="Jiu-jítsu">Jiu-jítsu</SelectItem><SelectItem value="Informática">Informática</SelectItem><SelectItem value="Palestras">Palestras</SelectItem></SelectContent></Select></div>
                        <div><Label>Dia da Semana</Label><Select value={classForm.day_of_week} onValueChange={(v) => setClassForm({ ...classForm, day_of_week: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{Object.entries(DAY_LABELS).slice(0, 7).map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}</SelectContent></Select></div>
                        <div><Label>Horário</Label><Input placeholder="Ex: 14:00 - 16:00" value={classForm.time_slot} onChange={(e) => setClassForm({ ...classForm, time_slot: e.target.value })} /></div>
                        <div><Label>Capacidade Máxima</Label><Input type="number" value={classForm.max_capacity} onChange={(e) => setClassForm({ ...classForm, max_capacity: e.target.value })} /></div>
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
                        <div><h4 className="font-semibold text-foreground text-sm">{CATEGORY_LABELS[c.category] || c.category}</h4><p className="text-xs text-muted-foreground">{DAY_LABELS[c.day_of_week] || c.day_of_week} • {c.time_slot}</p></div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClass(c.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{enrolled}/{c.max_capacity || "∞"} alunos</span></div><div className="h-1.5 flex-1 mx-3 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((enrolled / (c.max_capacity || 30)) * 100, 100)}%` }} /></div></div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "presencas" && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold text-foreground text-sm mb-1">Presenças de Hoje</h3><p className="text-3xl font-bold text-primary">{attendance.filter((a) => a.class_date === today).length}</p></div>
                {enrollments.map((e: any) => {
                  const present = attendance.some((a) => a.enrollment_id === e.id && a.class_date === today);
                  const cls = e.classes;
                  return (
                    <div key={e.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between gap-3">
                      <div><p className="text-sm font-medium text-foreground">{getUserName(e.user_id)}</p><p className="text-xs text-muted-foreground">{cls ? `${CATEGORY_LABELS[cls.category] || cls.category} • ${DAY_LABELS[cls.day_of_week] || cls.day_of_week} ${cls.time_slot}` : "Aula"}</p></div>
                      <Button size="sm" variant={present ? "default" : "outline"} onClick={() => handleToggleAttendance(e)} className="gap-1.5"><UserCheck className="h-4 w-4" />{present ? "Presente" : "Confirmar"}</Button>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "responsaveis" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between"><h3 className="font-semibold text-foreground">Vínculos de Pais</h3><Dialog open={showLinkForm} onOpenChange={setShowLinkForm}><DialogTrigger asChild><Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Vincular</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Vincular responsável</DialogTitle></DialogHeader><div className="space-y-4 mt-2"><div><Label>Responsável</Label><Select value={linkForm.parent_user_id} onValueChange={(v) => setLinkForm({ ...linkForm, parent_user_id: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{users.map((u) => <SelectItem key={u.user_id} value={u.user_id}>{u.display_name || u.user_id}</SelectItem>)}</SelectContent></Select></div><div><Label>Aluno/filho</Label><Select value={linkForm.child_user_id} onValueChange={(v) => setLinkForm({ ...linkForm, child_user_id: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{users.map((u) => <SelectItem key={u.user_id} value={u.user_id}>{u.display_name || u.user_id}</SelectItem>)}</SelectContent></Select></div><div><Label>Relação</Label><Input value={linkForm.relationship} onChange={(e) => setLinkForm({ ...linkForm, relationship: e.target.value })} /></div><Button onClick={handleCreateLink} className="w-full">Salvar vínculo</Button></div></DialogContent></Dialog></div>
                {parentLinks.map((link) => <div key={link.id} className="bg-card rounded-xl p-4 border border-border"><p className="text-sm font-semibold text-foreground">{getUserName(link.parent_user_id)}</p><p className="text-xs text-muted-foreground">Responsável por {getUserName(link.child_user_id)} • {link.relationship}</p></div>)}
                {parentLinks.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">Nenhum vínculo cadastrado</div>}
              </div>
            )}

            {activeTab === "seguranca" && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl p-4 border border-border"><h3 className="font-semibold text-foreground text-sm mb-1">Usuários Cadastrados</h3><p className="text-3xl font-bold text-primary">{users.length}</p></div>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar usuário..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
                <div className="bg-card rounded-xl border border-border overflow-hidden"><div className="p-4 border-b border-border bg-muted/30"><h3 className="font-semibold text-foreground text-sm">Lista de Usuários</h3></div><div className="divide-y divide-border">{filteredUsers.map((u: any) => <div key={u.id} className="px-4 py-3 flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-xs font-bold text-primary">{(u.display_name || "U")[0].toUpperCase()}</span></div><div><p className="text-sm font-medium text-foreground">{u.display_name || "Sem nome"}</p><p className="text-xs text-muted-foreground">Desde {new Date(u.created_at).toLocaleDateString("pt-BR")}</p></div></div><Badge variant="secondary" className="text-[10px]">Usuário</Badge></div>)}</div></div>
                <div className="bg-card rounded-xl p-4 border border-border"><div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-primary" /><h3 className="font-semibold text-foreground text-sm">Informações de Segurança</h3></div><div className="space-y-2 text-xs text-muted-foreground"><p>• Usuários não podem alterar configurações do app</p><p>• Dados protegidos por políticas de acesso</p><p>• Autenticação obrigatória para todas as funcionalidades</p><p>• Proteção contra senhas vazadas ativada</p></div></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
