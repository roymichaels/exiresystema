import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users } from "lucide-react";
import LeadsCRM from "@/components/crm/LeadsCRM";
import LandingChatTranscripts from "@/components/admin/leads/LandingChatTranscripts";

const Leads = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="crm">
        <TabsList className="glass-panel">
          <TabsTrigger value="crm" className="gap-2">
            <Users className="h-4 w-4" />
            CRM
          </TabsTrigger>
          <TabsTrigger value="transcripts" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            תמלילי שיחות
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
