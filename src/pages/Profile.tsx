import { useState, useRef } from "react";
import { Heart, Award, Calendar, Settings as SettingsIcon, LogOut, ChevronRight, Bell, HelpCircle, Camera, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const url = `${publicUrl}?t=${Date.now()}`;

      await supabase.auth.updateUser({ data: { avatar_url: url } });
      await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);

      setAvatarUrl(url);
      toast({ title: "Foto atualizada!", description: "Sua foto de perfil foi salva." });
    } catch (error: any) {
      toast({ title: "Erro ao enviar foto", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Usuário";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative h-16 w-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl font-display font-bold text-primary-foreground border-2 border-primary-foreground/30 overflow-hidden group"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </button>
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
            { icon: SettingsIcon, label: "Configurações", action: () => navigate("/configuracoes") },
            { icon: HelpCircle, label: "Ajuda e Suporte", action: () => navigate("/ajuda") },
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
