import { Calendar, Users } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  date: string;
  volunteers: number;
  image: string;
  category: string;
}

const categoryColors: Record<string, string> = {
  "Alimentação": "bg-accent text-accent-foreground",
  "Educação": "bg-primary text-primary-foreground",
  "Meio Ambiente": "bg-secondary text-secondary-foreground",
  "Saúde": "bg-destructive text-destructive-foreground"
};

const ActionCard = ({ title, description, date, volunteers, image, category }: ActionCardProps) => {
  return (
    <div className="group overflow-hidden rounded-xl bg-card shadow-sm border border-border transition-all hover:shadow-md animate-fade-in-up">
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105 border-4 object-cover" />

        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[category] || "bg-muted text-muted-foreground"}`}>
            {category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground leading-tight mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {volunteers} voluntários
          </span>
        </div>
      </div>
    </div>);

};

export default ActionCard;