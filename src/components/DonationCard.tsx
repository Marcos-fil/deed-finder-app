import { Check } from "lucide-react";
import { useState } from "react";

interface DonationCardProps {
  amount: number;
  description: string;
  impact: string;
  popular?: boolean;
}

const DonationCard = ({ amount, description, impact, popular }: DonationCardProps) => {
  const [selected, setSelected] = useState(false);

  return (
    <button
      onClick={() => setSelected(!selected)}
      className={`relative w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      {popular && (
        <span className="absolute -top-2.5 right-4 gradient-primary text-primary-foreground text-[0.65rem] font-bold px-2.5 py-0.5 rounded-full">
          Popular
        </span>
      )}
      {selected && (
        <div className="absolute top-3 right-3 h-5 w-5 rounded-full gradient-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
      <p className="font-display text-2xl font-bold text-foreground">
        R$ {amount.toLocaleString("pt-BR")}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <p className="text-xs text-primary font-medium mt-2">🌱 {impact}</p>
    </button>
  );
};

export default DonationCard;
