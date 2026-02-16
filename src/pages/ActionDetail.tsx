import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.png";
import campanhaAgasalho from "@/assets/campanha-agasalho.jpeg";

const actionsData: Record<string, {
  title: string;
  description: string;
  fullDescription: string;
  date: string;
  volunteers: number;
  image: string;
  category: string;
  location: string;
  time: string;
}> = {
  "campanha-do-agasalho": {
    title: "Campanha do Agasalho 2026",
    description: "Distribuição de cobertores e roupas de inverno para comunidades carentes da zona sul.",
    fullDescription: "A Campanha do Agasalho 2026 tem como objetivo arrecadar e distribuir cobertores, roupas de inverno e itens de aquecimento para famílias em situação de vulnerabilidade na zona sul da cidade. Contamos com a colaboração de voluntários para a coleta, triagem e distribuição dos itens. Participe e ajude a aquecer quem mais precisa!",
    date: "15 Fev 2026",
    volunteers: 45,
    image: campanhaAgasalho,
    category: "Alimentação",
    location: "Centro Comunitário Zona Sul",
    time: "09:00 - 17:00",
  },
  "reforco-escolar-comunitario": {
    title: "Reforço Escolar Comunitário",
    description: "Aulas de reforço gratuitas para crianças do ensino fundamental nas escolas públicas.",
    fullDescription: "O programa de Reforço Escolar Comunitário oferece aulas gratuitas de português, matemática e ciências para crianças do ensino fundamental. As aulas acontecem nas escolas públicas parceiras, com voluntários capacitados para auxiliar no aprendizado. Nosso objetivo é reduzir a defasagem escolar e promover o desenvolvimento educacional das crianças da comunidade.",
    date: "20 Fev 2026",
    volunteers: 20,
    image: heroBanner,
    category: "Educação",
    location: "Escola Municipal Dom Pedro II",
    time: "14:00 - 17:00",
  },
  "mutirao-de-limpeza-do-rio": {
    title: "Mutirão de Limpeza do Rio",
    description: "Limpeza e revitalização das margens do rio com plantio de mudas nativas.",
    fullDescription: "O Mutirão de Limpeza do Rio é uma ação ambiental que reúne voluntários para a remoção de resíduos sólidos das margens do rio, além do plantio de mudas nativas para revitalização da área. A ação inclui palestras sobre educação ambiental e a importância da preservação dos recursos hídricos. Traga luvas e disposição para fazer a diferença!",
    date: "22 Fev 2026",
    volunteers: 60,
    image: heroBanner,
    category: "Meio Ambiente",
    location: "Margem do Rio Tietê - Ponto 3",
    time: "07:00 - 12:00",
  },
  "atendimento-medico-solidario": {
    title: "Atendimento Médico Solidário",
    description: "Consultas médicas gratuitas para comunidades sem acesso ao posto de saúde.",
    fullDescription: "O Atendimento Médico Solidário leva consultas médicas gratuitas para comunidades que não têm acesso fácil a postos de saúde. Contamos com médicos voluntários de diversas especialidades, além de enfermeiros e agentes de saúde. São oferecidas consultas de clínica geral, pediatria, aferição de pressão e orientações de saúde preventiva.",
    date: "28 Fev 2026",
    volunteers: 15,
    image: heroBanner,
    category: "Saúde",
    location: "Praça Central da Vila Nova",
    time: "08:00 - 16:00",
  },
};

const categoryColors: Record<string, string> = {
  "Alimentação": "bg-accent text-accent-foreground",
  "Educação": "bg-primary text-primary-foreground",
  "Meio Ambiente": "bg-secondary text-secondary-foreground",
  "Saúde": "bg-destructive text-destructive-foreground",
};

const ActionDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const action = slug ? actionsData[slug] : null;

  if (!action) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-24">
        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Ação não encontrada</h1>
          <Button variant="outline" onClick={() => navigate("/")}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-64 overflow-hidden">
        <img src={action.image} alt={action.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white rounded-full p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[action.category] || "bg-muted text-muted-foreground"}`}>
            {action.category}
          </span>
          <h1 className="font-display text-2xl font-bold text-white leading-tight mt-2">
            {action.title}
          </h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium">Data</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{action.date}</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Horário</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{action.time}</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 text-primary mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium">Local</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{action.location}</p>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Voluntários</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{action.volunteers} confirmados</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-2">Sobre a ação</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{action.fullDescription}</p>
        </div>

        {/* CTA */}
        <Button className="w-full" size="lg">
          Quero participar
        </Button>
      </div>
    </div>
  );
};

export default ActionDetail;
