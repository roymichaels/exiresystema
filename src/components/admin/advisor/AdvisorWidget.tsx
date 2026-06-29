/**
 * FloatingAdvisorWidget — lightweight chat widget for the advisor.
 *
 * Closed: floating bubble bottom-right (52–56px desktop, 48–52px mobile)
 * Open (desktop): floating chat window above bubble, 360–400px wide, 520–640px max height
 * Open (mobile): bottom sheet, 72dvh height, top corners rounded 24px
 * Z-index above page content but doesn't block entire screen on desktop
 */
import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import AdvisorPanel from './AdvisorPanel';
import { cn } from '@/lib/utils';

const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
};

const FloatingAdvisorWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {/* Floating Button - Launcher (visible only when closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed z-[61] bottom-[calc(72px+1rem)] right-4 rounded-full",
            "shadow-lg hover:shadow-xl",
            "bg-primary text-primary-foreground",
            "flex items-center justify-center",
            "transition-all duration-300 ease-out",
            "hover:scale-105 active:scale-95",
            "w-13 h-13 md:w-14 md:h-14"
          )}
          aria-label="Open Advisor Chat"
        >
          <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "fixed z-[61] flex flex-col overflow-hidden",
            "bg-card/95 backdrop-blur-xl",
            "border border-border/50 shadow-2xl",
            isMobile
              ? "inset-x-3 bottom-[calc(72px+1rem)] max-w-[420px] h-[72dvh] max-h-[680px] rounded-t-2xl"
              : "bottom-28 right-4 w-[380px] max-w-[400px] h-[560px] max-h-[640px] rounded-2xl"
          )}
        >
          <AdvisorPanel 
            variant="widget"
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default FloatingAdvisorWidget;