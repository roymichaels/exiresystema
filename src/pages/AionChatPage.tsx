/**
 * AionChatPage — dedicated shareable URL for the lead-capture intake.
 * Route: /aion-chat (alias /aion)
 * Renders the IntakeChatModal full-screen so the link can be shared
 * (WhatsApp, Instagram bio, ads, etc.).
 */
import { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';

const IntakeChatModal = lazy(
  () => import('@/components/landing/mindhacker/intake/IntakeChatModal'),
);

import '@/components/landing/mindhacker/theme.css';

export default function AionChatPage() {
  const navigate = useNavigate();

  const close = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="mindhacker-theme min-h-screen bg-[hsl(var(--mh-bg))]">
      <Suspense fallback={null}>
        <IntakeChatModal
          open={true}
          onOpenChange={(o) => {
            if (!o) close();
          }}
        />
      </Suspense>
    </div>
  );
}
