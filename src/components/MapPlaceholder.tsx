import { MapPin, Navigation, Clock, Phone } from "lucide-react";

const donationPoints = [
  {
    id: 1,
    name: "Centro Comunitário Esperança",
    address: "Rua das Flores, 123 - Centro",
    hours: "08:00 - 17:00",
    phone: "(11) 3456-7890",
    distance: "1.2 km",
    accepts: ["Roupas", "Alimentos", "Brinquedos"],
  },
  {
    id: 2,
    name: "Igreja São Francisco",
    address: "Av. Brasil, 456 - Jardim América",
    hours: "09:00 - 18:00",
    phone: "(11) 2345-6789",
    distance: "2.8 km",
    accepts: ["Alimentos", "Cobertores"],
  },
  {
    id: 3,
    name: "Escola Municipal Futuro",
    address: "Rua da Paz, 789 - Vila Nova",
    hours: "07:00 - 16:00",
    phone: "(11) 9876-5432",
    distance: "3.5 km",
    accepts: ["Material Escolar", "Livros"],
  },
  {
    id: 4,
    name: "ONG Mãos Solidárias",
    address: "Rua Solidariedade, 321 - Bela Vista",
    hours: "10:00 - 19:00",
    phone: "(11) 1234-5678",
    distance: "4.1 km",
    accepts: ["Roupas", "Calçados", "Higiene"],
  },
];

const MapPlaceholder = () => {
  return (
    <div className="space-y-4">
      {/* Map visual */}
      <div className="relative h-52 rounded-xl overflow-hidden bg-muted border border-border">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full gradient-primary mx-auto flex items-center justify-center mb-3">
              <Navigation className="h-7 w-7 text-primary-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Mapa Interativo</p>
            <p className="text-xs text-muted-foreground mt-1">Encontre pontos de doação perto de você</p>
          </div>
        </div>
        {/* Decorative dots */}
        {[
          "top-8 left-12", "top-16 right-20", "bottom-12 left-1/3",
          "top-1/3 right-1/4", "bottom-8 right-12"
        ].map((pos, i) => (
          <div key={i} className={`absolute ${pos}`}>
            <MapPin className="h-5 w-5 text-primary drop-shadow-md" />
          </div>
        ))}
      </div>

      {/* Points list */}
      <div className="space-y-3">
        {donationPoints.map((point, i) => (
          <div
            key={point.id}
            className="bg-card rounded-xl p-4 border border-border animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{point.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{point.address}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-primary whitespace-nowrap">{point.distance}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-12">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {point.hours}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" /> {point.phone}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2.5 ml-12">
              {point.accepts.map((item) => (
                <span key={item} className="text-[0.65rem] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapPlaceholder;
