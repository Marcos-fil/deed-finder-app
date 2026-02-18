import { useState, useEffect } from "react";
import { ArrowLeft, Sun, Moon, Volume2, Type, Maximize } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains("dark"));
  const [volume, setVolume] = useState(() => Number(localStorage.getItem("app-volume") ?? 80));
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("app-font-size") ?? "medium");
  const [dimensions, setDimensions] = useState(() => localStorage.getItem("app-dimensions") ?? "default");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("app-dark-mode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("app-volume", String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("app-font-size", fontSize);
    const root = document.documentElement;
    const sizes: Record<string, string> = { small: "14px", medium: "16px", large: "18px", "extra-large": "20px" };
    root.style.fontSize = sizes[fontSize] || "16px";
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("app-dimensions", dimensions);
  }, [dimensions]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="gradient-primary px-5 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-primary-foreground">Configurações</h1>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Tema */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-1">
            {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <h3 className="font-semibold text-sm text-foreground">Tema</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 ml-8">Alternar entre tema claro e escuro</p>
          <div className="flex items-center justify-between ml-8">
            <span className="text-sm text-foreground">{darkMode ? "Escuro" : "Claro"}</span>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </div>

        {/* Volume */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-1">
            <Volume2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Volume Geral</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 ml-8">Ajuste o volume das notificações</p>
          <div className="ml-8 flex items-center gap-3">
            <Slider
              value={[volume]}
              onValueChange={(v) => setVolume(v[0])}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-10 text-right">{volume}%</span>
          </div>
        </div>

        {/* Tamanho da Fonte */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-1">
            <Type className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Tamanho da Fonte</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 ml-8">Escolha o tamanho de texto preferido</p>
          <div className="ml-8">
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="extra-large">Extra Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Dimensões */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3 mb-1">
            <Maximize className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">Dimensões</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 ml-8">Ajuste a densidade visual do app</p>
          <div className="ml-8">
            <Select value={dimensions} onValueChange={setDimensions}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="comfortable">Confortável</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
