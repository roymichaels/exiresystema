import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import MindHackerLanding from "@/components/landing/mindhacker/MindHackerLanding";

const Index = () => {
  const { user, loading } = useAuth();

  useSEO({
    title: "מיינד האקר — אדריכל תודעה ואסטרטג זהות",
    description:
      "Exire Systema — מערכת לפירוק התכנות התת־מודע ובנייה מחדש של זהות. למי שמוכן לכתוב את עצמו מחדש.",
    keywords: "תודעה, תת מודע, היפנוזה, זהות, Shadow Work, ריבונות פנימית, מיינד האקר",
    type: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "מיינד האקר",
        jobTitle: "אדריכל תודעה ואסטרטג זהות תת־מודעת",
        description:
          "עבודה עם התת־מודע כקוד — זיהוי דפוסים, פירוק זהויות ישנות, ובניית ריבונות פנימית.",
      },
    ],
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border border-white/20 border-t-white/80" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/now" replace />;
  }

  return <MindHackerLanding />;
};

export default Index;
