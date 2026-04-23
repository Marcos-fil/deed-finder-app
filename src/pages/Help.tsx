import { ArrowLeft, Phone, Mail, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

const schedule = [
  { day: "Segunda-feira", hours: "09:00 – 17:00" },
  { day: "Terça-feira", hours: "09:00 – 17:00" },
  { day: "Quarta-feira", hours: "09:00 – 17:00" },
  { day: "Quinta-feira", hours: "09:00 – 17:00" },
  { day: "Sexta-feira", hours: "09:00 – 17:00" },
  { day: "Sábado", hours: "Fechado" },
  { day: "Domingo", hours: "Fechado" },
];

const Help = () => {
  const navigate = useNavigate();
  const { get } = useSiteContent();
  const phone = get("help_contact", "phone");
  const phoneLink = get("help_contact", "phone_link");
  const email = get("help_contact", "email");
  const address = get("help_contact", "address");

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-primary px-5 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">Ajuda e Suporte</h1>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        <a href={phoneLink} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Telefone</h3>
            <p className="text-sm text-muted-foreground">{phone}</p>
          </div>
        </a>

        <a href={`mailto:${email}`} className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">E-mail</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </a>

        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm text-foreground">Horário de Funcionamento</h3>
          </div>
          <div className="space-y-2 ml-[52px]">
            {schedule.map(({ day, hours }) => (
              <div key={day} className="flex justify-between text-sm">
                <span className="text-foreground">{day}</span>
                <span className={hours === "Fechado" ? "text-destructive font-medium" : "text-muted-foreground"}>
                  {hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Endereço</h3>
            <p className="text-sm text-muted-foreground">{address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
