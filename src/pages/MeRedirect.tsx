/**
 * /me — opens the global Profile modal and bounces back to /home.
 * Reuses the existing ProfileModalContext + ProfilePage overlay.
 */
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useProfileModal } from '@/contexts/ProfileModalContext';

export default function MeRedirect() {
  const { openProfile } = useProfileModal();
  useEffect(() => { openProfile(); }, [openProfile]);
  return <Navigate to="/home" replace />;
}
