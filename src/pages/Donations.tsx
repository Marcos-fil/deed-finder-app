import { Heart, CreditCard } from "lucide-react";
import DonationCard from "@/components/DonationCard";
import { Button } from "@/components/ui/button";

const donationOptions = [
  { amount: 25, description: "Ajuda básica mensal", impact: "Alimenta 1 criança por 1 semana" },
  { amount: 50, description: "Contribuição solidária", impact: "Kit escolar completo para 1 aluno", popular: true },
  { amount: 100, description: "Apoio transformador", impact: "Cesta básica para 1 família" },
  { amount: 250, description: "Impacto real", impact: "Material para oficina comunitária" },
];

const Donations = () => {
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

        {/* Options */}
        <h2 className="font-display text-lg font-semibold text-foreground mb-3">Escolha o valor</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {donationOptions.map((opt) => (
            <DonationCard key={opt.amount} {...opt} />
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
              className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-foreground text-lg font-semibold placeholder:text-muted-foreground/50 border-0 outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* CTA */}
        <Button className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base rounded-xl shadow-lg hover:opacity-90 transition-opacity">
          <CreditCard className="h-5 w-5 mr-2" />
          Doar com Segurança
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          🔒 Pagamento seguro e criptografado
        </p>
      </div>
    </div>
  );
};

export default Donations;
