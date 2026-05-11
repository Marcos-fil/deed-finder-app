import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, User, X } from "lucide-react";

interface Child {
  id: string;
  name: string;
  cause: string;
  description: string | null;
  amount: number;
  payment_link: string;
}

interface Sponsor {
  id: string;
  child_id: string;
  user_id: string;
  created_at: string;
}

const SponsorshipAdmin = () => {
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", cause: "", description: "", amount: "", payment_link: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("sponsorship_children" as any)
      .select("*")
      .order("created_at", { ascending: true });
    const list = (data as any as Child[]) || [];
    setChildren(list);

    const { data: sps } = await supabase
      .from("sponsorship_sponsors" as any)
      .select("*")
      .order("created_at", { ascending: false });
    const sList = (sps as any as Sponsor[]) || [];
    setSponsors(sList);

    const ids = Array.from(new Set(sList.map((s) => s.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", ids);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => {
        map[p.user_id] = p.display_name || p.user_id.slice(0, 8);
      });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    const amount = parseFloat(form.amount);
    if (!form.name || !form.cause || !form.payment_link || !amount) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("sponsorship_children" as any).insert({
      name: form.name.trim(),
      cause: form.cause.trim(),
      description: form.description.trim() || null,
      amount,
      payment_link: form.payment_link.trim(),
    } as any);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Criança adicionada!" });
    setForm({ name: "", cause: "", description: "", amount: "", payment_link: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta criança?")) return;
    const { error } = await supabase.from("sponsorship_children" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Removida" });
    load();
  };

  const handleRemoveSponsor = async (sponsorId: string) => {
    const { error } = await supabase.from("sponsorship_sponsors" as any).delete().eq("id", sponsorId);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Padrinho removido" });
    load();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar criança</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Causa (ex.: Material escolar)</Label>
            <Input value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Valor (R$)</Label>
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <Label>Link de pagamento</Label>
            <Input placeholder="https://..." value={form.payment_link} onChange={(e) => setForm({ ...form, payment_link: e.target.value })} />
          </div>
          <Button onClick={handleAdd} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Adicionar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Crianças cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : children.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma criança cadastrada.</p>
          ) : (
            children.map((child) => {
              const childSponsors = sponsors.filter((s) => s.child_id === child.id);
              return (
                <div key={child.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold">{child.name}</p>
                      <p className="text-sm text-primary">{child.cause}</p>
                      <p className="text-sm font-bold mt-1">R$ {Number(child.amount).toFixed(2).replace(".", ",")}</p>
                      <a href={child.payment_link} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline break-all">
                        {child.payment_link}
                      </a>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(child.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="mt-2 bg-muted rounded-lg p-2 text-sm">
                    <p className="font-medium mb-2">Padrinhos ({childSponsors.length})</p>
                    {childSponsors.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhum padrinho ainda</p>
                    ) : (
                      <div className="space-y-1">
                        {childSponsors.map((s) => (
                          <div key={s.id} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs">
                              <User className="h-3 w-3 text-primary" />
                              <span>{profiles[s.user_id] || s.user_id.slice(0, 8)}</span>
                              <span className="text-muted-foreground">
                                {new Date(s.created_at).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleRemoveSponsor(s.id)}>
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SponsorshipAdmin;
