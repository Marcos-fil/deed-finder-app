import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2000);
    const finish = setTimeout(onFinish, 2600);
    return () => { clearTimeout(timer); clearTimeout(finish); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <div className="animate-pulse mb-6">
        <Heart className="w-20 h-20 text-primary-foreground" fill="currentColor" />
      </div>
      <h1 className="text-3xl font-bold text-primary-foreground font-serif tracking-wide">
        Missão Vida
      </h1>
      <p className="text-primary-foreground/70 text-sm mt-2">Transformando vidas juntos</p>
      <div className="mt-8 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-primary-foreground/60 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
