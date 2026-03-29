"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Eye,
  Download,
  Image as ImageIcon,
  Type,
  List,
  LayoutGrid,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Wand2,
  RefreshCw,
  CheckSquare,
  Square,
  Save,
  FolderOpen,
  Globe,
  Trash2,
  Copy,
  Check,
  X,
  LogOut,
} from "lucide-react";

type ConfigSummary = { id: string; name: string; description?: string | null; updatedAt: string };
type LandingSummary = { id: string; name: string; slug?: string | null; createdAt: string };
type Palette = { label: string; colors: string[] };
import { defaultBlockSchema, Block, BlockField, FieldMode } from "../lib/blockSchema";
import { generateLandingHTML } from "../lib/htmlGenerator";
import ImageCropModal from "../components/ImageCropModal";

const DEFAULT_PALETTE: Palette = {
  label: "A",
  colors: [
    "#2D9F46", // 0: Primary Green
    "#FFE500", // 1: Accent Yellow
    "#1A1A1A", // 2: Near-black
    "#ffffff", // 3: White
    "#555555", // 4: Medium gray
    "#f5f5f0", // 5: Off-white bg
    "#333333", // 6: Dark gray text
    "#EFEFEF", // 7: Light gray/borders
    "#1B7A2B", // 8: Dark green CTA
    "#BCBCBC", // 9: Border gray
  ],
};

export default function Home() {
  const [markdown, setMarkdown] = useState("");
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const raw: Block[] = JSON.parse(JSON.stringify(defaultBlockSchema));
    return raw.map((b) => ({
      ...b,
      fields: b.fields.map((f) => ({
        ...f,
        // Par défaut : generated pour textes, original pour images
        mode: f.type === "image" ? "original" : "generated" as FieldMode,
      })),
    }));
  });
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [generatingStyle, setGeneratingStyle] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const styleFileInputRef = useRef<HTMLInputElement>(null);
  const [styleUploadTarget, setStyleUploadTarget] = useState<{blockId: string; fieldId: string} | null>(null);
  const [palettes, setPalettes] = useState<Palette[]>([DEFAULT_PALETTE]);
  const [activePaletteLabel, setActivePaletteLabel] = useState("A");
  const [blockPalettes, setBlockPalettes] = useState<Record<string, string>>({});
  const [paletteUrl, setPaletteUrl] = useState("");
  const [extractingPalette, setExtractingPalette] = useState(false);
  const [newPaletteColors, setNewPaletteColors] = useState("");
  const [dragColor, setDragColor] = useState<{ color: string; fromLabel: string; fromIdx: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isWorking = generating || !!generatingField || !!generatingImage;

  // ── Configs & Landings state ──────────────────────────────────────────
  const [configs, setConfigs] = useState<ConfigSummary[]>([]);
  const [landings, setLandings] = useState<LandingSummary[]>([]);
  const [currentConfigId, setCurrentConfigId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showConfigsPanel, setShowConfigsPanel] = useState(false);
  const [showLandingsPanel, setShowLandingsPanel] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [saveLandingModal, setSaveLandingModal] = useState(false);
  const [saveLandingName, setSaveLandingName] = useState("");
  const [saveLandingSlug, setSaveLandingSlug] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isWorking) {
      setElapsedSec(0);
      timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isWorking]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setMarkdown(ev.target?.result as string);
        setStatusMsg(`Fichier "${file.name}" chargé (${(file.size / 1024).toFixed(1)} Ko)`);
      };
      reader.readAsText(file);
    },
    []
  );

  // Gestionnaire d'upload d'image pour les champs en mode manuel
  const [uploadingImageTarget, setUploadingImageTarget] = useState<{blockId: string; fieldId: string} | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [cropModal, setCropModal] = useState<{
    imageDataUrl: string;
    targetWidth: number;
    targetHeight: number;
    blockId: string;
    fieldId: string;
  } | null>(null);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !uploadingImageTarget) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const { blockId, fieldId } = uploadingImageTarget;
        const block = blocks.find(b => b.id === blockId);
        const field = block?.fields.find(f => f.id === fieldId);
        if (field?.targetWidth && field?.targetHeight) {
          setCropModal({
            imageDataUrl: dataUrl,
            targetWidth: field.targetWidth,
            targetHeight: field.targetHeight,
            blockId,
            fieldId,
          });
        } else {
          updateFieldValue(blockId, fieldId, dataUrl);
          setStatusMsg(`Image "${file.name}" uploadée (${(file.size / 1024).toFixed(1)} Ko)`);
        }
        setUploadingImageTarget(null);
      };
      reader.readAsDataURL(file);
      if (imageFileInputRef.current) imageFileInputRef.current.value = "";
    },
    [uploadingImageTarget, blocks]
  );

  const handleCropConfirm = (croppedDataUrl: string) => {
    if (cropModal) {
      updateFieldValue(cropModal.blockId, cropModal.fieldId, croppedDataUrl);
      setStatusMsg(`Image recadrée (${cropModal.targetWidth}×${cropModal.targetHeight})`);
      setCropModal(null);
    }
  };

  const triggerImageUpload = (blockId: string, fieldId: string) => {
    setUploadingImageTarget({ blockId, fieldId });
    imageFileInputRef.current?.click();
  };

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  };

  const toggleField = (fieldId: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  };

  const toggleBlockEnabled = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, enabled: !b.enabled } : b
      )
    );
  };

  // Bascule tous les champs du bloc entre 'generated' et 'original'
  const toggleBlockMode = (blockId: string) => {
    setBlocks((prev) => {
      const block = prev.find((b) => b.id === blockId);
      if (!block) return prev;
      const allOriginal = block.fields.every((f) => f.mode === 'original');
      const newMode: FieldMode = allOriginal ? 'generated' : 'original';
      return prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              fields: b.fields.map((f) => ({ ...f, mode: newMode })),
            }
          : b
      );
    });
  };

  const updateFieldPrompt = (blockId: string, fieldId: string, prompt: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              fields: b.fields.map((f) =>
                f.id === fieldId ? { ...f, prompt } : f
              ),
            }
          : b
      )
    );
  };

  const updateFieldValue = (blockId: string, fieldId: string, value: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              fields: b.fields.map((f) =>
                f.id === fieldId ? { ...f, value } : f
              ),
            }
          : b
      )
    );
  };

  const updateFieldMode = (blockId: string, fieldId: string, mode: FieldMode) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
              ...b,
              fields: b.fields.map((f) =>
                f.id === fieldId ? { ...f, mode } : f
              ),
            }
          : b
      )
    );
  };

  const generateSingleField = async (blockId: string, field: BlockField) => {
    if (!markdown.trim()) {
      setStatusMsg("Veuillez d'abord charger un document .md");
      return;
    }
    setGeneratingField(field.id);
    setStatusMsg(`Génération de "${field.label}"...`);
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: field.prompt,
          markdownContent: markdown,
          fieldType: field.type,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (field.type === "image") {
        // For image fields, store generated content as imagePrompt
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === blockId
              ? { ...b, fields: b.fields.map((f) => f.id === field.id ? { ...f, imagePrompt: data.content } : f) }
              : b
          )
        );
      } else {
        updateFieldValue(blockId, field.id, data.content);
      }
      setStatusMsg(`"${field.label}" généré avec succès`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMsg(`Erreur: ${msg}`);
    } finally {
      setGeneratingField(null);
    }
  };

  const generateImage = async (blockId: string, field: BlockField) => {
    const prompt = [field.imagePrompt, field.imageStyle].filter(Boolean).join("\n\nSTYLE VISUEL : ");
    if (!prompt.trim()) {
      setStatusMsg("Veuillez d'abord générer le prompt d'image");
      return;
    }
    setGeneratingImage(field.id);
    setStatusMsg(`Génération de l'image "${field.label}"...`);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      updateFieldValue(blockId, field.id, data.image);
      setStatusMsg(`Image "${field.label}" générée`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMsg(`Erreur image: ${msg}`);
    } finally {
      setGeneratingImage(null);
    }
  };

  const generateStyleFromImage = async (blockId: string, fieldId: string, imageDataUrl: string) => {
    setGeneratingStyle(fieldId);
    setStatusMsg("Analyse du style de l'image...");
    try {
      const res = await fetch("/api/generate-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, fields: b.fields.map((f) => f.id === fieldId ? { ...f, imageStyle: data.style } : f) }
            : b
        )
      );
      setStatusMsg("Style extrait avec succès");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMsg(`Erreur style: ${msg}`);
    } finally {
      setGeneratingStyle(null);
    }
  };

  const handleStyleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !styleUploadTarget) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        generateStyleFromImage(styleUploadTarget.blockId, styleUploadTarget.fieldId, dataUrl);
        setStyleUploadTarget(null);
      };
      reader.readAsDataURL(file);
      if (styleFileInputRef.current) styleFileInputRef.current.value = "";
    },
    [styleUploadTarget]
  );

  const triggerStyleUpload = (blockId: string, fieldId: string) => {
    setStyleUploadTarget({ blockId, fieldId });
    styleFileInputRef.current?.click();
  };

  // ── Palette functions ───────────────────────────────────────────────
  const nextPaletteLabel = () => {
    const existing = palettes.map((p) => p.label);
    for (let i = 0; i < 26; i++) {
      const l = String.fromCharCode(65 + i);
      if (!existing.includes(l)) return l;
    }
    return `P${palettes.length + 1}`;
  };

  const addPalette = (colors: string[]) => {
    const label = nextPaletteLabel();
    setPalettes((prev) => [...prev, { label, colors }]);
    return label;
  };

  const extractPaletteFromUrl = async () => {
    if (!paletteUrl.trim()) return;
    setExtractingPalette(true);
    setStatusMsg("Extraction de la palette...");
    try {
      const res = await fetch("/api/extract-palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: paletteUrl }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const label = addPalette(data.colors);
      setStatusMsg(`Palette ${label} extraite (${data.colors.length} couleurs)`);
      setPaletteUrl("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      setStatusMsg(`Erreur palette: ${msg}`);
    } finally {
      setExtractingPalette(false);
    }
  };

  const addManualPalette = () => {
    const colors = newPaletteColors.split(/[,\s]+/).filter((c) => /^#[0-9a-fA-F]{3,6}$/.test(c));
    if (colors.length < 2) {
      setStatusMsg("Entrez au moins 2 couleurs hex (ex: #2D9F46, #FFE500)");
      return;
    }
    const label = addPalette(colors);
    setNewPaletteColors("");
    setStatusMsg(`Palette ${label} créée`);
  };

  const applyPaletteToAll = (label: string) => {
    setActivePaletteLabel(label);
    setBlockPalettes({});
    setStatusMsg(`Palette ${label} appliquée à tous les blocs`);
  };

  const getBlockPalette = (blockId: string): Palette => {
    const label = blockPalettes[blockId] || activePaletteLabel;
    return palettes.find((p) => p.label === label) || palettes[0];
  };

  const duplicatePalette = (sourceLabel: string) => {
    const source = palettes.find((p) => p.label === sourceLabel);
    if (!source) return;
    const label = addPalette([...source.colors]);
    setStatusMsg(`Palette ${sourceLabel} dupliquée → ${label}`);
  };

  const dropColorOnPalette = (targetLabel: string, targetIdx: number) => {
    if (!dragColor || targetLabel === "A") return; // A is read-only
    setPalettes((prev) =>
      prev.map((p) =>
        p.label === targetLabel
          ? { ...p, colors: p.colors.map((c, i) => (i === targetIdx ? dragColor.color : c)) }
          : p
      )
    );
    setDragColor(null);
  };

  const generateAllBlock = async (block: Block) => {
    if (!markdown.trim()) {
      setStatusMsg("Veuillez d'abord charger un document .md");
      return;
    }
    setGenerating(true);
    setStatusMsg(`Génération du bloc "${block.name}"...`);

    const textFields = block.fields.filter((f) => f.type !== "image" && f.mode !== 'original');
    if (textFields.length === 0) {
      setStatusMsg(`Aucun champ coché dans "${block.name}"`);
      setGenerating(false);
      return;
    }
    try {
      const res = await fetch("/api/generate-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: textFields.map((f) => ({
            fieldId: f.id,
            prompt: f.prompt,
            fieldType: f.type,
          })),
          markdownContent: markdown,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setBlocks((prev) =>
        prev.map((b) =>
          b.id === block.id
            ? {
                ...b,
                fields: b.fields.map((f) =>
                  data.results[f.id] !== undefined
                    ? { ...f, value: data.results[f.id] }
                    : f
                ),
              }
            : b
        )
      );
      setStatusMsg(`Bloc "${block.name}" généré avec succès`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMsg(`Erreur: ${msg}`);
    } finally {
      setGenerating(false);
    }
  };

  const generateAll = async () => {
    if (!markdown.trim()) {
      setStatusMsg("Veuillez d'abord charger un document .md");
      return;
    }
    setGenerating(true);
    const enabledBlocks = blocks.filter((b) => b.enabled);
    for (let i = 0; i < enabledBlocks.length; i++) {
      const block = enabledBlocks[i];
      setStatusMsg(
        `Génération bloc ${i + 1}/${enabledBlocks.length} : "${block.name}"...`
      );
      const textFields = block.fields.filter((f) => f.type !== "image" && f.mode !== 'original');
      if (textFields.length === 0) continue;
      try {
        const res = await fetch("/api/generate-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: textFields.map((f) => ({
              fieldId: f.id,
              prompt: f.prompt,
              fieldType: f.type,
            })),
            markdownContent: markdown,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setBlocks((prev) =>
          prev.map((b) =>
            b.id === block.id
              ? {
                  ...b,
                  fields: b.fields.map((f) =>
                    data.results[f.id] !== undefined
                      ? { ...f, value: data.results[f.id] }
                      : f
                  ),
                }
              : b
          )
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        setStatusMsg(`Erreur bloc "${block.name}": ${msg}`);
      }
    }
    // Phase 2: generate images for image fields in "generated" mode
    const imageFields: { blockId: string; field: BlockField }[] = [];
    for (const block of enabledBlocks) {
      for (const field of block.fields) {
        if (field.type === "image" && field.mode === "generated") {
          imageFields.push({ blockId: block.id, field });
        }
      }
    }
    for (let i = 0; i < imageFields.length; i++) {
      const { blockId, field } = imageFields[i];
      setStatusMsg(`Génération image ${i + 1}/${imageFields.length} : "${field.label}"...`);
      // Step 1: generate image prompt from .md if empty
      let currentField = field;
      if (!currentField.imagePrompt) {
        try {
          const res = await fetch("/api/generate-content", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: currentField.prompt,
              markdownContent: markdown,
              fieldType: "image",
            }),
          });
          const data = await res.json();
          if (!data.error && data.content) {
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === blockId
                  ? { ...b, fields: b.fields.map((f) => f.id === field.id ? { ...f, imagePrompt: data.content } : f) }
                  : b
              )
            );
            currentField = { ...currentField, imagePrompt: data.content };
          }
        } catch { /* continue */ }
      }
      // Step 2: generate the image
      const imgPrompt = [currentField.imagePrompt, currentField.imageStyle].filter(Boolean).join("\n\nSTYLE VISUEL : ");
      if (imgPrompt.trim()) {
        try {
          const res = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: imgPrompt }),
          });
          const data = await res.json();
          if (!data.error && data.image) {
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === blockId
                  ? { ...b, fields: b.fields.map((f) => f.id === field.id ? { ...f, value: data.image } : f) }
                  : b
              )
            );
          }
        } catch { /* continue */ }
      }
    }
    setStatusMsg("Génération terminée pour tous les blocs !");
    setGenerating(false);
  };

  // ── Config functions ─────────────────────────────────────────────────
  const loadConfigs = async () => {
    try {
      const res = await fetch("/api/configs");
      setConfigs(await res.json());
    } catch { /* silent */ }
  };

  const openConfigsPanel = () => {
    setShowConfigsPanel(true);
    loadConfigs();
  };

  const saveConfig = async () => {
    if (!saveName.trim()) return;
    try {
      const body = { name: saveName, description: saveDesc, markdown, blocks: JSON.stringify(blocks), palettes: JSON.stringify(palettes), activePaletteLabel, blockPalettes: JSON.stringify(blockPalettes) };
      if (currentConfigId) {
        await fetch(`/api/configs/${currentConfigId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        setStatusMsg(`Config "${saveName}" mise à jour`);
      } else {
        const res = await fetch("/api/configs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await res.json();
        setCurrentConfigId(data.id);
        setStatusMsg(`Config "${saveName}" sauvegardée`);
      }
      setShowSaveModal(false);
    } catch { setStatusMsg("Erreur lors de la sauvegarde"); }
  };

  const loadConfig = async (id: string) => {
    try {
      const res = await fetch(`/api/configs/${id}`);
      const data = await res.json();
      setMarkdown(data.markdown ?? "");
      setBlocks(JSON.parse(data.blocks));
      if (data.palettes) {
        try { setPalettes(JSON.parse(data.palettes)); } catch { /* keep current */ }
      }
      if (data.activePaletteLabel) setActivePaletteLabel(data.activePaletteLabel);
      if (data.blockPalettes) {
        try { setBlockPalettes(JSON.parse(data.blockPalettes)); } catch { /* keep current */ }
      }
      setCurrentConfigId(data.id);
      setSaveName(data.name);
      setSaveDesc(data.description ?? "");
      setShowConfigsPanel(false);
      setStatusMsg(`Config "${data.name}" chargée`);
    } catch { setStatusMsg("Erreur lors du chargement"); }
  };

  const deleteConfig = async (id: string, name: string) => {
    await fetch(`/api/configs/${id}`, { method: "DELETE" });
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    if (currentConfigId === id) setCurrentConfigId(null);
    setStatusMsg(`Config "${name}" supprimée`);
  };

  // ── Landing functions ─────────────────────────────────────────────────
  const loadLandings = async () => {
    try {
      const res = await fetch("/api/landings");
      setLandings(await res.json());
    } catch { /* silent */ }
  };

  const openLandingsPanel = () => {
    setShowLandingsPanel(true);
    loadLandings();
  };

  const saveLanding = async () => {
    if (!saveLandingName.trim()) return;
    try {
      const html = generateLandingHTML(blocks, palettes.find((p) => p.label === activePaletteLabel)?.colors);
      const res = await fetch("/api/landings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: saveLandingName,
          slug: saveLandingSlug.trim() ? saveLandingSlug : null,
          configId: currentConfigId,
          html,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMsg(data.error || "Erreur lors de la publication");
        return;
      }
      setSaveLandingModal(false);
      setSaveLandingName("");
      setSaveLandingSlug("");
      const publicUrl = data.slug ? `/${data.slug}` : `/l/${data.id}`;
      setStatusMsg(`Landing "${data.name}" publiée — lien : ${publicUrl}`);
    } catch { setStatusMsg("Erreur lors de la sauvegarde de la landing"); }
  };

  const deleteLanding = async (id: string, name: string) => {
    await fetch(`/api/landings/${id}`, { method: "DELETE" });
    setLandings((prev) => prev.filter((l) => l.id !== id));
    setStatusMsg(`Landing "${name}" supprimée`);
  };

  const syncLandingSlugFromName = async (id: string) => {
    try {
      const res = await fetch(`/api/landings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncSlugFromName: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusMsg(typeof data.error === "string" ? data.error : "Impossible de mettre à jour l’URL");
        return;
      }
      setLandings((prev) => prev.map((l) => (l.id === id ? { ...l, slug: data.slug ?? l.slug } : l)));
      setStatusMsg(`URL mise à jour : /${data.slug ?? ""}`);
    } catch {
      setStatusMsg("Erreur réseau (URL)");
    }
  };

  const copyLink = (id: string, slug?: string | null) => {
    const url = slug ? `${window.location.origin}/${slug}` : `${window.location.origin}/l/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/app-admin/login";
  };

  const openPreview = () => {
    const html = generateLandingHTML(blocks, palettes.find((p) => p.label === activePaletteLabel)?.colors);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const downloadHTML = () => {
    const html = generateLandingHTML(blocks, palettes.find((p) => p.label === activePaletteLabel)?.colors);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landing-page.html";
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg("HTML téléchargé !");
  };

  const fieldIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type size={14} />;
      case "textarea":
        return <FileText size={14} />;
      case "image":
        return <ImageIcon size={14} />;
      case "list":
        return <List size={14} />;
      case "cards":
        return <LayoutGrid size={14} />;
      default:
        return <Type size={14} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      {/* TOP BAR */}
      <header className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-yellow-400" />
          <h1 className="text-lg font-semibold tracking-tight">
            Landing Generator
          </h1>
          <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-medium">
            GPT-5.4-mini
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateAll}
            disabled={generating || !markdown.trim()}
            className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {generating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Wand2 size={16} />
            )}
            Tout générer
          </button>
          <div className="w-px h-6 bg-zinc-700" />
          <button
            onClick={() => { setSaveName(saveName || "Config sans nom"); setShowSaveModal(true); }}
            className="flex items-center gap-2 bg-zinc-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-zinc-600 transition"
            title="Sauvegarder la configuration"
          >
            <Save size={15} />
            {currentConfigId ? "Mettre à jour" : "Sauvegarder"}
          </button>
          <button
            onClick={openConfigsPanel}
            className="flex items-center gap-2 bg-zinc-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-zinc-600 transition"
            title="Ouvrir une configuration sauvegardée"
          >
            <FolderOpen size={15} />
            Ouvrir
          </button>
          <div className="w-px h-6 bg-zinc-700" />
          <button
            onClick={openPreview}
            className="flex items-center gap-2 bg-zinc-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-zinc-600 transition"
          >
            <Eye size={16} />
            Aperçu
          </button>
          <button
            onClick={downloadHTML}
            className="flex items-center gap-2 bg-zinc-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-zinc-600 transition"
          >
            <Download size={16} />
            HTML
          </button>
          <button
            onClick={() => { setSaveLandingName("Landing " + new Date().toLocaleDateString("fr-FR")); setSaveLandingModal(true); }}
            className="flex items-center gap-2 bg-zinc-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-zinc-600 transition"
            title="Sauvegarder la landing et obtenir un lien"
          >
            <Globe size={15} />
            Publier
          </button>
          <button
            onClick={openLandingsPanel}
            className="flex items-center gap-2 bg-zinc-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-zinc-600 transition"
            title="Voir les landings publiées"
          >
            <Globe size={15} className="text-green-400" />
            Landings
          </button>
          <div className="w-px h-6 bg-zinc-700" />
          <button
            type="button"
            onClick={() => void logout()}
            className="flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition"
            title="Déconnexion"
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      </header>

      {/* STATUS BAR */}
      {statusMsg && (
        <div className="px-6 py-1.5 bg-zinc-900/50 border-b border-zinc-800 text-xs text-zinc-400 shrink-0 flex items-center gap-3">
          {isWorking && <Loader2 size={12} className="animate-spin text-yellow-400" />}
          <span>{statusMsg}</span>
          {isWorking && (
            <span className="text-yellow-400 font-mono tabular-nums">
              {Math.floor(elapsedSec / 60)}:{String(elapsedSec % 60).padStart(2, "0")}
            </span>
          )}
          {isWorking && (
            <span className="text-zinc-600 text-[10px]">
              GPT-5.4-mini — génération en cours
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL — MARKDOWN INPUT */}
        <div className="w-[380px] shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-900">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText size={16} className="text-yellow-400" />
              Document source
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded text-xs font-medium hover:bg-zinc-700 transition"
              >
                <Upload size={14} />
                Uploader .md
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt,.markdown"
                onChange={handleFileUpload}
                className="hidden"
              />
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={styleFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleStyleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Collez votre contenu .md ici ou uploadez un fichier..."
            className="flex-1 bg-zinc-950 text-zinc-300 text-xs font-mono p-4 resize-none focus:outline-none placeholder:text-zinc-600"
          />
          {markdown && (
            <div className="px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
              {markdown.length.toLocaleString()} caractères ·{" "}
              {markdown.split("\n").length} lignes
            </div>
          )}
        </div>

        {/* RIGHT PANEL — BLOCK TREE */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">

            {/* ── PALETTE SECTION ── */}
            <div className="mb-4 rounded-xl border border-zinc-700 bg-zinc-900 p-3 space-y-2">
              <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-yellow-400" />
                Palettes de couleurs
              </h3>

              {/* Palette list with drag & drop */}
              <div className="space-y-1.5">
                {palettes.map((p) => {
                  const isReadOnly = p.label === "A";
                  return (
                    <div key={p.label} className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold w-5 text-center ${activePaletteLabel === p.label ? 'text-yellow-400' : 'text-zinc-500'}`}>
                        {p.label}
                      </span>
                      <div className="flex gap-0.5 flex-1">
                        {p.colors.map((c, i) => (
                          <div
                            key={i}
                            draggable
                            onDragStart={() => setDragColor({ color: c, fromLabel: p.label, fromIdx: i })}
                            onDragEnd={() => setDragColor(null)}
                            onDragOver={(e) => { if (!isReadOnly) e.preventDefault(); }}
                            onDrop={(e) => { e.preventDefault(); dropColorOnPalette(p.label, i); }}
                            className={`w-5 h-5 rounded-sm border transition-all ${
                              isReadOnly ? 'border-zinc-700 cursor-grab' : 'border-zinc-700 cursor-grab hover:scale-110'
                            } ${dragColor && !isReadOnly ? 'ring-1 ring-zinc-500' : ''}`}
                            style={{ backgroundColor: c }}
                            title={`${c}${isReadOnly ? ' (lecture seule)' : ' — glisser pour copier'}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Duplicate button */}
                        <button
                          onClick={() => duplicatePalette(p.label)}
                          className="text-[9px] text-zinc-600 hover:text-zinc-300 transition"
                          title={`Dupliquer palette ${p.label}`}
                        >
                          <Copy size={10} />
                        </button>
                        {activePaletteLabel !== p.label ? (
                          <button
                            onClick={() => applyPaletteToAll(p.label)}
                            className="text-[9px] text-zinc-500 hover:text-yellow-400 transition whitespace-nowrap"
                          >
                            Définir pour tous
                          </button>
                        ) : (
                          <span className="text-[9px] text-yellow-400/60 whitespace-nowrap">active</span>
                        )}
                        {isReadOnly ? (
                          <span className="text-[9px] text-zinc-600 italic">fixe</span>
                        ) : (
                          <button
                            onClick={() => {
                              setPalettes((prev) => prev.filter((pp) => pp.label !== p.label));
                              if (activePaletteLabel === p.label) setActivePaletteLabel("A");
                              setBlockPalettes((prev) => {
                                const next = { ...prev };
                                for (const k in next) { if (next[k] === p.label) delete next[k]; }
                                return next;
                              });
                              setStatusMsg(`Palette ${p.label} supprimée`);
                            }}
                            className="text-[9px] text-zinc-600 hover:text-red-400 transition"
                            title={`Supprimer palette ${p.label}`}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add palette from URL */}
              <div className="flex gap-1.5">
                <input
                  value={paletteUrl}
                  onChange={(e) => setPaletteUrl(e.target.value)}
                  placeholder="URL pour aspirer palette..."
                  className="flex-1 bg-zinc-950 text-[11px] text-zinc-300 px-2 py-1 rounded border border-zinc-800 focus:outline-none focus:border-zinc-600"
                  onKeyDown={(e) => e.key === 'Enter' && extractPaletteFromUrl()}
                />
                <button
                  onClick={extractPaletteFromUrl}
                  disabled={extractingPalette || !paletteUrl.trim()}
                  className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded hover:text-zinc-200 disabled:opacity-30 transition whitespace-nowrap"
                >
                  {extractingPalette ? <Loader2 size={10} className="animate-spin inline" /> : <Globe size={10} className="inline" />}
                  {' '}Aspirer
                </button>
              </div>

              {/* Add palette manually */}
              <div className="flex gap-1.5">
                <input
                  value={newPaletteColors}
                  onChange={(e) => setNewPaletteColors(e.target.value)}
                  placeholder="#2D9F46, #FFE500, #1A1A1A..."
                  className="flex-1 bg-zinc-950 text-[11px] text-zinc-300 px-2 py-1 rounded border border-zinc-800 focus:outline-none focus:border-zinc-600"
                  onKeyDown={(e) => e.key === 'Enter' && addManualPalette()}
                />
                <button
                  onClick={addManualPalette}
                  className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded hover:text-zinc-200 transition whitespace-nowrap"
                >
                  + Palette
                </button>
              </div>
            </div>

            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <LayoutGrid size={16} className="text-yellow-400" />
              Arbre des blocs ({blocks.filter((b) => b.enabled).length}/{blocks.length} actifs)
            </h2>

            <div className="space-y-2">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={`rounded-xl border transition ${
                    block.enabled
                      ? "border-zinc-700 bg-zinc-900"
                      : "border-zinc-800 bg-zinc-900/50 opacity-60"
                  }`}
                >
                  {/* BLOCK HEADER */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button
                      onClick={() => toggleBlock(block.id)}
                      className="text-zinc-400 hover:text-zinc-200 transition"
                    >
                      {expandedBlocks.has(block.id) ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => toggleBlockEnabled(block.id)}
                      className="transition"
                    >
                      {block.enabled ? (
                        <ToggleRight size={20} className="text-yellow-400" />
                      ) : (
                        <ToggleLeft size={20} className="text-zinc-600" />
                      )}
                    </button>
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleBlock(block.id)}
                    >
                      <h3 className="text-sm font-semibold">{block.name}</h3>
                      <p className="text-xs text-zinc-500">
                        {block.description}
                      </p>
                    </div>
                    {(() => {
                      const activeFields = block.fields.filter((f) => f.mode !== 'original');
                      const activeAndFilled = activeFields.filter((f) => f.value);
                      const allActiveFilled = activeFields.length > 0 && activeAndFilled.length === activeFields.length;
                      return (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-600">
                            {block.fields.filter((f) => f.value).length}/{block.fields.length}
                          </span>
                          {allActiveFilled && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-green-500/20 text-green-400">
                              rempli
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    <button
                      onClick={() => toggleBlockMode(block.id)}
                      className="flex items-center gap-1 text-zinc-400 hover:text-yellow-400 px-1.5 py-1 rounded text-xs transition"
                      title="Cocher/décocher tous les champs du bloc"
                    >
                      {block.fields.every((f) => f.mode !== 'original') ? (
                        <CheckSquare size={14} className="text-yellow-400" />
                      ) : (
                        <Square size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => generateAllBlock(block)}
                      disabled={generating || !markdown.trim()}
                      className="flex items-center gap-1 bg-yellow-400/15 text-yellow-400 px-2 py-1 rounded text-xs font-medium hover:bg-yellow-400/25 disabled:opacity-30 transition"
                      title="Générer tous les champs de ce bloc"
                    >
                      <Sparkles size={12} />
                      Générer
                    </button>
                    {/* Palette selector per block */}
                    <select
                      value={blockPalettes[block.id] || activePaletteLabel}
                      onChange={(e) => setBlockPalettes((prev) => ({ ...prev, [block.id]: e.target.value }))}
                      className="bg-zinc-800 text-[10px] text-zinc-400 px-1 py-0.5 rounded border border-zinc-700 focus:outline-none"
                      title="Palette de ce bloc"
                    >
                      {palettes.map((p) => (
                        <option key={p.label} value={p.label}>
                          Palette {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* BLOCK FIELDS */}
                  {expandedBlocks.has(block.id) && block.enabled && (
                    <div className="px-4 pb-3 space-y-2">
                      {block.fields.map((field) => (
                        <div
                          key={field.id}
                          className="rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden"
                        >
                          {/* FIELD HEADER */}
                          <div
                            className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-900/50 transition"
                          >
                            <span
                              className={`text-zinc-500 ${field.mode === 'original' ? 'opacity-40' : ''}`}
                            >
                              {fieldIcon(field.type)}
                            </span>
                            <span
                              className={`text-xs font-medium flex-1 cursor-pointer ${field.mode === 'original' ? 'opacity-40' : ''}`}
                              onClick={() => toggleField(field.id)}
                            >
                              {field.label}
                            </span>
                            
                            {/* MODE SELECTOR — switch neutre */}
                            <div className="flex items-center bg-zinc-800 rounded-md p-0.5">
                              {(['generated', 'manual', 'original'] as const).map((m) => (
                                <button
                                  key={m}
                                  onClick={(e) => { e.stopPropagation(); updateFieldMode(block.id, field.id, m); }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                                    field.mode === m
                                      ? 'bg-zinc-600 text-white'
                                      : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                                >
                                  {m === 'generated' ? 'Généré' : m === 'manual' ? 'Manuel' : 'Original'}
                                </button>
                              ))}
                            </div>

                            {/* Bouton Générer individuel */}
                            {field.mode !== 'original' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (field.type === 'image') {
                                    generateSingleField(block.id, field);
                                  } else {
                                    generateSingleField(block.id, field);
                                  }
                                }}
                                disabled={generatingField === field.id || !markdown.trim()}
                                className="flex items-center gap-1 bg-yellow-400/15 text-yellow-400 px-1.5 py-0.5 rounded text-[10px] font-medium hover:bg-yellow-400/25 disabled:opacity-30 transition"
                                title="Générer ce champ"
                              >
                                {generatingField === field.id ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                              </button>
                            )}

                            {field.mode !== 'original' && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  field.value
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-zinc-800 text-zinc-500"
                                }`}
                              >
                                {field.value ? "rempli" : "vide"}
                              </span>
                            )}
                            <button
                              onClick={() => toggleField(field.id)}
                              className="shrink-0 text-zinc-500 hover:text-zinc-300 transition"
                            >
                              {expandedFields.has(field.id) ? (
                                <ChevronDown size={14} />
                              ) : (
                                <ChevronRight size={14} />
                              )}
                            </button>
                          </div>

                          {/* FIELD CONTENT */}
                          {expandedFields.has(field.id) && (
                            <div className="px-3 pb-3 space-y-2">
                              {field.type === "image" ? (
                                /* ═══ IMAGE FIELD — UI spécifique par mode ═══ */
                                <>
                                  {field.mode === "original" && (
                                    /* ── ORIGINAL: miniature de l'image modèle ── */
                                    <div className="flex flex-col items-center gap-2 py-3">
                                      {field.originalImageUrl ? (
                                        <img
                                          src={field.originalImageUrl}
                                          alt={field.label}
                                          className="rounded-lg max-h-56 object-contain border border-zinc-700"
                                        />
                                      ) : (
                                        <p className="text-xs text-zinc-500 italic">Pas d&apos;image originale définie</p>
                                      )}
                                      <span className="text-[10px] text-zinc-500">Image originale du site modèle</span>
                                    </div>
                                  )}

                                  {field.mode === "manual" && (
                                    /* ── MANUEL: upload seulement ── */
                                    <div className="flex flex-col items-center gap-3 py-3">
                                      {field.value?.startsWith("data:image") ? (
                                        <div className="relative group">
                                          <img
                                            src={field.value}
                                            alt={field.label}
                                            className="rounded-lg max-h-56 object-contain border border-zinc-700"
                                          />
                                          <button
                                            onClick={() => triggerImageUpload(block.id, field.id)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                          >
                                            <Upload size={24} className="text-white" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => triggerImageUpload(block.id, field.id)}
                                          className="flex items-center gap-2 bg-blue-400/20 text-blue-400 px-4 py-3 rounded-lg text-xs font-medium hover:bg-blue-400/30 transition"
                                        >
                                          <Upload size={16} />
                                          Uploader une image
                                        </button>
                                      )}
                                      {field.targetWidth && field.targetHeight && (
                                        <span className="text-[10px] text-zinc-500">
                                          Format cible : {field.targetWidth}&times;{field.targetHeight} px
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {field.mode === "generated" && (
                                    /* ── GÉNÉRER: prompt image + style + boutons ── */
                                    <div className="space-y-3">
                                      {/* Prompt d'image */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                                            Prompt d&apos;image
                                          </label>
                                          <button
                                            onClick={() => generateSingleField(block.id, field)}
                                            disabled={generatingField === field.id || !markdown.trim()}
                                            className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded text-[10px] font-medium hover:bg-yellow-400/20 disabled:opacity-30 transition"
                                          >
                                            {generatingField === field.id ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                            Générer prompt
                                          </button>
                                        </div>
                                        <textarea
                                          value={field.imagePrompt || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setBlocks((prev) =>
                                              prev.map((b) =>
                                                b.id === block.id
                                                  ? { ...b, fields: b.fields.map((f) => f.id === field.id ? { ...f, imagePrompt: val } : f) }
                                                  : b
                                              )
                                            );
                                          }}
                                          placeholder="Décrivez le sujet et le cadrage de l'image..."
                                          className="w-full bg-zinc-900 text-xs text-zinc-300 p-2 rounded border border-zinc-800 resize-none focus:outline-none focus:border-purple-400/50 min-h-[60px]"
                                          rows={3}
                                        />
                                      </div>

                                      {/* Style visuel */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                                            Style visuel
                                          </label>
                                          <button
                                            onClick={() => triggerStyleUpload(block.id, field.id)}
                                            disabled={generatingStyle === field.id}
                                            className="flex items-center gap-1 bg-pink-400/10 text-pink-400 px-2 py-0.5 rounded text-[10px] font-medium hover:bg-pink-400/20 disabled:opacity-30 transition"
                                          >
                                            {generatingStyle === field.id ? <Loader2 size={10} className="animate-spin" /> : <ImageIcon size={10} />}
                                            Extraire style depuis image
                                          </button>
                                        </div>
                                        <textarea
                                          value={field.imageStyle || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setBlocks((prev) =>
                                              prev.map((b) =>
                                                b.id === block.id
                                                  ? { ...b, fields: b.fields.map((f) => f.id === field.id ? { ...f, imageStyle: val } : f) }
                                                  : b
                                              )
                                            );
                                          }}
                                          placeholder="Ex: Photographie professionnelle, éclairage studio, tons chauds..."
                                          className="w-full bg-zinc-900 text-xs text-zinc-300 p-2 rounded border border-zinc-800 resize-none focus:outline-none focus:border-pink-400/50 min-h-[40px]"
                                          rows={2}
                                        />
                                      </div>

                                      {/* Bouton générer image + preview */}
                                      <div className="flex items-start gap-3">
                                        <button
                                          onClick={() => generateImage(block.id, field)}
                                          disabled={generatingImage === field.id || (!field.imagePrompt && !field.imageStyle)}
                                          className="flex items-center gap-1 bg-purple-400/10 text-purple-400 px-3 py-2 rounded-lg text-[11px] font-medium hover:bg-purple-400/20 disabled:opacity-30 transition shrink-0"
                                        >
                                          {generatingImage === field.id ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                                          Générer image
                                        </button>
                                        {field.value?.startsWith("data:image") && (
                                          <img
                                            src={field.value}
                                            alt={field.label}
                                            className="rounded-lg max-h-40 object-contain border border-zinc-700"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                /* ═══ CHAMP TEXTE — UI standard ═══ */
                                <>
                                  {/* PROMPT */}
                                  <div>
                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                                      Prompt
                                    </label>
                                    <textarea
                                      value={field.prompt}
                                      onChange={(e) =>
                                        updateFieldPrompt(block.id, field.id, e.target.value)
                                      }
                                      className="w-full bg-zinc-900 text-xs text-zinc-300 p-2 rounded border border-zinc-800 resize-none focus:outline-none focus:border-yellow-400/50 min-h-[60px]"
                                      rows={3}
                                    />
                                  </div>

                                  {/* VALUE */}
                                  <div>
                                    <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                                      {field.mode === 'manual' ? 'Valeur manuelle' : field.mode === 'generated' ? 'Valeur générée' : 'Valeur originale'}
                                    </label>
                                    <textarea
                                      value={field.value}
                                      onChange={(e) => updateFieldValue(block.id, field.id, e.target.value)}
                                      placeholder={
                                        field.mode === 'manual'
                                          ? "Saisie libre..."
                                          : field.mode === 'original'
                                          ? "Contenu original..."
                                          : "Contenu généré par l'IA..."
                                      }
                                      disabled={field.mode === 'original'}
                                      className="w-full bg-zinc-900 text-xs text-zinc-300 p-2 rounded border border-zinc-800 resize-none focus:outline-none focus:border-green-400/50 min-h-[40px]"
                                      rows={field.type === "cards" || field.type === "list" ? 5 : 2}
                                    />
                                  </div>

                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SAVE CONFIG MODAL ─────────────────────────────────────────── */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-[400px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Save size={16} className="text-yellow-400" /> Sauvegarder la configuration</h3>
              <button onClick={() => setShowSaveModal(false)}><X size={18} className="text-zinc-400 hover:text-zinc-200" /></button>
            </div>
            <label className="text-xs text-zinc-400 block mb-1">Nom *</label>
            <input
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="w-full bg-zinc-800 text-sm text-zinc-100 px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-yellow-400/50 mb-3"
              placeholder="Nom de la configuration..."
            />
            <label className="text-xs text-zinc-400 block mb-1">Description (optionnel)</label>
            <input
              value={saveDesc}
              onChange={(e) => setSaveDesc(e.target.value)}
              className="w-full bg-zinc-800 text-sm text-zinc-100 px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-yellow-400/50 mb-4"
              placeholder="Notes sur cette config..."
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-sm bg-zinc-800 rounded-lg hover:bg-zinc-700 transition">Annuler</button>
              <button onClick={saveConfig} className="px-4 py-2 text-sm bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition">
                {currentConfigId ? "Mettre à jour" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIGS PANEL ─────────────────────────────────────────────── */}
      {showConfigsPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="font-semibold text-sm flex items-center gap-2"><FolderOpen size={16} className="text-yellow-400" /> Configurations sauvegardées</h3>
              <button onClick={() => setShowConfigsPanel(false)}><X size={18} className="text-zinc-400 hover:text-zinc-200" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {configs.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-8">Aucune configuration sauvegardée</p>
              )}
              {configs.map((c) => (
                <div key={c.id} className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.name}</div>
                    {c.description && <div className="text-xs text-zinc-500 truncate">{c.description}</div>}
                    <div className="text-[10px] text-zinc-600 mt-0.5">{new Date(c.updatedAt).toLocaleString("fr-FR")}</div>
                  </div>
                  <button onClick={() => loadConfig(c.id)} className="text-xs bg-yellow-400/10 text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-yellow-400/20 transition font-medium">Ouvrir</button>
                  <button onClick={() => deleteConfig(c.id, c.name)} className="text-zinc-500 hover:text-red-400 transition p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SAVE LANDING MODAL ────────────────────────────────────────── */}
      {saveLandingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-[400px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Globe size={16} className="text-green-400" /> Publier la landing</h3>
              <button onClick={() => setSaveLandingModal(false)}><X size={18} className="text-zinc-400 hover:text-zinc-200" /></button>
            </div>
            <label className="text-xs text-zinc-400 block mb-1">Nom de la landing *</label>
            <input
              autoFocus
              value={saveLandingName}
              onChange={(e) => setSaveLandingName(e.target.value)}
              className="w-full bg-zinc-800 text-sm text-zinc-100 px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-green-400/50 mb-3"
              placeholder="Nom de la landing..."
            />
            <label className="text-xs text-zinc-400 block mb-1">Segment d’URL (optionnel)</label>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-zinc-500">…com/</span>
              <input
                value={saveLandingSlug}
                onChange={(e) => setSaveLandingSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                className="flex-1 bg-zinc-800 text-sm text-zinc-100 px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-green-400/50"
                placeholder="(par défaut = nom nettoyé)"
              />
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Par défaut l’adresse est <span className="text-zinc-400">https://ton-domaine/</span>
              <span className="font-mono text-zinc-400">nom-nettoyé</span> (ex. « test1 » →{" "}
              <span className="font-mono text-zinc-400">/test1</span>). Remplis ce champ seulement pour un chemin différent du nom.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSaveLandingModal(false)} className="px-4 py-2 text-sm bg-zinc-800 rounded-lg hover:bg-zinc-700 transition">Annuler</button>
              <button onClick={saveLanding} className="px-4 py-2 text-sm bg-green-500 text-white font-semibold rounded-lg hover:bg-green-400 transition">Publier</button>
            </div>
          </div>
        </div>
      )}

      {/* ── LANDINGS PANEL ────────────────────────────────────────────── */}
      {showLandingsPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Globe size={16} className="text-green-400" /> Landings publiées</h3>
              <button onClick={() => setShowLandingsPanel(false)}><X size={18} className="text-zinc-400 hover:text-zinc-200" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {landings.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-8">Aucune landing publiée</p>
              )}
              {landings.map((l) => (
                <div key={l.id} className="flex items-center gap-3 bg-zinc-800 rounded-xl px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.name}</div>
                    <div className="text-[10px] text-zinc-600 font-mono mt-0.5 truncate">
                      {l.slug ? `/${l.slug}` : `/l/${l.id}`}
                    </div>
                    <div className="text-[10px] text-zinc-600">{new Date(l.createdAt).toLocaleString("fr-FR")}</div>
                  </div>
                  <button
                    onClick={() => window.open(l.slug ? `/${l.slug}` : `/l/${l.id}`, "_blank")}
                    className="text-xs bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition font-medium"
                  >
                    Ouvrir
                  </button>
                  <button
                    onClick={() => copyLink(l.id, l.slug)}
                    className="text-zinc-400 hover:text-zinc-200 transition p-1"
                    title="Copier le lien"
                  >
                    {copiedId === l.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                  {!l.slug && (
                    <button
                      type="button"
                      onClick={() => void syncLandingSlugFromName(l.id)}
                      className="text-[10px] text-yellow-400/90 hover:text-yellow-300 px-2 py-1 rounded border border-yellow-500/30 whitespace-nowrap"
                      title="Créer /nom à partir du titre affiché"
                    >
                      URL = nom
                    </button>
                  )}
                  <button onClick={() => deleteLanding(l.id, l.name)} className="text-zinc-500 hover:text-red-400 transition p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {cropModal && (
        <ImageCropModal
          imageDataUrl={cropModal.imageDataUrl}
          targetWidth={cropModal.targetWidth}
          targetHeight={cropModal.targetHeight}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropModal(null)}
        />
      )}
    </div>
  );
}
