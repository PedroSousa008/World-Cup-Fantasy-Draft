"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAppBranding } from "@/lib/actions/branding";
import type { AppBranding } from "@/lib/branding/types";
import { AppLogoStatic } from "@/components/branding/app-logo";

interface AppBrandingFormProps {
  initial: AppBranding;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AppBrandingForm({ initial }: AppBrandingFormProps) {
  const [branding, setBranding] = useState(initial);
  const [appName, setAppName] = useState(initial.appName);
  const [appShortName, setAppShortName] = useState(initial.appShortName);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const save = (patch: Partial<AppBranding>) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await updateAppBranding(patch);
        setBranding((prev) => ({ ...prev, ...patch }));
        setMessage("Branding saved.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save branding");
      }
    });
  };

  const handleFile = async (type: "logo" | "icon", file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    if (type === "logo") {
      save({ appLogoUrl: dataUrl });
    } else {
      save({ appIconUrl: dataUrl });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl bg-[#081120]/5 p-4">
        <AppLogoStatic branding={branding} size="lg" />
        <div>
          <p className="font-semibold text-[#081120]">Live preview</p>
          <p className="text-xs text-[#081120]/50">How your logo appears in the header</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#081120]/60">App Name</label>
          <Input
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="World Cup Fantasy Draft"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#081120]/60">Short Name</label>
          <Input
            value={appShortName}
            onChange={(e) => setAppShortName(e.target.value)}
            placeholder="WC Fantasy"
          />
        </div>
      </div>

      <Button
        disabled={pending}
        onClick={() => save({ appName, appShortName })}
        className="w-full sm:w-auto"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Names"}
      </Button>

      <div className="grid gap-4 sm:grid-cols-2">
        <UploadTile
          label="App Logo"
          hint="Header, login, profile · PNG/JPG · max 512KB"
          imageUrl={branding.appLogoUrl}
          inputRef={logoInputRef}
          onPick={() => logoInputRef.current?.click()}
          onFile={(f) => handleFile("logo", f)}
          onRemove={() => save({ appLogoUrl: null })}
          pending={pending}
        />
        <UploadTile
          label="App Icon"
          hint="Favicon & PWA · square · max 256KB"
          imageUrl={branding.appIconUrl}
          inputRef={iconInputRef}
          onPick={() => iconInputRef.current?.click()}
          onFile={(f) => handleFile("icon", f)}
          onRemove={() => save({ appIconUrl: null })}
          pending={pending}
        />
      </div>

      {message && <p className="text-sm font-medium text-[#00C853]">{message}</p>}
      {error && <p className="text-sm font-medium text-[#E53935]">{error}</p>}
    </div>
  );
}

function UploadTile({
  label,
  hint,
  imageUrl,
  inputRef,
  onPick,
  onFile,
  onRemove,
  pending,
}: {
  label: string;
  hint: string;
  imageUrl: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onPick: () => void;
  onFile: (file: File | undefined) => void;
  onRemove: () => void;
  pending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#081120]/10 p-4">
      <p className="font-semibold text-[#081120]">{label}</p>
      <p className="mt-0.5 text-xs text-[#081120]/45">{hint}</p>

      <div className="mt-4 flex h-24 items-center justify-center rounded-xl bg-[#081120]/5">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={label} className="max-h-20 max-w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-[#081120]/30">
            <ImagePlus className="h-8 w-8" />
            <span className="text-xs">No logo uploaded</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" disabled={pending} onClick={onPick} className="flex-1">
          Upload
        </Button>
        {imageUrl && (
          <Button size="sm" variant="ghost" disabled={pending} onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
