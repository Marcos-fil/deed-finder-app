import { Heart, Award, Calendar, Settings, LogOut, ChevronRight, Bell, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Usuário";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-10">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl font-display font-bold text-primary-foreground border-2 border-primary-foreground/30">
            {initials}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-primary-foreground">{displayName}</h1>
            <p className="text-primary-foreground/70 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-5 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { icon: Heart, label: "Doações", value: "0" },
            { icon: Calendar, label: "Ações", value: "0" },
            { icon: Award, label: "Horas Vol.", value: "0" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-card rounded-xl p-3.5 text-center shadow-sm border border-border">
              <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="font-display text-xl font-bold text-foreground">{value}</p>
              <p className="text-[0.65rem] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-card rounded-xl p-4 border border-border mb-4">
          <h3 className="font-semibold text-sm text-foreground mb-3">Conquistas</h3>
          <div className="flex gap-3">
            {["🌱", "💚", "⭐", "🏆", "🎯"].map((emoji, i) => (
              <div
                key={i}
                className={`h-10 w-10 rounded-full flex items-center justify-center text-lg ${
                  i < 1 ? "bg-secondary" : "bg-muted opacity-40"
                }`}
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {[
            { icon: Bell, label: "Notificações", action: () => {} },
            { icon: Settings, label: "Configurações", action: () => {} },
            { icon: HelpCircle, label: "Ajuda e Suporte", action: () => {} },
            { icon: LogOut, label: "Sair", danger: true, action: handleSignOut },
          ].map(({ icon: Icon, label, danger, action }, i, arr) => (
            <button
              key={label}
              onClick={action}
              className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 ${
                i < arr.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
              <span className={`flex-1 text-sm text-left ${danger ? "text-destructive" : "text-foreground"}`}>
                {label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
