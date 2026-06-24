/**
 * AionChatPage — dedicated shareable URL for the AION landing chat.
 * Route: /aion-chat
 * Renders the same AionLandingChat used in the landing-page drawer,
 * but as a full-screen page so the link can be shared.
 */
import { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';

const AionLandingChat = lazy(
  () => import('@/components/landing/mindhacker/AionLandingChat'),
);

import '@/components/landing/mindhacker/theme.css';

export default function AionChatPage() {
  const navigate = useNavigate();

  const close = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const openIntake = () => {
    // Send the user back to the landing page where the intake modal lives.
    navigate('/?intake=1');
  };

  return (
    <div className="mindhacker-theme min-h-screen bg-[hsl(var(--mh-bg))]">
      <Suspense fallback={null}>
        <AionLandingChat
          open={true}
          onOpenChange={(o) => {
            if (!o) close();
          }}
          onOpenIntake={openIntake}
        />
      </Suspense>
    </div>
  );
}
