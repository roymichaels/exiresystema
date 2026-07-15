/**
 * FloatingAdvisorWidget — unified floating chat bubble.
 *
 * Merged from the former BugReportWidget + AdvisorWidget:
 *  - Bubble-style FAB with animated prompt tooltip (BugReport style)
 *  - Opens the Business Advisor chat (AdvisorPanel)
 */
import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import AdvisorPanel from './AdvisorPanel';
import { cn } from '@/lib/utils';

const PROMPT_DISMISSED_KEY = 'advisor-prompt-dismissed-v1';

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
  const [showPrompt, setShowPrompt] = useState(false);
  const { language } = useTranslation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const wasDismissed = localStorage.getItem(PROMPT_DISMISSED_KEY);
    if (!wasDismissed) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (showPrompt) {
      const timer = setTimeout(() => setShowPrompt(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showPrompt]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setShowPrompt(false);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(PROMPT_DISMISSED_KEY, 'true');
  }, []);

  const promptText =
    language === 'he'
      ? 'שאל את המוח העסקי'
      : language === 'es'
        ? 'Pregunta al asesor'
        : 'Ask the Business Advisor';

  return (
    <div className="fixed end-4 bottom-[calc(72px+1rem)] z-[61] flex flex-col items-end">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'mb-3 overflow-hidden rounded-2xl',
              'bg-card/95 backdrop-blur-xl border border-border/50',
              'shadow-2xl shadow-black/20 dark:shadow-black/40',
              'flex flex-col',
              isMobile
                ? 'w-[min(92vw,420px)] h-[72dvh] max-h-[680px]'
                : 'w-[380px] max-w-[400px] h-[560px] max-h-[640px]',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-border/50">
              <span className="text-sm font-semibold text-foreground">
                {language === 'he' ? 'המוח העסקי' : language === 'es' ? 'Asesor' : 'Business Advisor'}
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 min-h-0 overflow-hidden p-2">
              <AdvisorPanel variant="widget" onClose={handleClose} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompt Bubble */}
      <AnimatePresence>
        {showPrompt && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className={cn(
              'mb-2 flex items-center gap-2',
              'bg-background/95 backdrop-blur-xl',
              'border border-border rounded-lg px-3 py-2',
              'shadow-lg max-w-[220px]',
            )}
          >
            <p className="text-xs text-foreground leading-tight">{promptText}</p>
            <button
              type="button"
              onClick={dismissPrompt}
              className="p-0.5 rounded-full hover:bg-muted transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={isOpen ? handleClose : handleOpen}
        className={cn(
          'relative p-3.5 rounded-full',
          'bg-gradient-to-br from-primary to-primary/80',
          'text-primary-foreground',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        aria-label="Open Advisor Chat"
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </motion.button>
    </div>
  );
};

export default FloatingAdvisorWidget;
