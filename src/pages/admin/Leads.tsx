import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users } from "lucide-react";
import LeadsCRM from "@/components/crm/LeadsCRM";
import LandingChatTranscripts from "@/components/admin/leads/LandingChatTranscripts";
import { useTranslation } from "@/hooks/useTranslation";

const Leads = () => {
  const { language } = useTranslation();

  const t = (he: string, en: string, es: string) => language === 'he' ? he : language === 'es' ? es : en;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Tabs defaultValue="crm">
        <TabsList className="glass-panel">
          <TabsTrigger value="crm" className="gap-2">
            <Users className="h-4 w-4" />
            {t('CRM', 'CRM', 'CRM')}
          </TabsTrigger>
          <TabsTrigger value="transcripts" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('תמלילי שיחות', 'Transcripts', 'Transcripciones')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="crm" className="mt-4">
          <LeadsCRM scope="admin" />
        </TabsContent>
        <TabsContent value="transcripts" className="mt-4">
          <LandingChatTranscripts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leads;
