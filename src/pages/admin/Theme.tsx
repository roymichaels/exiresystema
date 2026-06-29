import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useThemeSettings, useThemePresets, updateThemeSetting, applyThemePreset, clearThemeCache, ThemePreset } from "@/hooks/useThemeSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Sparkles, Image, Globe, Check, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";

const Theme = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const { theme, loading: themeLoading, refetch } = useThemeSettings();
  const { presets, loading: presetsLoading } = useThemePresets();
  
  const [localTheme, setLocalTheme] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);

  useEffect(() => {
    setLocalTheme(theme);
  }, [theme]);

  const handleChange = (key: string, value: string | boolean) => {
    setLocalTheme(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(localTheme).map(([key, value]) => 
        updateThemeSetting(key, String(value))
      );
      await Promise.all(updates);
      clearThemeCache();
      await refetch();
      toast.success(language === 'he' ? 'הנושא נשמר בהצלחה' : language === 'es' ? 'Tema guardado exitosamente' : 'Theme saved successfully');
    } catch (error) {
      console.error("Error saving theme:", error);
      toast.error(language === 'he' ? 'שגיאה בשמירת הנושא' : language === 'es' ? 'Error al guardar el tema' : 'Error saving theme');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPreset = async (preset: ThemePreset) => {
    setApplyingPreset(preset.id);
    try {
      await applyThemePreset(preset);
      clearThemeCache();
      await refetch();
      toast.success(language === 'he' ? `נושא "${preset.name}" הוחל בהצלחה` : language === 'es' ? `Tema "${preset.name_en || preset.name}" aplicado exitosamente` : `Theme "${preset.name_en || preset.name}" applied successfully`);
    } catch (error) {
      console.error("Error applying preset:", error);
      toast.error(language === 'he' ? 'שגיאה בהחלת הנושא' : language === 'es' ? 'Error al aplicar el tema' : 'Error applying theme');
    } finally {
      setApplyingPreset(null);
    }
  };

  const ColorInput = ({ label, hKey, sKey, lKey }: { label: string; hKey: string; sKey: string; lKey: string }) => {
    const h = (localTheme as any)[hKey] || "0";
    const s = (localTheme as any)[sKey] || "0%";
    const l = (localTheme as any)[lKey] || "0%";
    const color = `hsl(${h}, ${s}, ${l})`;
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg border-2 border-border shadow-inner"
            style={{ backgroundColor: color }}
          />
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">H</Label>
              <Input
                type="number"
                min="0"
                max="360"
                value={h}
                onChange={(e) => handleChange(hKey, e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">S</Label>
              <Input
                value={s}
                onChange={(e) => handleChange(sKey, e.target.value)}
                className="h-8"
                placeholder="100%"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">L</Label>
              <Input
                value={l}
                onChange={(e) => handleChange(lKey, e.target.value)}
                className="h-8"
                placeholder="50%"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (themeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'he' ? 'עיצוב ומיתוג' : language === 'es' ? 'Tema y Marca' : 'Theme & Branding'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'he' ? 'התאם את המראה והתחושה של האתר שלך' : language === 'es' ? 'Personaliza la apariencia de tu sitio' : 'Customize the look and feel of your site'}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          {language === 'he' ? 'שמור שינויים' : language === 'es' ? 'Guardar Cambios' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="presets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'he' ? 'ערכות נושא' : language === 'es' ? 'Ajustes predefinidos' : 'Presets'}</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'he' ? 'צבעים' : language === 'es' ? 'Colores' : 'Colors'}</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'he' ? 'טיפוגרפיה' : language === 'es' ? 'Tipografía' : 'Typography'}</span>
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'he' ? 'אפקטים' : language === 'es' ? 'Efectos' : 'Effects'}</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'he' ? 'מיתוג' : language === 'es' ? 'Marca' : 'Branding'}</span>
          </TabsTrigger>
        </TabsList>

        {/* Presets Tab */}
        <TabsContent value="presets">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'he' ? 'ערכות נושא מוכנות' : language === 'es' ? 'Ajustes predefinidos de tema' : 'Theme Presets'}</CardTitle>
              <CardDescription>
                {language === 'he' ? 'בחר ערכת נושא מוכנה להחלה מיידית' : language === 'es' ? 'Elige un tema predefinido para aplicación instantánea' : 'Choose a ready-made theme for instant application'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {presetsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presets.map((preset) => {
                    const colors = preset.colors as Record<string, string>;
                    const primaryColor = `hsl(${colors.primary_h}, ${colors.primary_s}, ${colors.primary_l})`;
                    const secondaryColor = `hsl(${colors.secondary_h}, ${colors.secondary_s}, ${colors.secondary_l})`;
                    const accentColor = `hsl(${colors.accent_h}, ${colors.accent_s}, ${colors.accent_l})`;
                    const bgColor = `hsl(${colors.background_h}, ${colors.background_s}, ${colors.background_l})`;
                    
                    return (
                      <Card 
                        key={preset.id} 
                        className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => handleApplyPreset(preset)}
                      >
                        <CardContent className="p-4">
                          <div 
                            className="h-24 rounded-lg mb-3 relative overflow-hidden"
                            style={{ backgroundColor: bgColor }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center gap-2">
                              <div 
                                className="w-8 h-8 rounded-full shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                              />
                              <div 
                                className="w-6 h-6 rounded-full shadow-lg"
                                style={{ backgroundColor: secondaryColor }}
                              />
                              <div 
                                className="w-5 h-5 rounded-full shadow-lg"
                                style={{ backgroundColor: accentColor }}
                              />
                            </div>
                            {applyingPreset === preset.id && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold">
                            {language === 'he' ? preset.name : language === 'es' ? (preset.name_es || preset.name_en || preset.name) : (preset.name_en || preset.name)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {language === 'he' ? preset.description : language === 'es' ? (preset.description_es || preset.description_en || preset.description) : (preset.description_en || preset.description)}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'he' ? 'פלטת צבעים' : language === 'es' ? 'Paleta de colores' : 'Color Palette'}</CardTitle>
              <CardDescription>
                {language === 'he' ? 'התאם את צבעי האתר שלך (HSL)' : language === 'es' ? 'Personaliza los colores de tu sitio (HSL)' : 'Customize your site colors (HSL)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorInput 
                label={language === 'he' ? 'צבע ראשי' : language === 'es' ? 'Color primario' : 'Primary Color'}
                hKey="primary_h"
                sKey="primary_s"
                lKey="primary_l"
              />
              <ColorInput 
                label={language === 'he' ? 'צבע משני' : language === 'es' ? 'Color secundario' : 'Secondary Color'}
                hKey="secondary_h"
                sKey="secondary_s"
                lKey="secondary_l"
              />
              <ColorInput 
                label={language === 'he' ? 'צבע הדגשה' : language === 'es' ? 'Color de acento' : 'Accent Color'}
                hKey="accent_h"
                sKey="accent_s"
                lKey="accent_l"
              />
              <ColorInput 
                label={language === 'he' ? 'צבע רקע' : language === 'es' ? 'Color de fondo' : 'Background Color'}
                hKey="background_h"
                sKey="background_s"
                lKey="background_l"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'he' ? 'טיפוגרפיה' : language === 'es' ? 'Tipografía' : 'Typography'}</CardTitle>
              <CardDescription>
                {language === 'he' ? 'בחר את הגופנים לאתר שלך' : language === 'es' ? 'Elige las fuentes para tu sitio' : 'Choose fonts for your site'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{language === 'he' ? 'גופן ראשי' : language === 'es' ? 'Fuente principal' : 'Primary Font'}</Label>
                <Input
                  value={localTheme.font_family_primary}
                  onChange={(e) => handleChange('font_family_primary', e.target.value)}
                  placeholder="Inter, sans-serif"
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'he' ? 'שם הגופן (למשל: Inter, Rubik, Assistant)' : language === 'es' ? 'Nombre de la fuente (ej: Inter, Rubik, Assistant)' : 'Font name (e.g., Inter, Rubik, Assistant)'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{language === 'he' ? 'גופן משני' : language === 'es' ? 'Fuente secundaria' : 'Secondary Font'}</Label>
                <Input
                  value={localTheme.font_family_secondary}
                  onChange={(e) => handleChange('font_family_secondary', e.target.value)}
                  placeholder="inherit"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'he' ? 'אפקטים ויזואליים' : language === 'es' ? 'Efectos visuales' : 'Visual Effects'}</CardTitle>
              <CardDescription>
                {language === 'he' ? 'הגדר אפקטים מיוחדים לאתר' : language === 'es' ? 'Configura efectos especiales para tu sitio' : 'Configure special effects for your site'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Theme Mode */}
              <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
                <Label className="text-base font-semibold">
                  {language === 'he' ? 'ערכת נושא ברירת מחדל' : language === 'es' ? 'Modo de tema predeterminado' : 'Default Theme Mode'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {language === 'he' ? 'בחר את ערכת הנושא שתוצג למשתמשים חדשים' : language === 'es' ? 'Elige el tema predeterminado para nuevos visitantes' : 'Choose the default theme for new visitors'}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('default_theme_mode', 'light')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      (localTheme as any).default_theme_mode === 'light' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                        <span className="text-2xl">☀️</span>
                      </div>
                      <p className="font-medium">{language === 'he' ? 'בהיר' : language === 'es' ? 'Claro' : 'Light'}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('default_theme_mode', 'dark')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      (localTheme as any).default_theme_mode === 'dark' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center">
                        <span className="text-2xl">🌙</span>
                      </div>
                      <p className="font-medium">{language === 'he' ? 'כהה' : language === 'es' ? 'Oscuro' : 'Dark'}</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Background Effect Selector */}
              <div className="space-y-2">
                <Label>{language === 'he' ? 'אפקט רקע' : language === 'es' ? 'Efecto de fondo' : 'Background Effect'}</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange('background_effect', 'none')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.background_effect === 'none' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded bg-muted flex items-center justify-center">
                        <span className="text-2xl">🚫</span>
                      </div>
                      <p className="font-medium">{language === 'he' ? 'ללא' : language === 'es' ? 'Ninguno' : 'None'}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'he' ? 'רקע נקי' : language === 'es' ? 'Fondo limpio' : 'Clean background'}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('background_effect', 'matrix_rain')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.background_effect === 'matrix_rain' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded bg-gradient-to-b from-primary/30 to-transparent flex items-center justify-center font-mono text-primary">
                        01
                      </div>
                      <p className="font-medium">{language === 'he' ? 'גשם מטריקס' : language === 'es' ? 'Lluvia Matrix' : 'Matrix Rain'}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'he' ? 'אפקט סייבר עברי' : language === 'es' ? 'Efecto cyber hebreo' : 'Hebrew cyber effect'}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('background_effect', 'consciousness_field')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.background_effect === 'consciousness_field' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center text-[#3d7a8c]">
                        ∞ ◌
                      </div>
                      <p className="font-medium">{language === 'he' ? 'שדה תודעתי' : language === 'es' ? 'Campo de conciencia' : 'Consciousness Field'}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'he' ? 'שקט ומרפא' : language === 'es' ? 'Calma y sanación' : 'Calm & healing'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Matrix Rain settings - only show when selected */}
              {localTheme.background_effect === 'matrix_rain' && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="text-primary font-mono">01</span>
                    {language === 'he' ? 'הגדרות גשם מטריקס' : language === 'es' ? 'Configuración de Lluvia Matrix' : 'Matrix Rain Settings'}
                  </h4>
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'צבע' : language === 'es' ? 'Color' : 'Color'}</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={localTheme.matrix_rain_color}
                        onChange={(e) => handleChange('matrix_rain_color', e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <Input
                        value={localTheme.matrix_rain_color}
                        onChange={(e) => handleChange('matrix_rain_color', e.target.value)}
                        placeholder="#00d4ff"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'שקיפות' : language === 'es' ? 'Opacidad' : 'Opacity'}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={localTheme.matrix_rain_opacity}
                      onChange={(e) => handleChange('matrix_rain_opacity', e.target.value)}
                      placeholder="0.15"
                    />
                  </div>
                </div>
              )}

              {/* Consciousness Field settings - only show when selected */}
              {localTheme.background_effect === 'consciousness_field' && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <h4 className="font-medium flex items-center gap-2">
                    <span className="text-[#3d7a8c]">∞</span>
                    {language === 'he' ? 'הגדרות שדה תודעתי' : language === 'es' ? 'Configuración de Campo de Conciencia' : 'Consciousness Field Settings'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'צבע רקע עמוק' : language === 'es' ? 'Color de fondo profundo' : 'Deep Background Color'}</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={localTheme.consciousness_field_primary_color}
                          onChange={(e) => handleChange('consciousness_field_primary_color', e.target.value)}
                          className="w-12 h-12 rounded cursor-pointer"
                        />
                        <Input
                          value={localTheme.consciousness_field_primary_color}
                          onChange={(e) => handleChange('consciousness_field_primary_color', e.target.value)}
                          placeholder="#0a1628"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'צבע הילה' : language === 'es' ? 'Color de resplandor' : 'Accent Glow Color'}</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={localTheme.consciousness_field_accent_color}
                          onChange={(e) => handleChange('consciousness_field_accent_color', e.target.value)}
                          className="w-12 h-12 rounded cursor-pointer"
                        />
                        <Input
                          value={localTheme.consciousness_field_accent_color}
                          onChange={(e) => handleChange('consciousness_field_accent_color', e.target.value)}
                          placeholder="#3d7a8c"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'צפיפות חלקיקים' : language === 'es' ? 'Densidad de partículas' : 'Particle Density'}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.3"
                        max="1"
                        value={localTheme.consciousness_field_particle_density}
                        onChange={(e) => handleChange('consciousness_field_particle_density', e.target.value)}
                        placeholder="0.6"
                      />
                      <p className="text-xs text-muted-foreground">
                        {language === 'he' ? '0.3 (מינימלי) עד 1 (צפוף)' : language === 'es' ? '0.3 (mínimo) a 1 (denso)' : '0.3 (minimal) to 1 (dense)'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'he' ? 'מהירות נשימה (שניות)' : language === 'es' ? 'Velocidad de respiración (segundos)' : 'Breathing Speed (seconds)'}</Label>
                      <Input
                        type="number"
                        step="1"
                        min="5"
                        max="20"
                        value={localTheme.consciousness_field_breathing_speed}
                        onChange={(e) => handleChange('consciousness_field_breathing_speed', e.target.value)}
                        placeholder="10"
                      />
                      <p className="text-xs text-muted-foreground">
                        {language === 'he' ? '5 (מהיר) עד 20 (איטי מאוד)' : language === 'es' ? '5 (rápido) a 20 (muy lento)' : '5 (fast) to 20 (very slow)'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div>
                      <Label>{language === 'he' ? 'אינטראקציה עם עכבר/מגע' : language === 'es' ? 'Interacción con mouse/táctil' : 'Mouse/Touch Interaction'}</Label>
                      <p className="text-xs text-muted-foreground">
                        {language === 'he' ? 'החלקיקים מגיבים לתנועת העכבר' : language === 'es' ? 'Las partículas responden al movimiento del mouse' : 'Particles respond to mouse movement'}
                      </p>
                    </div>
                    <Switch
                      checked={localTheme.consciousness_field_interaction}
                      onCheckedChange={(checked) => handleChange('consciousness_field_interaction', checked)}
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#0a1628]/50 border border-[#3d7a8c]/20">
                    <p className="text-sm text-center text-muted-foreground italic">
                      {language === 'he' 
                        ? '"זה לא רקע טכנולוגי. זה שדה תודעתי עשוי קוד."'
                        : language === 'es'
                        ? '"Esto no es un fondo tecnológico. Es un campo de conciencia hecho de código."'
                        : '"This isn\'t a technological background. It\'s a consciousness field made of code."'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Hero Portrait Effect Section */}
              <div className="pt-6 border-t border-border">
                <div className="space-y-2 mb-4">
                  <Label className="text-lg font-semibold">{language === 'he' ? 'אפקט תמונת פורטרט' : language === 'es' ? 'Efecto de retrato' : 'Hero Portrait Effect'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'he' ? 'האפקט סביב התמונה בעמוד הראשי' : language === 'es' ? 'Efecto alrededor del retrato en la página principal' : 'Effect around the portrait on the homepage'}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleChange('hero_portrait_effect', 'none')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.hero_portrait_effect === 'none' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <p className="font-medium text-sm">{language === 'he' ? 'ללא' : language === 'es' ? 'Ninguno' : 'None'}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('hero_portrait_effect', 'cyber_glow')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.hero_portrait_effect === 'cyber_glow' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center shadow-lg shadow-primary/30">
                        <span className="text-lg">✨</span>
                      </div>
                      <p className="font-medium text-sm">{language === 'he' ? 'זוהר סייבר' : language === 'es' ? 'Resplandor Cyber' : 'Cyber Glow'}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('hero_portrait_effect', 'consciousness_aura')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      localTheme.hero_portrait_effect === 'consciousness_aura' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1e3a5f] flex items-center justify-center border border-[#3d7a8c]/50">
                        <span className="text-[#3d7a8c]">∞</span>
                      </div>
                      <p className="font-medium text-sm">{language === 'he' ? 'הילת תודעה' : language === 'es' ? 'Aura de conciencia' : 'Aura'}</p>
                    </div>
                  </button>
                </div>

                {/* Portrait effect settings */}
                {localTheme.hero_portrait_effect !== 'none' && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{language === 'he' ? 'צבע זוהר (אופציונלי)' : language === 'es' ? 'Color de resplandor (opcional)' : 'Glow Color (optional)'}</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={localTheme.hero_portrait_glow_color || '#00d4ff'}
                            onChange={(e) => handleChange('hero_portrait_glow_color', e.target.value)}
                            className="w-12 h-12 rounded cursor-pointer"
                          />
                          <Input
                            value={localTheme.hero_portrait_glow_color}
                            onChange={(e) => handleChange('hero_portrait_glow_color', e.target.value)}
                            placeholder={language === 'he' ? 'השאר ריק לצבע נושא' : language === 'es' ? 'Dejar vacío para color del tema' : 'Leave empty for theme color'}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{language === 'he' ? 'מהירות אנימציה' : language === 'es' ? 'Velocidad de animación' : 'Animation Speed'}</Label>
                        <div className="flex gap-2">
                          {(['slow', 'normal', 'fast'] as const).map((speed) => (
                            <button
                              key={speed}
                              type="button"
                              onClick={() => handleChange('hero_portrait_animation_speed', speed)}
                              className={`flex-1 py-2 px-3 rounded-lg border transition-all text-sm ${
                                localTheme.hero_portrait_animation_speed === speed
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {language === 'he' 
                                ? speed === 'slow' ? 'איטי' : speed === 'normal' ? 'רגיל' : 'מהיר'
                                : language === 'es'
                                ? speed === 'slow' ? 'Lento' : speed === 'normal' ? 'Normal' : 'Rápido'
                                : speed.charAt(0).toUpperCase() + speed.slice(1)
                              }
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'he' ? 'מיתוג' : language === 'es' ? 'Marca' : 'Branding'}</CardTitle>
              <CardDescription>
                {language === 'he' ? 'הגדר את פרטי המותג שלך' : language === 'es' ? 'Configura los detalles de tu marca' : 'Set up your brand details'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'he' ? 'שם המותג (עברית)' : language === 'es' ? 'Nombre de la marca (Hebreo)' : 'Brand Name (Hebrew)'}</Label>
                  <Input
                    value={localTheme.brand_name}
                    onChange={(e) => handleChange('brand_name', e.target.value)}
                    placeholder="AION"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'he' ? 'שם המותג (אנגלית)' : language === 'es' ? 'Nombre de la marca (Inglés)' : 'Brand Name (English)'}</Label>
                  <Input
                    value={localTheme.brand_name_en}
                    onChange={(e) => handleChange('brand_name_en', e.target.value)}
                    placeholder="AION"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'he' ? 'שם החברה המשפטי' : language === 'es' ? 'Nombre legal de la empresa' : 'Legal Company Name'}</Label>
                  <Input
                    value={localTheme.company_legal_name}
                    onChange={(e) => handleChange('company_legal_name', e.target.value)}
                    placeholder="AION OÜ"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'he' ? 'מדינת רישום' : language === 'es' ? 'País de registro' : 'Registration Country'}</Label>
                  <Input
                    value={localTheme.company_country}
                    onChange={(e) => handleChange('company_country', e.target.value)}
                    placeholder="Estonia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  label={language === 'he' ? 'לוגו' : language === 'es' ? 'Logotipo' : 'Logo'}
                  description={language === 'he' ? 'לוגו המותג שלך' : language === 'es' ? 'El logotipo de tu marca' : 'Your brand logo'}
                  value={localTheme.logo_url}
                  onChange={(url) => handleChange('logo_url', url)}
                  folder="logos"
                  maxSizeMB={5}
                  aspectHint="1:1"
                />
                <ImageUpload
                  label={language === 'he' ? 'תמונת פורטרט' : language === 'es' ? 'Retrato principal' : 'Hero Portrait'}
                  description={language === 'he' ? 'תמונת הפורטרט שמופיעה בעמוד הראשי' : language === 'es' ? 'Retrato que aparece en la página principal' : 'Portrait image on homepage'}
                  value={localTheme.hero_portrait_url}
                  onChange={(url) => handleChange('hero_portrait_url', url)}
                  folder="portraits"
                  maxSizeMB={10}
                  aspectHint="1:1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'he' ? 'שם מקוצר (עברית)' : language === 'es' ? 'Nombre corto (Hebreo)' : 'Short Name (Hebrew)'}</Label>
                  <Input
                    value={localTheme.founder_short_name}
                    onChange={(e) => handleChange('founder_short_name', e.target.value)}
                    placeholder="דין"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'he' ? 'שם מקוצר (אנגלית)' : language === 'es' ? 'Nombre corto (Inglés)' : 'Short Name (English)'}</Label>
                  <Input
                    value={localTheme.founder_short_name_en}
                    onChange={(e) => handleChange('founder_short_name_en', e.target.value)}
                    placeholder="Dean"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === 'he' ? 'טוקן טופס התבוננות' : language === 'es' ? 'Token de formulario de introspección' : 'Introspection Form Token'}</Label>
                <Input
                  value={localTheme.introspection_form_id}
                  onChange={(e) => handleChange('introspection_form_id', e.target.value)}
                  placeholder="866eb5a92355da936aea2b7bcb50726cc3f01badf5ebbeaecfff9b2c4aa7539e"
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'he' ? 'הטוקן (access_token) של המתנה החינמית' : language === 'es' ? 'El access_token del cuestionario de regalo gratuito' : 'The access_token for the free gift questionnaire'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{language === 'he' ? 'שפת ברירת מחדל' : language === 'es' ? 'Idioma predeterminado' : 'Default Language'}</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="default_language"
                      value="he"
                      checked={localTheme.default_language === 'he'}
                      onChange={(e) => handleChange('default_language', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>עברית</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="default_language"
                      value="en"
                      checked={localTheme.default_language === 'en'}
                      onChange={(e) => handleChange('default_language', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>English</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="default_language"
                      value="es"
                      checked={localTheme.default_language === 'es'}
                      onChange={(e) => handleChange('default_language', e.target.value)}
                      className="w-4 h-4"
                    />
                    <span>Español</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'he' ? 'תצוגה מקדימה' : language === 'es' ? 'Vista previa' : 'Live Preview'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 rounded-lg"
            style={{
              backgroundColor: `hsl(${localTheme.background_h}, ${localTheme.background_s}, ${localTheme.background_l})`
            }}
          >
            <div className="space-y-4">
              <h2 
                className="text-2xl font-bold"
                style={{
                  color: `hsl(${localTheme.primary_h}, ${localTheme.primary_s}, ${localTheme.primary_l})`
                }}
              >
                {language === 'he' ? localTheme.brand_name : localTheme.brand_name_en}
              </h2>
              <p style={{ color: 'white' }}>
                {language === 'he' ? 'זוהי תצוגה מקדימה של הנושא שלך' : language === 'es' ? 'Esta es una vista previa de tu tema' : 'This is a preview of your theme'}
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: `hsl(${localTheme.primary_h}, ${localTheme.primary_s}, ${localTheme.primary_l})`,
                    color: 'black'
                  }}
                >
                  {language === 'he' ? 'כפתור ראשי' : language === 'es' ? 'Botón primario' : 'Primary Button'}
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: `hsl(${localTheme.secondary_h}, ${localTheme.secondary_s}, ${localTheme.secondary_l})`,
                    color: 'white'
                  }}
                >
                  {language === 'he' ? 'כפתור משני' : language === 'es' ? 'Botón secundario' : 'Secondary Button'}
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    backgroundColor: `hsl(${localTheme.accent_h}, ${localTheme.accent_s}, ${localTheme.accent_l})`,
                    color: 'black'
                  }}
                >
                  {language === 'he' ? 'הדגשה' : language === 'es' ? 'Acento' : 'Accent'}
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Theme;
