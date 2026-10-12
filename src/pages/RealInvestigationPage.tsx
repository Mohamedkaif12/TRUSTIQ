import React, { useState, useRef } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Activity, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info,
  Image as ImageIcon,
  Mic,
  FileAudio,
  Upload,
  X,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { RealInvestigationResult } from '../types';
import { sound } from '../utils/audio';

const PRESET_EXAMPLES = [
  {
    label: "Electricity Bill Scam",
    sender: "Electricity Dept (Personal Mobile)",
    text: "Dear Customer, your electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill of Rs. 4,280. Call electricity officer immediately at 9876543210 to avoid disconnection."
  },
  {
    label: "SBI YONO Phishing",
    sender: "SBI Security Desk",
    text: "URGENT: Your SBI YONO Account is blocked due to incomplete KYC! Update PAN card immediately by clicking http://sbi-kyc-update.xyz or your account will be permanently deactivated within 24 hours."
  },
  {
    label: "Fake Laptop Scheme",
    sender: "PM Welfare Portal",
    text: "Free government laptop scheme 2026: Prime minister distribution scheme for all students. Register immediately at http://pm-laptop-yojana.buzz before midnight today!"
  },
  {
    label: "Genuine Municipal Notice",
    sender: "Municipal Water Board",
    text: "Attention residents: Water supply will be interrupted in Sector 4 between 2 PM and 5 PM for scheduled pipeline maintenance as per notice #MWB-2026-OCT."
  },
  {
    label: "Viral Health Hoax",
    sender: "Health Wellness Forward",
    text: "Shocking news: Drinking hot lemon water with baking soda kills 100% of cancer cells instantly. Doctors are hiding this miracle cure! Forward to 15 people."
  }
];

type InputMode = 'text' | 'image' | 'audio';

export const RealInvestigationPage: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [inputText, setInputText] = useState(PRESET_EXAMPLES[0].text);
  const [sender, setSender] = useState(PRESET_EXAMPLES[0].sender);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RealInvestigationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunInvestigation = async () => {
    if (inputMode === 'text' && !inputText.trim()) return;
    if ((inputMode === 'image' || inputMode === 'audio') && !uploadedFile && !inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    sound.playScan();

    try {
      // For image/audio: send filename + mode as context in the text field if no extracted text
      let textToAnalyze = inputText;
      if ((inputMode === 'image' || inputMode === 'audio') && uploadedFile && !inputText.trim()) {
        textToAnalyze = `[${inputMode.toUpperCase()} FILE: ${uploadedFile.name}] No additional text provided. Analyze file metadata and context for signs of manipulation or disinformation.`;
      }

      const res = await api.realInvestigation(textToAnalyze, sender, url);
      setResult(res);
      sound.playSuccess();
    } catch (err: any) {
      console.error('Real investigation failed:', err);
      setError(err.message || 'Investigation request failed');
      sound.playWarning();
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (preset: typeof PRESET_EXAMPLES[0]) => {
    sound.playClick();
    setInputText(preset.text);
    setSender(preset.sender);
    setUrl('');
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setInputText('');
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreviewUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFilePreviewUrl(null);
    setInputText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const switchMode = (mode: InputMode) => {
    sound.playClick();
    setInputMode(mode);
    setUploadedFile(null);
    setFilePreviewUrl(null);
    setResult(null);
    setError(null);
    if (mode === 'text') {
      setInputText(PRESET_EXAMPLES[0].text);
      setSender(PRESET_EXAMPLES[0].sender);
    } else {
      setInputText('');
    }
  };

  const acceptByMode: Record<InputMode, string> = {
    text: '',
    image: 'image/jpeg,image/png,image/webp,image/gif',
    audio: 'audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/m4a,.mp3,.m4a,.wav,.ogg',
  };

  const modeLabel: Record<InputMode, string> = {
    text: 'Text / Message',
    image: 'Image / Screenshot',
    audio: 'Voice / Audio File',
  };

  const canSubmit = () => {
    if (isLoading) return false;
    if (inputMode === 'text') return inputText.trim().length > 0;
    return uploadedFile !== null || inputText.trim().length > 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 cyber-grid-bg">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-cyan-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MODE 2 // REAL-WORLD INVESTIGATION LAB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide">
            ARBITRARY MESSAGE FORENSICS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Ingest any suspicious message, image, voice message, or audio file through the unified forensic pipeline.
            No hidden ground truth is assumed.
          </p>
        </div>
      </div>

      {/* ── Mode Tabs ── */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800 w-fit">
        {(['text', 'image', 'audio'] as InputMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => switchMode(mode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wide transition-all ${
              inputMode === mode
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {mode === 'text' && <Search className="w-3.5 h-3.5" />}
            {mode === 'image' && <ImageIcon className="w-3.5 h-3.5" />}
            {mode === 'audio' && <Mic className="w-3.5 h-3.5" />}
            <span>{modeLabel[mode]}</span>
          </button>
        ))}
      </div>

      {/* ── Ingestion Form ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">

            {/* TEXT MODE */}
            {inputMode === 'text' && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono-code text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Message Text / Claim to Ingest</span>
                  </label>
                  <span className="text-[10px] font-mono-code text-slate-500">
                    {inputText.length} chars
                  </span>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste raw text, forward, notification, or suspicious message here..."
                  rows={5}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm font-mono-code text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all resize-y"
                />
              </>
            )}

            {/* IMAGE MODE */}
            {inputMode === 'image' && (
              <>
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-slate-300 uppercase tracking-wider">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload Image / Screenshot</span>
                  <span className="text-slate-600 ml-1">JPG · PNG · WebP</span>
                </div>
                {!uploadedFile ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropZoneDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                      isDragging
                        ? 'border-cyan-400 bg-cyan-950/30'
                        : 'border-slate-700 bg-slate-900/40 hover:border-cyan-500/50 hover:bg-slate-900/60'
                    }`}
                  >
                    <Upload className="w-8 h-8 text-slate-500" />
                    <p className="text-sm text-slate-400 font-mono">Drag & drop or click to upload</p>
                    <p className="text-xs text-slate-600">Supports JPG, PNG, WebP, GIF</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    {filePreviewUrl && (
                      <img src={filePreviewUrl} alt="Preview" className="w-full max-h-52 object-contain" />
                    )}
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <ImageIcon className="w-4 h-4 text-cyan-400" />
                        <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
                        <span className="text-slate-500">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button onClick={clearFile} className="p-1 rounded-lg hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-mono-code text-slate-400 block mb-1">
                    Additional context / caption text (optional)
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Describe what's in the image, or paste any text shown in it..."
                    rows={3}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm font-mono-code text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all resize-none"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptByMode.image}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </>
            )}

            {/* AUDIO MODE */}
            {inputMode === 'audio' && (
              <>
                <div className="flex items-center gap-1.5 text-xs font-mono-code text-slate-300 uppercase tracking-wider">
                  <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Upload Voice Message / Audio File</span>
                  <span className="text-slate-600 ml-1">MP3 · M4A · WAV · OGG</span>
                </div>
                {!uploadedFile ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropZoneDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                      isDragging
                        ? 'border-pink-400 bg-pink-950/30'
                        : 'border-slate-700 bg-slate-900/40 hover:border-pink-500/50 hover:bg-slate-900/60'
                    }`}
                  >
                    <Mic className="w-8 h-8 text-slate-500" />
                    <p className="text-sm text-slate-400 font-mono">Drag & drop or click to upload audio</p>
                    <p className="text-xs text-slate-600">Supports MP3, M4A, WAV, OGG voice messages</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-pink-950/60 border border-pink-500/30 flex items-center justify-center">
                        <FileAudio className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-slate-200 truncate max-w-[200px]">{uploadedFile.name}</div>
                        <div className="text-[10px] text-slate-500">{(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.type}</div>
                      </div>
                    </div>
                    <button onClick={clearFile} className="p-1 rounded-lg hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-mono-code text-slate-400 block mb-1">
                    Transcript / spoken text (optional — paste what was said)
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste the transcript or any spoken text from the audio for deeper analysis..."
                    rows={3}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm font-mono-code text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all resize-none"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptByMode.audio}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono-code text-slate-400 block mb-1">
                  Claimed Sender / Source
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g. Bank Customer Care, State Gov"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono-code text-slate-200 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono-code text-slate-400 block mb-1">
                  Optional Target URL / Domain
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. http://sbi-kyc.xyz"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono-code text-slate-200 focus:outline-none focus:border-cyan-500/60"
                />
              </div>
            </div>

            <button
              onClick={handleRunInvestigation}
              disabled={!canSubmit()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-heading font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>EXECUTING FORENSIC PIPELINE...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>RUN FULL FORENSIC INVESTIGATION</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200" />
                </>
              )}
            </button>
          </div>

          {/* Quick Presets (text mode only) */}
          {inputMode === 'text' && (
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono-code text-slate-400 block mb-2">
                QUICK TEST ARCHETYPES:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_EXAMPLES.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPreset(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono-code text-slate-300 hover:text-cyan-300 transition-all text-left"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Panel: How It Works ── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-mono-code text-cyan-400 font-bold">
              <Cpu className="w-4 h-4" />
              <span>FORENSIC PIPELINE STAGES</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="font-mono-code text-cyan-400 font-bold block">1. Z-SCORE STATISTICAL ENGINE</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Calculates <code>Z = (x − μ) / σ</code> against baseline communication distributions to detect extreme linguistic anomalies.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="font-mono-code text-indigo-400 font-bold block">2. RANDOM FOREST CLASSIFIER</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Trained model evaluates 23 deterministic features to predict calibrated Risk Score (0–100) and probability class.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="font-mono-code text-amber-400 font-bold block">3. NOVA CONTEXTUAL ASSISTANT</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Synthesizes anomalies, ML risk patterns, and context to deliver structured reasoning and tactical advice.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="font-mono-code text-emerald-400 font-bold block">4. OFFICIAL EVIDENCE REGISTRY</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Cross-references claims against verified government, banking, and fact-checking advisories.
                </p>
              </div>
            </div>

            {/* Supported Formats */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono-code text-slate-500 uppercase">Supported Input Formats</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: <Search className="w-3 h-3" />, label: 'Text / SMS', color: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20' },
                  { icon: <ImageIcon className="w-3 h-3" />, label: 'Image / Screenshot', color: 'text-violet-300 border-violet-500/30 bg-violet-950/20' },
                  { icon: <Mic className="w-3 h-3" />, label: 'Voice Message', color: 'text-pink-300 border-pink-500/30 bg-pink-950/20' },
                  { icon: <FileAudio className="w-3 h-3" />, label: 'Audio File', color: 'text-amber-300 border-amber-500/30 bg-amber-950/20' },
                ].map((item, i) => (
                  <span key={i} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-mono font-bold ${item.color}`}>
                    {item.icon}
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono-code flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Investigation Results Dossier ── */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Risk Indicators Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. ML Risk Score Card */}
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-cyan-950/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-code text-cyan-400 font-bold flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>RANDOM FOREST RISK</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase ${
                  result.ml_risk.risk_class === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                  result.ml_risk.risk_class === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {result.ml_risk.risk_class} RISK
                </span>
              </div>

              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl font-heading font-black text-white">
                  {result.ml_risk.score}
                </span>
                <span className="text-xs font-mono-code text-slate-400">/ 100</span>
              </div>

              <div className="space-y-1.5 mt-3">
                <div className="flex justify-between text-[11px] font-mono-code text-slate-400">
                  <span>Model Confidence</span>
                  <span className="text-cyan-300 font-bold">{result.ml_risk.confidence}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-700"
                    style={{ width: `${result.ml_risk.confidence}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-mono-code text-slate-400 block mb-1">
                  TOP DRIVER FEATURES:
                </span>
                <div className="flex flex-wrap gap-1">
                  {result.ml_risk.top_features.map((f, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono-code text-cyan-300">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Statistical Anomaly Summary Card */}
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 to-indigo-950/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-code text-indigo-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>Z-SCORE DEVIATION</span>
                </span>
                <span className="text-[10px] font-mono-code text-indigo-300">
                  MAX |Z|: {result.statistical_summary.max_z_score}
                </span>
              </div>

              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl font-heading font-black text-white">
                  {result.statistical_summary.anomalies_detected}
                </span>
                <span className="text-xs font-mono-code text-slate-400">
                  / {result.statistical_summary.total_signals_evaluated} anomalies
                </span>
              </div>

              <div className="space-y-2 mt-3 max-h-32 overflow-y-auto pr-1">
                {result.statistical_signals.map((sig, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-mono-code p-1.5 rounded bg-slate-950/50 border border-slate-800/60">
                    <span className="text-slate-300">{sig.label}</span>
                    <span className={`font-bold px-1 rounded ${
                      sig.severity === 'critical' ? 'text-rose-400 bg-rose-950/60' :
                      sig.severity === 'high' ? 'text-amber-400 bg-amber-950/60' :
                      sig.severity === 'medium' ? 'text-cyan-400 bg-cyan-950/60' :
                      'text-slate-400'
                    }`}>
                      Z = {sig.z_score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. NOVA Status & Recommendation Card */}
            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 to-emerald-950/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-code text-emerald-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>NOVA DOSSIER</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  {result.nova_dossier.status}
                </span>
              </div>

              <div className="my-2">
                <span className="text-xs font-mono-code text-slate-400 block">Recommended Action</span>
                <span className="text-2xl font-heading font-black text-emerald-300">
                  {result.nova_dossier.recommended_action}
                </span>
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono-code text-slate-300 leading-relaxed max-h-32 overflow-y-auto">
                <span className="text-[10px] text-cyan-400 block font-bold mb-0.5">CONTEXTUAL REASONING:</span>
                {result.nova_dossier.reasoning}
              </div>
            </div>
          </div>

          {/* ── Official Evidence & Registries ── */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-heading font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>OFFICIAL EVIDENCE & REGISTRY CROSS-CHECKS</span>
              </h3>
              <span className="text-xs font-mono-code text-slate-400">
                {result.evidence_verification.length} sources referenced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.evidence_verification.map((ev, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-white">
                      {ev.source_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold ${
                      ev.support_level === 'CONTRADICTED' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                      ev.support_level === 'SUPPORTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                      ev.support_level === 'PARTIALLY_SUPPORTED' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {ev.support_level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {ev.summary}
                  </p>

                  {ev.source_url && (
                    <a
                      href={ev.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono-code text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>View Official Registry</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Responsible AI Disclaimer ── */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono-code text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="text-slate-200 font-bold">RESPONSIBLE AI GOVERNANCE: </span>
              {result.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
