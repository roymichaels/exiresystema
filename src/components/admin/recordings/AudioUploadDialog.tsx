import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { debug } from "@/lib/debug";
import { Loader2, Upload } from "lucide-react";
import { fileToMp3 } from "@/lib/videoToAudio";

interface AudioUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAudio?: {
    id: string;
    title: string;
    description: string | null;
    file_path: string;
    duration_seconds: number | null;
  } | null;
}

export const AudioUploadDialog = ({
  open,
  onOpenChange,
  editingAudio,
}: AudioUploadDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingAudio) {
      setTitle(editingAudio.title);
      setDescription(editingAudio.description || "");
    } else {
      setTitle("");
      setDescription("");
      setFile(null);
    }
  }, [editingAudio, open]);

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      file_path: string;
      duration_seconds: number | null;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("hypnosis_audios").insert({
        ...data,
        created_by: user.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hypnosis-audios"] });
      toast({ title: t("admin.recordingsPage.audioUploaded") });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: t("admin.recordingsPage.audioUploadError"), variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { title: string; description: string }) => {
      if (!editingAudio) return;
      const { error } = await supabase
        .from("hypnosis_audios")
        .update(data)
        .eq("id", editingAudio.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hypnosis-audios"] });
      toast({ title: t("admin.recordingsPage.audioUpdated") });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: t("admin.recordingsPage.audioUpdateError"), variant: "destructive" });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAudio) {
      updateMutation.mutate({ title, description });
      return;
    }

    if (!file) {
      toast({ title: t("admin.recordingsPage.selectAudioFile"), variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const isVideo = file.type.startsWith("video/");
      const isMp3 =
        file.type === "audio/mpeg" || /\.mp3$/i.test(file.name);
      let uploadFile: Blob = file;
      let duration: number | null = null;

      // Convert anything that is not already an MP3 (video or other audio) to MP3
      if (isVideo || !isMp3) {
        setConverting(true);
        setConvertProgress(0);
        try {
          const { blob, durationSeconds } = await fileToMp3(file, setConvertProgress);
          uploadFile = blob;
          duration = durationSeconds;
        } catch (err: unknown) {
          debug.log("→MP3 conversion failed", err);
          toast({
            title: "המרה ל-MP3 נכשלה",
            description: err instanceof Error ? err.message : String(err),
            variant: "destructive",
          });
          setConverting(false);
          setUploading(false);
          return;
        }
        setConverting(false);
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`;

      const { error: uploadError } = await supabase.storage
        .from("hypnosis-audios")
        .upload(fileName, uploadFile, { contentType: "audio/mpeg" });

      if (uploadError) throw uploadError;

      if (duration === null) {
        try {
          const audio = document.createElement("audio");
          audio.src = URL.createObjectURL(uploadFile);
          await new Promise<void>((resolve) => {
            audio.onloadedmetadata = () => {
              duration = Math.round(audio.duration);
              resolve();
            };
            audio.onerror = () => resolve();
          });
        } catch {
          debug.log("Could not get audio duration");
        }
      }

      createMutation.mutate({
        title,
        description,
        file_path: fileName,
        duration_seconds: duration,
      });
    } catch (err: unknown) {
      toast({
        title: t("admin.recordingsPage.audioUploadError"),
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const isLoading = uploading || converting || createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingAudio ? "עריכת הקלטה" : "העלאת הקלטה חדשה"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">כותרת</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="הקלטת הרפיה מותאמת אישית"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור (אופציונלי)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תיאור קצר של ההקלטה..."
              rows={3}
            />
          </div>

          {!editingAudio && (
            <div className="space-y-2">
              <Label htmlFor="file">קובץ אודיו או וידאו</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="file"
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  {file ? (
                    <p className="text-sm font-medium">{file.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      לחץ לבחירת קובץ או גרור לכאן
                    </p>
                  )}
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                אודיו: MP3, WAV, M4A, OGG · וידאו: MP4, MOV, WEBM (יומר אוטומטית ל-MP3)
              </p>
              {converting && (
                <p className="text-xs text-primary">
                  ממיר ל-MP3... {Math.round(convertProgress)}%
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
              {editingAudio ? "שמור שינויים" : "העלה הקלטה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
