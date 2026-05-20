import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import MindHackerLanding from "@/components/landing/mindhacker/MindHackerLanding";

const Index = () => {
  const { user, loading } = useAuth();

  useSEO({
    title: "Exire Systema — תהליך לבנייה מחדש של התודעה",
    description:
      "Exire Systema — תהליך אישי לפירוק התכנות התת־מודע ובנייה מחדש של זהות. למי שמוכן לכתוב את עצמו מחדש.",
    keywords: "Exire Systema, תודעה, תת מודע, היפנוזה, זהות, Shadow Work, ריבונות פנימית",
    type: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Exire Systema",
        description:
          "תהליך אישי לבנייה מחדש של התודעה — פירוק דפוסים, ריבונות פנימית, וזהות נכתבת מחדש.",
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
