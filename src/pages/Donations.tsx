import { Heart, ArrowLeft, Copy, Check, QrCode, ReceiptText, MapPin, Navigation, ExternalLink, CalendarDays } from "lucide-react";
import DonationCard from "@/components/DonationCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

const donationOptions = [
  { amount: 25, description: "Ajuda básica mensal", impact: "Alimenta 1 criança por 1 semana" },
  { amount: 50, description: "Contribuição solidária", impact: "Kit escolar completo para 1 aluno", popular: true },
  { amount: 100, description: "Apoio transformador", impact: "Cesta básica para 1 família" },
  { amount: 250, description: "Impacto real", impact: "Material para oficina comunitária" },
];

const PIX_KEY = "missaovida@pix.com";
const PIX_NAME = "Missão Vida";
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const subscriptionMonths = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
].map((name, index) => ({ name, index, dueDate: new Date(currentYear, index, 10) }));
const couponCollectionPoints = [
  {
    name: "Sede Missão Vida",
    address: "R. Jaci, 314 - Cidade Ariston Estela Azevedo, Carapicuíba - SP",
    mapsUrl: "https://maps.app.goo.gl/Cm6VyPve2Jy6w6ym9",
  },
  {
    name: "Ponto de apoio - Vila Cretti",
    address: "R. Ingá - Jardim Angela Maria, Carapicuíba - SP",
    mapsUrl: "https://maps.app.goo.gl/BrD1w9ymLqw7X54o6",
  },
];

const generatePixPayload = (amount: number) => {
  const amountStr = amount.toFixed(2);
  return `00020126360014BR.GOV.BCB.PIX0114${PIX_KEY}5204000053039865404${amountStr}5802BR5913${PIX_NAME}6009SAO PAULO62070503***6304`;
};

const Donations = () => {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"pix" | "cupom" | "assinatura">("pix");
  const [subscriptionAmount, setSubscriptionAmount] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [paidMonths, setPaidMonths] = useState<number[]>([]);

  const finalAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);

  const handleDonate = () => {
    if (finalAmount <= 0) {
      toast({ title: "Selecione um valor", description: "Escolha ou digite um valor para doar." });
      return;
    }
    setShowPix(true);
  };

  const handleCopyPix = () => {
    const payload = generatePixPayload(finalAmount);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    toast({ title: "Código PIX copiado!", description: "Cole no app do seu banco para finalizar." });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReset = () => {
    setShowPix(false);
    setSelectedAmount(null);
    setCustomAmount("");
    setCopied(false);
  };

  const subscriptionValue = subscriptionAmount ? parseFloat(subscriptionAmount) : 0;
  const selectedSubscriptionMonth = subscriptionMonths[selectedMonth];
  const subscriptionPayload = subscriptionValue > 0 ? generatePixPayload(subscriptionValue) : "";

  const getMonthStatus = (monthIndex: number, dueDate: Date) => {
    if (paidMonths.includes(monthIndex)) return { label: "Pago", className: "bg-success text-success-foreground" };
    if (dueDate < new Date()) return { label: "Atrasado", className: "bg-destructive text-destructive-foreground" };
    return { label: "Resta pagar", className: "bg-warning text-warning-foreground" };
  };

  const handleGenerateSubscriptionPix = () => {
    if (subscriptionValue <= 0) {
      toast({ title: "Informe um valor", description: "Digite o valor da assinatura mensal." });
      return;
    }
    toast({ title: "PIX da assinatura gerado", description: `Mês selecionado: ${selectedSubscriptionMonth.name}.` });
  };

  const handleCopySubscriptionPix = () => {
    navigator.clipboard.writeText(subscriptionPayload);
    setPaidMonths((months) => months.includes(selectedMonth) ? months : [...months, selectedMonth]);
    toast({ title: "Código PIX copiado!", description: "Após o pagamento, o mês ficará marcado como pago neste aparelho." });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-primary-foreground">Doe Agora</h1>
            <p className="text-primary-foreground/70 text-sm">Cada gesto faz a diferença</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-10">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={() => setActiveTab("pix")} className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "pix" ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-muted-foreground border border-border"}`}>
            <QrCode className="h-4 w-4 inline mr-1.5 -mt-0.5" /> PIX
          </button>
          <button onClick={() => setActiveTab("assinatura")} className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "assinatura" ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-muted-foreground border border-border"}`}>
            <CalendarDays className="h-4 w-4 inline mr-1.5 -mt-0.5" /> Assinatura
          </button>
          <button onClick={() => setActiveTab("cupom")} className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === "cupom" ? "bg-primary text-primary-foreground shadow-md" : "bg-card text-muted-foreground border border-border"}`}>
            <ReceiptText className="h-4 w-4 inline mr-1.5 -mt-0.5" /> Cupom fiscal
          </button>
        </div>

        {activeTab === "cupom" ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <ReceiptText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground">Doação de cupom fiscal</h2>
              <p className="text-sm text-muted-foreground mt-1">Entregue seus cupons fiscais em um dos pontos de coleta para apoiar os projetos da ONG.</p>
            </div>
            {couponCollectionPoints.map((point) => (
              <div key={point.name} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-foreground">{point.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{point.address}</p>
                  </div>
                </div>
                <Button className="w-full mt-3" variant="outline" asChild>
                  <a href={point.mapsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-4 w-4 mr-2" /> Abrir localização <ExternalLink className="h-3.5 w-3.5 ml-2" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        ) : (
        <>
        {/* Progress */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Meta do mês</span>
            <span className="font-semibold text-foreground">R$ 8.450 / R$ 15.000</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-primary rounded-full transition-all duration-1000" style={{ width: "56%" }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">142 doadores este mês 💚</p>
        </div>

        {!showPix ? (
          <>
            {/* Options */}
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Escolha o valor</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {donationOptions.map((opt) => (
                <DonationCard
                  key={opt.amount}
                  {...opt}
                  selected={selectedAmount === opt.amount}
                  onSelect={() => {
                    setSelectedAmount(opt.amount);
                    setCustomAmount("");
                  }}
                />
              ))}
            </div>

            {/* Custom amount */}
            <div className="bg-card rounded-xl p-4 border border-border mb-6">
              <label className="text-sm font-medium text-foreground mb-2 block">Outro valor</label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-foreground text-lg font-semibold placeholder:text-muted-foreground/50 border-0 outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* CTA */}
            <Button
              className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base rounded-xl shadow-lg hover:opacity-90 transition-opacity"
              onClick={handleDonate}
            >
              <QrCode className="h-5 w-5 mr-2" />
              Doar com PIX
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-3">
              🔒 Pagamento seguro via PIX
            </p>
          </>
        ) : (
          <div className="space-y-5 animate-fade-in-up">
            {/* Amount display */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Valor da doação</p>
              <p className="font-display text-3xl font-bold text-primary">
                R$ {finalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* QR Code */}
            <div className="bg-card rounded-2xl p-6 border border-border flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG value={generatePixPayload(finalAmount)} size={200} level="M" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Escaneie o QR Code com o app do seu banco
              </p>
            </div>

            {/* Copy button */}
            <Button variant="outline" className="w-full h-12" onClick={handleCopyPix}>
              {copied ? <Check className="h-5 w-5 mr-2" /> : <Copy className="h-5 w-5 mr-2" />}
              {copied ? "Código copiado!" : "Copiar código PIX"}
            </Button>

            {/* Back */}
            <Button variant="ghost" className="w-full" onClick={handleReset}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Alterar valor
            </Button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default Donations;
