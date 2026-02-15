import { Search } from "lucide-react";
import MapPlaceholder from "@/components/MapPlaceholder";

const Map = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Pontos de Doação</h1>
        <p className="text-sm text-muted-foreground">Encontre onde doar perto de você</p>
      </div>

      <div className="px-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por endereço ou bairro..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <MapPlaceholder />
      </div>
    </div>
  );
};

export default Map;
