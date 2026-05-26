GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_video_access TO authenticated;
GRANT ALL ON public.user_video_access TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_audio_access TO authenticated;
GRANT ALL ON public.user_audio_access TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hypnosis_videos TO authenticated;
GRANT ALL ON public.hypnosis_videos TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hypnosis_audios TO authenticated;
GRANT ALL ON public.hypnosis_audios TO service_role;