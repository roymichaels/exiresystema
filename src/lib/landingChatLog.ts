/**
 * Fire-and-forget logger for landing-page chat transcripts.
 * Writes to `landing_chat_messages` so admins can review abandoned
 * conversations even when the AI never reaches the `save_lead` tool.
 */
import { supabase } from '@/integrations/supabase/client';
import { getSessionId } from '@/lib/analytics';

export type LandingChatSource = 'intake_chat' | 'aion_landing_chat';
export type LandingChatRole = 'user' | 'assistant' | 'system' | 'tool';

export function logLandingChatMessage(
  source: LandingChatSource,
  role: LandingChatRole,
  content: string,
  language?: string,
): void {
  if (!content || !content.trim()) return;
  try {
    void supabase.from('landing_chat_messages').insert({
      session_id: getSessionId(),
      source,
      role,
      content: content.slice(0, 8000),
      language,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    });
  } catch (err) {
    // Never block UX on a logging failure.
    console.debug('landingChatLog: insert failed', err);
  }
}
