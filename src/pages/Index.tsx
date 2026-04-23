import { Heart, TrendingUp, Users } from "lucide-react";
import ActionCard from "@/components/ActionCard";
import heroBanner from "@/assets/hero-banner.png";
import campanhaAgasalho from "@/assets/campanha-agasalho.jpeg";
import { useSiteContent } from "@/hooks/useSiteContent";
import { toEmbedUrl } from "@/lib/siteContent";

const actions = [
  {
    title: "Campanha do Agasalho 2026",
    description: "Distribuição de cobertores e roupas de inverno para comunidades carentes da zona sul.",
    date: "15 Fev",
    volunteers: 45,
    image: campanhaAgasalho,
    category: "Alimentação",
    slug: "campanha-do-agasalho",
  },
  {
    title: "Reforço Escolar Comunitário",
    description: "Aulas de reforço gratuitas para crianças do ensino fundamental nas escolas públicas.",
    date: "20 Fev",
    volunteers: 20,
    image: heroBanner,
    category: "Educação",
    slug: "reforco-escolar-comunitario",
  },
  {
    title: "Mutirão de Limpeza do Rio",
    description: "Limpeza e revitalização das margens do rio com plantio de mudas nativas.",
    date: "22 Fev",
    volunteers: 60,
    image: heroBanner,
    category: "Meio Ambiente",
    slug: "mutirao-de-limpeza-do-rio",
  },
  {
    title: "Atendimento Médico Solidário",
    description: "Consultas médicas gratuitas para comunidades sem acesso ao posto de saúde.",
    date: "28 Fev",
    volunteers: 15,
    image: heroBanner,
    category: "Saúde",
    slug: "atendimento-medico-solidario",
  },
];

const Index = () => {
  const { get } = useSiteContent();

  const stats = [
    { label: get("home_stats", "stat1_label"), value: get("home_stats", "stat1_value"), icon: Heart },
    { label: get("home_stats", "stat2_label"), value: get("home_stats", "stat2_value"), icon: Users },
    { label: get("home_stats", "stat3_label"), value: get("home_stats", "stat3_value"), icon: TrendingUp },
  ];

  const heroImage = get("home_hero", "image") || heroBanner;
  const videoUrl = toEmbedUrl(get("home_documentary", "video_url"));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        <img src={heroImage} alt="Voluntários em ação" className="h-full w-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-primary-foreground/80 text-xs font-medium tracking-wide uppercase mb-1">
            {get("home_hero", "eyebrow")}
          </p>
          <h1 className="font-display text-2xl font-bold text-primary-foreground leading-tight whitespace-pre-line">
            {get("home_hero", "title")}
          </h1>
        </div>
      </div>

      <div className="px-4 -mt-5 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card rounded-xl p-3 text-center shadow-sm border border-border animate-scale-in">
              <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-display text-lg font-bold text-foreground">{value}</p>
              <p className="text-[0.6rem] text-muted-foreground leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Documentário */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">
            {get("home_documentary", "section_title")}
          </h2>
          <div className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
            {videoUrl && (
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title="Documentário Institucional"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <div className="p-3">
              <p className="text-sm text-muted-foreground">{get("home_documentary", "description")}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl font-semibold text-foreground">
            {get("home_actions_header", "title")}
          </h2>
          <span className="text-xs text-primary font-medium">{get("home_actions_header", "link_label")}</span>
        </div>
        <div className="space-y-4">
          {actions.map((action) => <ActionCard key={action.title} {...action} />)}
        </div>
      </div>
    </div>
  );
};

export default Index;
