import { useState } from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const toCSV = (rows: any[]) => {
  if (!rows.length) return "";
  const headerSet = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => headerSet.add(k)));
  const headers: string[] = Array.from(headerSet);
  const esc = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [headers.join(";"), ...rows.map((r) => headers.map((h) => esc(r[h])).join(";"))].join("\n");
};

const download = (filename: string, content: string) => {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

const BackupExport = () => {
  const { toast } = useToast();
  const [from, setFrom] = useState(daysAgo(7));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const fetchRange = async (table: string, dateColumn: string) => {
    const start = `${from}T00:00:00.000Z`;
    const end = `${to}T23:59:59.999Z`;
    const isDateOnly = dateColumn === "class_date" || dateColumn === "event_date";
    let query = (supabase as any).from(table).select("*");
    query = isDateOnly
      ? query.gte(dateColumn, from).lte(dateColumn, to)
      : query.gte(dateColumn, start).lte(dateColumn, end);
    const { data, error } = await query.order(dateColumn, { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const exports = [
    { key: "class_attendance", label: "Presenças em aulas", table: "class_attendance", dateColumn: "class_date" },
    { key: "class_enrollments", label: "Inscrições em aulas", table: "class_enrollments", dateColumn: "enrolled_at" },
    { key: "event_registrations", label: "Inscrições em eventos", table: "event_registrations", dateColumn: "registered_at" },
    { key: "donations", label: "Doações", table: "donations", dateColumn: "created_at" },
    { key: "volunteer_registrations", label: "Inscrições de voluntários", table: "volunteer_registrations", dateColumn: "created_at" },
    { key: "subscription_registrations", label: "Guardiões", table: "subscription_registrations", dateColumn: "created_at" },
  ];

  const handleExport = async (item: (typeof exports)[number]) => {
    setBusy(item.key);
    try {
      const rows = await fetchRange(item.table, item.dateColumn);
      if (!rows.length) {
        toast({ title: "Nada para baixar", description: `Sem registros de ${item.label.toLowerCase()} nesse período.` });
        return;
      }
      download(`${item.key}_${from}_a_${to}.csv`, toCSV(rows));
      toast({ title: "Arquivo baixado", description: `${rows.length} registro(s) de ${item.label.toLowerCase()}.` });
    } catch (e: any) {
      toast({ title: "Erro ao baixar", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleExportAll = async () => {
    setBusy("all");
    try {
      let total = 0;
      for (const item of exports) {
        const rows = await fetchRange(item.table, item.dateColumn);
        if (!rows.length) continue;
        total += rows.length;
        download(`${item.key}_${from}_a_${to}.csv`, toCSV(rows));
        await new Promise((r) => setTimeout(r, 400));
      }
      toast({ title: "Backup gerado", description: `${total} registro(s) exportados no período.` });
    } catch (e: any) {
      toast({ title: "Erro ao gerar backup", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleResetAttendance = async () => {
    if (confirmText !== "APAGAR") {
      toast({ title: "Confirmação necessária", description: 'Escreva APAGAR para confirmar.', variant: "destructive" });
      return;
    }
    setBusy("reset");
    try {
      const { error, count } = await supabase
        .from("class_attendance")
        .delete({ count: "exact" })
        .gte("class_date", from)
        .lte("class_date", to);
      if (error) throw error;
      setConfirmText("");
      toast({ title: "Presenças apagadas", description: `${count ?? 0} registro(s) removidos do período.` });
    } catch (e: any) {
      toast({ title: "Erro ao apagar", description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h3 className="font-semibold text-foreground text-sm">Período do backup</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">De</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setFrom(daysAgo(7)); setTo(new Date().toISOString().slice(0, 10)); }}>
            Últimos 7 dias
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setFrom(daysAgo(30)); setTo(new Date().toISOString().slice(0, 10)); }}>
            Últimos 30 dias
          </Button>
        </div>
        <Button className="w-full gap-2" onClick={handleExportAll} disabled={busy !== null}>
          {busy === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Baixar tudo do período
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {exports.map((item) => (
          <div key={item.key} className="p-4 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleExport(item)} disabled={busy !== null}>
              {busy === item.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              CSV
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-destructive/30 p-4 space-y-3">
        <h3 className="font-semibold text-destructive text-sm">Limpar presenças do período</h3>
        <p className="text-xs text-muted-foreground">
          Baixe o arquivo antes. Isso apaga somente as presenças registradas entre {new Date(from + "T12:00:00").toLocaleDateString("pt-BR")} e {new Date(to + "T12:00:00").toLocaleDateString("pt-BR")}. Matrículas, doações e inscrições não são afetadas.
        </p>
        <Input placeholder="Escreva APAGAR para confirmar" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        <Button variant="destructive" className="w-full gap-2" onClick={handleResetAttendance} disabled={busy !== null || confirmText !== "APAGAR"}>
          {busy === "reset" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Apagar presenças do período
        </Button>
      </div>
    </div>
  );
};

export default BackupExport;
