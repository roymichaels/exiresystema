/**
 * FloatingAdvisorWidget — floating chat widget for the advisor.
 *
 * Desktop: fixed drawer on right side, below header
 * Mobile: full-screen overlay, covers app header completely
 * Resembles a typical chat bubble/fab with message icon
 * Click/tap to open/close the chat panel
 */
import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
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
            "fixed z-[94] bottom-[100px] right-4 w-14 h-14 rounded-full",
            "shadow-lg hover:shadow-xl",
            "bg-primary text-primary-foreground",
            "flex items-center justify-center",
            "transition-all duration-300 ease-out",
            "hover:scale-105 active:scale-95"
          )}
          aria-label="Open Advisor Chat"
        >
          <MessageSquare className="w-6 h-6" />
          
          {/* Unread indicator */}
          <div className="absolute -top-1 -right-1">
            <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium text-[10px]">
              1
            </div>
          </div>
        </button>
      )}

      {/* Expanded Chat Panel */}
      {isOpen && (
        <div 
          className={cn(
            "fixed z-[9999] flex flex-col overflow-hidden",
            isMobile
              ? "inset-0 border-0 rounded-none" // Full-screen overlay on mobile
              : "top-[88px] right-4 bottom-6 w-[384px] max-h-[calc(100dvh-112px)] rounded-2xl border border-border/40" // Desktop drawer
          )}
          style={{ backgroundColor: 'hsl(var(--background))', minHeight: '100dvh' }}
        >
          {/* Close button only (no English header) */}
          <div className="px-4 py-3 flex items-center justify-end flex-shrink-0">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              aria-label="Close Advisor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat Panel - uses existing Hebrew header from AdvisorPanel */}
          <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'hsl(var(--background))' }}>
            <AdvisorPanel 
              variant="widget"
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAdvisorWidget;
