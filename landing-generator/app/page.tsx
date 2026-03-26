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
} from "lucide-react";

type ConfigSummary = { id: string; name: string; description?: string | null; updatedAt: string };
type LandingSummary = { id: string; name: string; createdAt: string };
import { defaultBlockSchema, Block, BlockField, FieldMode } from "./lib/blockSchema";
import { generateLandingHTML } from "./lib/htmlGenerator";

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
  const [statusMsg, setStatusMsg] = useState("");
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
  
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !uploadingImageTarget) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        updateFieldValue(uploadingImageTarget.blockId, uploadingImageTarget.fieldId, dataUrl);
        setStatusMsg(`Image "${file.name}" uploadée (${(file.size / 1024).toFixed(1)} Ko)`);
        setUploadingImageTarget(null);
      };
      reader.readAsDataURL(file);
    },
    [uploadingImageTarget]
  );

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
      updateFieldValue(blockId, field.id, data.content);
      setStatusMsg(`"${field.label}" généré avec succès`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMsg(`Erreur: ${msg}`);
    } finally {
      setGeneratingField(null);
    }
  };

  const generateImage = async (blockId: string, field: BlockField) => {
    if (!field.imagePrompt) return;
    setGeneratingImage(field.id);
    setStatusMsg(`Génération de l'image "${field.label}"...`);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: field.imagePrompt }),
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
      const body = { name: saveName, description: saveDesc, markdown, blocks: JSON.stringify(blocks) };
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
      const html = generateLandingHTML(blocks);
      const res = await fetch("/api/landings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saveLandingName, configId: currentConfigId, html }),
      });
      const data = await res.json();
      setSaveLandingModal(false);
      setSaveLandingName("");
      setStatusMsg(`Landing "${data.name}" sauvegardée — lien : /l/${data.id}`);
    } catch { setStatusMsg("Erreur lors de la sauvegarde de la landing"); }
  };

  const deleteLanding = async (id: string, name: string) => {
    await fetch(`/api/landings/${id}`, { method: "DELETE" });
    setLandings((prev) => prev.filter((l) => l.id !== id));
    setStatusMsg(`Landing "${name}" supprimée`);
  };

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/l/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openPreview = () => {
    const html = generateLandingHTML(blocks);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const downloadHTML = () => {
    const html = generateLandingHTML(blocks);
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
                      className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded text-xs font-medium hover:bg-yellow-400/20 disabled:opacity-30 transition"
                    >
                      <RefreshCw size={12} />
                      Bloc
                    </button>
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
                            
                            {/* MODE SELECTOR */}
                            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateFieldMode(block.id, field.id, 'generated');
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                                  field.mode === 'generated'
                                    ? 'bg-yellow-400 text-black'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                                title="Utiliser le contenu généré par l'IA"
                              >
                                <Sparkles size={12} className="inline mr-0.5" />
                                Générer
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateFieldMode(block.id, field.id, 'manual');
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                                  field.mode === 'manual'
                                    ? 'bg-blue-400 text-black'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                                title="Saisie libre ou upload d'image"
                              >
                                Manuel
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateFieldMode(block.id, field.id, 'original');
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                                  field.mode === 'original'
                                    ? 'bg-zinc-700 text-white'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                                title="Utiliser le contenu original"
                              >
                                Original
                              </button>
                            </div>

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
                              {/* PROMPT */}
                              <div>
                                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                                  Prompt
                                </label>
                                <textarea
                                  value={field.prompt}
                                  onChange={(e) =>
                                    updateFieldPrompt(
                                      block.id,
                                      field.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-zinc-900 text-xs text-zinc-300 p-2 rounded border border-zinc-800 resize-none focus:outline-none focus:border-yellow-400/50 min-h-[60px]"
                                  rows={3}
                                />
                              </div>

                              {/* IMAGE PROMPT (si type image) */}
                              {field.type === "image" && field.imagePrompt && (
                                <div>
                                  <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                                    Prompt image (GPT-image-1.5)
                                  </label>
                                  <textarea
                                    value={field.imagePrompt}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setBlocks((prev) =>
                                        prev.map((b) =>
                                          b.id === block.id
                                            ? {
                                                ...b,
                                                fields: b.fields.map((f) =>
                                                  f.id === field.id
                                                    ? {
                                                        ...f,
                                                        imagePrompt: val,
                                                      }
                                                    : f
                                                ),
                                              }
                                            : b
                                        )
                                      );
                                    }}
                                    className="w-full bg-zinc-900 text-xs text-zinc-300 p-2 rounded border border-zinc-800 resize-none focus:outline-none focus:border-purple-400/50 min-h-[60px]"
                                    rows={3}
                                  />
                                </div>
                              )}

                              {/* VALUE */}
                              <div>
                                <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                                  {field.mode === 'manual' ? 'Valeur manuelle' : field.mode === 'generated' ? 'Valeur générée' : 'Valeur originale'}
                                </label>
                                {field.type === "image" ? (
                                  field.value?.startsWith("data:image") ? (
                                    <div className="relative group">
                                      <img
                                        src={field.value}
                                        alt={field.label}
                                        className="rounded-lg max-h-48 object-contain"
                                      />
                                      {field.mode === 'manual' && (
                                        <button
                                          onClick={() => triggerImageUpload(block.id, field.id)}
                                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                        >
                                          <Upload size={24} className="text-white" />
                                        </button>
                                      )}
                                    </div>
                                  ) : field.mode === 'manual' ? (
                                    <div className="flex flex-col gap-2">
                                      <button
                                        onClick={() => triggerImageUpload(block.id, field.id)}
                                        className="flex items-center gap-2 bg-blue-400/20 text-blue-400 px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-400/30 transition"
                                      >
                                        <Upload size={14} />
                                        Uploader une image
                                      </button>
                                      <textarea
                                        value={field.value}
                                        onChange={(e) =>
                                          updateFieldValue(
                                            block.id,
                                            field.id,
                                            e.target.value
                                          )
                                        }
                                        placeholder="Ou saisir une URL d'image..."
                                        className="w-full bg-zinc-900 text-xs text-zinc-300 p-2 rounded border border-zinc-800 resize-none focus:outline-none focus:border-blue-400/50 min-h-[40px]"
                                        rows={2}
                                      />
                                    </div>
                                  ) : (
                                    <textarea
                                      value={field.value}
                                      onChange={(e) =>
                                        updateFieldValue(
                                          block.id,
                                          field.id,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Contenu généré..."
                                      className="w-full bg-zinc-900 text-xs text-zinc-300 p-2 rounded border border-zinc-800 resize-none focus:outline-none focus:border-green-400/50 min-h-[40px]"
                                      rows={2}
                                    />
                                  )
                                ) : (
                                  <textarea
                                    value={field.value}
                                    onChange={(e) =>
                                      updateFieldValue(
                                        block.id,
                                        field.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder={
                                      field.mode === 'manual' 
                                        ? "Saisie libre..." 
                                        : field.mode === 'original'
                                        ? "Contenu original..."
                                        : "Contenu généré par l'IA..."
                                    }
                                    disabled={field.mode === 'original'}
                                    className="w-full bg-zinc-900 text-xs text-zinc-300 p-2 rounded border border-zinc-800 resize-none focus:outline-none focus:border-green-400/50 min-h-[40px]"
                                    rows={
                                      field.type === "cards" ||
                                      field.type === "list"
                                        ? 5
                                        : 2
                                    }
                                  />
                                )}
                              </div>

                              {/* ACTIONS */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    generateSingleField(block.id, field)
                                  }
                                  disabled={
                                    generatingField === field.id ||
                                    !markdown.trim()
                                  }
                                  className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-2 py-1 rounded text-[11px] font-medium hover:bg-yellow-400/20 disabled:opacity-30 transition"
                                >
                                  {generatingField === field.id ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Sparkles size={12} />
                                  )}
                                  Générer texte
                                </button>
                                {field.type === "image" && (
                                  <button
                                    onClick={() =>
                                      generateImage(block.id, field)
                                    }
                                    disabled={
                                      generatingImage === field.id
                                    }
                                    className="flex items-center gap-1 bg-purple-400/10 text-purple-400 px-2 py-1 rounded text-[11px] font-medium hover:bg-purple-400/20 disabled:opacity-30 transition"
                                  >
                                    {generatingImage === field.id ? (
                                      <Loader2
                                        size={12}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <ImageIcon size={12} />
                                    )}
                                    Générer image
                                  </button>
                                )}
                              </div>
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
              className="w-full bg-zinc-800 text-sm text-zinc-100 px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-green-400/50 mb-4"
              placeholder="Nom de la landing..."
            />
            <p className="text-xs text-zinc-500 mb-4">La landing sera sauvegardée et accessible via un lien unique, sans repasser par l'UI.</p>
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
                    <div className="text-[10px] text-zinc-600 font-mono mt-0.5 truncate">/l/{l.id}</div>
                    <div className="text-[10px] text-zinc-600">{new Date(l.createdAt).toLocaleString("fr-FR")}</div>
                  </div>
                  <button
                    onClick={() => window.open(`/l/${l.id}`, "_blank")}
                    className="text-xs bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition font-medium"
                  >
                    Ouvrir
                  </button>
                  <button
                    onClick={() => copyLink(l.id)}
                    className="text-zinc-400 hover:text-zinc-200 transition p-1"
                    title="Copier le lien"
                  >
                    {copiedId === l.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                  <button onClick={() => deleteLanding(l.id, l.name)} className="text-zinc-500 hover:text-red-400 transition p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
