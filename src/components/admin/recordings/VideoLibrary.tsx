import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Video, Clock, Calendar, Play, UserPlus, Link, Check, Headphones, Loader2, Download } from "lucide-react";

import { VideoUploadDialog } from "./VideoUploadDialog";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignVideoDialog } from "./AssignVideoDialog";

interface HypnosisVideo {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  duration_seconds: number | null;
  created_at: string;
}

export const VideoLibrary = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsUploadOpen(true);
    window.addEventListener("admin:open-video-upload", handler);
    return () => window.removeEventListener("admin:open-video-upload", handler);
  }, []);
  const [editingVideo, setEditingVideo] = useState<HypnosisVideo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<HypnosisVideo | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [assigningVideoId, setAssigningVideoId] = useState<string | null>(null);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);
  const [generatingLinkFor, setGeneratingLinkFor] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convertProgress, setConvertProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos, isLoading } = useQuery({
    queryKey: ["hypnosis-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hypnosis_videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HypnosisVideo[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const video = videos?.find((v) => v.id === id);
      if (video?.file_path) {
        await supabase.storage.from("hypnosis-videos").remove([video.file_path]);
      }
      const { error } = await supabase.from("hypnosis_videos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hypnosis-videos"] });
      toast({ title: "הסרטון נמחק בהצלחה" });
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: "שגיאה במחיקת הסרטון", variant: "destructive" });
    },
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "לא ידוע";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayVideo = async (video: HypnosisVideo) => {
    try {
      const { data, error } = await supabase.storage
        .from("hypnosis-videos")
        .createSignedUrl(video.file_path, 3600);
      
      if (error) throw error;
      
      setPlayingVideo(video);
      setVideoUrl(data.signedUrl);
    } catch (err) {
      toast({ title: "שגיאה בטעינת הסרטון", variant: "destructive" });
    }
  };

  // Generate a shareable link without assigning to a specific user
  const generateQuickLink = async (videoId: string) => {
    setGeneratingLinkFor(videoId);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) {
        toast({ title: "יש להתחבר תחילה", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase
        .from("user_video_access")
        .insert({
          video_id: videoId,
          user_id: null,
          granted_by: user.user.id,
          notes: "קישור מהיר",
        })
        .select("access_token")
        .single();

      if (error) {
        console.error("[VideoLibrary] create link error:", error);
        toast({
          title: "שגיאה ביצירת קישור",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const link = `${window.location.origin}/video/${data.access_token}`;
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        prompt("העתק את הקישור:", link);
      }
      setCopiedVideoId(videoId);
      toast({ title: "הקישור הועתק ללוח! 🔗" });
      setTimeout(() => setCopiedVideoId(null), 2000);
    } catch (err: unknown) {
      console.error("[VideoLibrary] create link exception:", err);
      toast({
        title: "שגיאה ביצירת קישור",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setGeneratingLinkFor(null);
    }
  };

  const convertToAudio = async (video: HypnosisVideo) => {
    setConvertingId(video.id);
    setConvertProgress(0);
    try {
      const { data: signed, error: signErr } = await supabase.storage
        .from("hypnosis-videos")
        .createSignedUrl(video.file_path, 3600);
      if (signErr || !signed) throw signErr || new Error("no url");

      toast({ title: "ממיר לאודיו... זה עשוי לקחת דקה", description: video.title });
      const { videoUrlToMp3 } = await import("@/lib/videoToAudio");
      const { blob: mp3Blob, durationSeconds } = await videoUrlToMp3(
        signed.signedUrl,
        (p) => setConvertProgress(p),
      );

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("not authenticated");

      const audioPath = `${userId}/${Date.now()}-${video.title.replace(/[^\w\u0590-\u05FF]+/g, "_")}.mp3`;
      const { error: upErr } = await supabase.storage
        .from("hypnosis-audios")
        .upload(audioPath, mp3Blob, { contentType: "audio/mpeg", upsert: false });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("hypnosis_audios").insert({
        title: video.title,
        description: video.description,
        file_path: audioPath,
        duration_seconds: durationSeconds,
        created_by: userId,
      });
      if (insErr) throw insErr;

      queryClient.invalidateQueries({ queryKey: ["hypnosis-audios"] });
      toast({ title: "ההמרה הושלמה ✓", description: "ההקלטה נוספה לספריית ההקלטות" });
    } catch (err: unknown) {
      console.error("[VideoLibrary] convert error:", err);
      toast({
        title: "שגיאה בהמרה",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setConvertingId(null);
      setConvertProgress(0);
    }
  };

  const closePlayer = () => {
    setPlayingVideo(null);
    setVideoUrl(null);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted/50" />
            <CardContent className="h-16 bg-muted/30" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">כל הסרטונים ({videos?.length || 0})</h2>
        <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          העלה סרטון חדש
        </Button>
      </div>

      {videos?.length === 0 ? (
        <Card className="p-12 text-center">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">אין סרטונים עדיין</h3>
          <p className="text-muted-foreground mt-2">העלה את הסרטון הראשון שלך</p>
          <Button onClick={() => setIsUploadOpen(true)} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            העלה סרטון
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos?.map((video) => (
            <Card key={video.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-start justify-between gap-2">
                  <span className="line-clamp-2">{video.title}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditingVideo(video)}
                      title="עריכה"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeletingId(video.id)}
                      title="מחיקה"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(video.duration_seconds)}
                  </span>
                  {video.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(video.created_at), "d MMM yyyy", { locale: he })}
                    </span>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handlePlayVideo(video)}
                  >
                    <Play className="h-4 w-4" />
                    צפה
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => generateQuickLink(video.id)}
                    disabled={generatingLinkFor === video.id}
                  >
                    {copiedVideoId === video.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Link className="h-4 w-4" />
                    )}
                    {copiedVideoId === video.id ? "הועתק!" : "העתק לינק"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2"
                    onClick={() => setAssigningVideoId(video.id)}
                    title="הקצה למשתמש ספציפי"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2"
                    onClick={() => convertToAudio(video)}
                    disabled={convertingId === video.id}
                    title="המר לקובץ אודיו"
                  >
                    {convertingId === video.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">{convertProgress}%</span>
                      </>
                    ) : (
                      <Headphones className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2"
                    onClick={async () => {
                      try {
                        const ext = video.file_path.split(".").pop() || "mp4";
                        const { data, error } = await supabase.storage
                          .from("hypnosis-videos")
                          .createSignedUrl(video.file_path, 60, { download: `${video.title}.${ext}` });
                        if (error || !data) throw error;
                        window.location.href = data.signedUrl;
                      } catch (e: unknown) {
                        toast({ title: "שגיאה בהורדה", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
                      }
                    }}
                    title="הורד קובץ"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={(open) => !open && closePlayer()}>
        <DialogContent dir="rtl" className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{playingVideo?.title}</DialogTitle>
          </DialogHeader>
          
          {videoUrl && (
            <div className="aspect-video w-full">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <VideoUploadDialog
        open={isUploadOpen || !!editingVideo}
        onOpenChange={(open) => {
          if (!open) {
            setIsUploadOpen(false);
            setEditingVideo(null);
          }
        }}
        editingVideo={editingVideo}
      />

      {/* Assign Video Dialog */}
      <AssignVideoDialog
        open={!!assigningVideoId}
        onOpenChange={(open) => !open && setAssigningVideoId(null)}
        preselectedVideoId={assigningVideoId}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>האם למחוק את הסרטון?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הסרטון לצמיתות ותבטל את הגישה לכל המשתמשים שהוקצו אליו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
