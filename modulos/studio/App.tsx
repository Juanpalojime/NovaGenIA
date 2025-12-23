import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from './components/Icon';
import { generateImage, editImage, upscaleImage } from './services/geminiService';
import { AspectRatio, HistoryItem, GenerationSettings } from './types';

const PLACEHOLDER_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuCrdqmGF0GK-qJw_m5z3Pec_zvQgRisbxq7gqFmMo4U0yqdpPaL7C3NRv6LRYenQTBZ47UulZAVNsndvuFcNcdotIHn_ECUDnWOisf2MYKqepaSO402SpPwieQEt0CJcwfOtRNc_xdl0KYq-dQSiwaXC4FvRLx4sDmKwtvgyoDKNfnZdf0L9WzjRRltYtNQev7Jlz9ZMCUfB9uuse4VplsgcZS_iHyGgNGzce0N64M1z_Ivy_8BBLg1lCUnywv6u3zvvXlPEfeAwR0";

const DEFAULT_SETTINGS: GenerationSettings = {
  model: "NeoRealism XL v4.0",
  aspectRatio: AspectRatio.SQUARE,
  guidanceScale: 7.5,
  steps: 30,
  seed: -1,
  negativePrompt: "ugly, deformed, noisy, blurry, distorted, out of focus, bad anatomy, extra limbs, poorly drawn face, poorly drawn hands, missing fingers",
};

const SAMPLE_HISTORY: HistoryItem[] = [
  { id: '1', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGTH23YySKnFHfWXss29jWEw9Tui1c56DRPROdjPohSj64LU-gmLE4QqhWDZLOipHCJrV9P2qE1Wgtc2XFTqpFeDaQavkY0O7OM4x2CoULd-j83f9CvrgvOLxxjFtsAtsy0aoCToqQLAB_km0F8Q8TEThYvpgMMIRHtbbXTka1grbyVqwQR2x-N0YedOHZInfzmBlHxamIYiris9ezr1wlKA6ai2m8R4egYD4IAMc2tOR196hEMsBw0wDYuE0CVBb2rbMll2HHBvI', prompt: 'Abstract neon fluid art', aspectRatio: '1:1', timestamp: Date.now() - 100000 },
  { id: '2', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6RtiQ-SHMp204u0j_UHc9KlcLxfeBMZCsVmcjKb7SKrmoj887vVXJ8UOlfTsKqbOhK3Y91QWvj3VuTPZQOO9sQf-Ovk8bTkvAmKFEqKELGZ-gNfkmoJtS8YQTujh7bR6Ek-oerepJej2EV6DIDFZqtvQsmjnxKVqz1w-LcCuuHILiIxkI6cg1Wc1O3Gand8zubYbLlToDV5YTWp6ouUP--sjlDp622n3MXRMKPbVn4-JE8gfCxLtcVvuoB942V6CGORxAWBPH6gg', prompt: 'Geometric purple 3d render', aspectRatio: '1:1', timestamp: Date.now() - 200000 },
  { id: '3', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnMI9XsHpw_kBnsh8wQ-WA551nEED3s-WKJuDjfeYjGHRbwOfzHnsyJcFBe6NZJQe4oW44q7v2PJ63_ORJrXg5R9l53_lHFOHm6BoMaePTwI51mjabNwkgICEXCA1qWKNx9pM8odbkcj7KaslFQVAtJAL4ubqd3PGx0FAa7xdstwdiN-ZKSadrA7Bf8Ictx-BOB6lVaaXZHyTYVrud-Cwr0rlP5tMuRZ-EgoPM8cSzCjn7cSCVKHAQ-9kpPw_AN1ThXQlkXQQWYa0', prompt: 'Cyberpunk landscape', aspectRatio: '1:1', timestamp: Date.now() - 300000 },
  { id: '4', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXTV6iWdWziJQFnISKf56NDrGAJ9JTztK9HHNG9SkX3bsOz5Ht2rtWXH1bwSn3dsy5KeHOFTqlVpfK3_FqWuLsTEZHKoGeNCW5VrRajazeuSdNNjI5CCCOHDRFoi2S1UM4yzlaIFsdchOSSKCeJ2etnBUHQI7xbQszE3CK8svpVLPnj-ZaVZ4-0sx9wqJKVtUq4phjfgZ3iQjSFaJZk0GTqXHchB_YY1JDfXAKnsYX9eKlOq--fEZNMMqPd_E6XLtXPHUtf_SgyaM', prompt: 'Retro synthwave sunset', aspectRatio: '1:1', timestamp: Date.now() - 400000 },
];

export default function App() {
  // State
  const [prompt, setPrompt] = useState("");
  const [currentImage, setCurrentImage] = useState<string>(PLACEHOLDER_IMAGE);
  const [settings, setSettings] = useState<GenerationSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryItem[]>(SAMPLE_HISTORY);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [isInPaintMode, setIsInPaintMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Helper to update settings
  const updateSetting = <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Timer for generation
  useEffect(() => {
    if (isGenerating) {
      setLoadingTime(0);
      timerRef.current = window.setInterval(() => {
        setLoadingTime(t => t + 0.1);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating]);

  // Handle Canvas Resizing for In-Paint
  useEffect(() => {
    if (isInPaintMode && imageRef.current && canvasRef.current) {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isInPaintMode, currentImage]);

  // Main Generation Function
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      let generatedUrl = "";
      
      if (isInPaintMode) {
        // Use Edit Image mode
        generatedUrl = await editImage(currentImage, prompt, settings.aspectRatio);
        setIsInPaintMode(false); // Exit in-paint mode after generation
      } else {
        // Standard Text-to-Image
        generatedUrl = await generateImage(prompt, settings.aspectRatio, settings.negativePrompt);
      }
      
      setCurrentImage(generatedUrl);
      addToHistory(generatedUrl, prompt);
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVariations = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      // For variations, we can re-generate with a new random seed or use image-to-image with current image + prompt
      // Let's use image-to-image with the current prompt for "Variations" of this composition
      const variationPrompt = prompt || "Create a variation of this image";
      const generatedUrl = await editImage(currentImage, variationPrompt, settings.aspectRatio);
      setCurrentImage(generatedUrl);
      addToHistory(generatedUrl, variationPrompt + " (Variation)");
    } catch (error) {
      console.error("Failed to generate variation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpscale = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const generatedUrl = await upscaleImage(currentImage, settings.aspectRatio);
      setCurrentImage(generatedUrl);
      addToHistory(generatedUrl, prompt + " (Upscaled)");
    } catch (error) {
      console.error("Failed to upscale:", error);
      alert("Failed to upscale. Try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addToHistory = (url: string, historyPrompt: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      url: url,
      prompt: historyPrompt,
      aspectRatio: settings.aspectRatio,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setCurrentImage(item.url);
    setPrompt(item.prompt);
    // Optionally restore other settings if saved in history
  };

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInPaintMode) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Reset path
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isInPaintMode || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ff0000'; // Red mask
    ctx.globalCompositeOperation = 'source-over';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  return (
    <div className="flex h-screen bg-background-dark text-white font-display overflow-hidden">
      
      {/* 1. Global Navigation (Left) */}
      <aside className="w-64 border-r border-border-dark flex flex-col bg-background-dark flex-shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-primary relative overflow-hidden"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAYM2FKMtCQmrOB6qUvgUvA_SoO8200_sT5baochOcubiKEmLZwHMq8Wn0U_x4__KiMX5rxIJGNpyWdO7U5yC44T9IXzIbtDAAHWt7OM3zHQMj8i-jaWm28nIY51vqpvbNNI-l8ReEiNhpWwOnwE2KGIdAuyhucWQabmdtBxvwFys7RuEqAvwZgu5045U-EFEnF--0WrcJHe-fxTgPowCGSmDUjhDQ0Xn3ZTFhITMIVmWahhEaJ4z3V5c-_ElnypOzD2M9Vq4FYtY4")' }}
          ></div>
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold leading-normal tracking-wide">NeoGen</h1>
            <p className="text-text-secondary text-xs font-normal leading-normal">Pro Plan</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
          <NavItem icon="auto_awesome" label="Generate" active />
          <NavItem icon="psychology" label="Train" />
          <NavItem icon="perm_media" label="Gallery" />
          <NavItem icon="history" label="History" />
          <div className="h-px w-full bg-border-dark my-2 opacity-50"></div>
          <NavItem icon="settings" label="Settings" />
        </nav>

        <div className="p-4 border-t border-border-dark">
          <div className="bg-surface-dark rounded-lg p-3 flex items-center justify-between border border-border-dark">
            <div className="flex items-center gap-2">
              <Icon name="bolt" className="text-yellow-400 text-[18px]" filled />
              <span className="text-xs font-medium text-white">840 Credits</span>
            </div>
            <button className="text-xs text-primary font-bold hover:underline">Buy More</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background-dark relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border-dark flex items-center justify-between px-6 bg-background-dark z-10">
          <div className="flex items-center gap-4 text-white">
            <button className="text-text-secondary hover:text-white transition-colors">
              <Icon name="menu" />
            </button>
            <div className="h-6 w-px bg-border-dark"></div>
            <h2 className="text-white text-lg font-bold tracking-tight">El Estudio</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider">Beta</span>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-surface-dark border border-border-dark text-white text-sm font-bold hover:bg-surface-light transition-colors">
              <Icon name="save" className="text-[18px] mr-2" />
              Save Project
            </button>
            <button className="flex items-center justify-center rounded-lg h-9 w-9 bg-surface-dark border border-border-dark text-white hover:bg-surface-light transition-colors">
              <Icon name="notifications" className="text-[20px]" />
            </button>
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border-dark cursor-pointer" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBG2DqB138VwnehMO7QjEN9ELuoMtM4ejhU4O4ZEaw_3o-Fb17vEaFC21Pz2CLy-vvbVKCCncgDFDbdNpoQZl1qfmB9N44uYcsqw4M8Q7N6t40tIMakZnJgkOEMdpeDT4EccbKWrtQIPfnhcqEZMsJTazh8AG7aj5kxh3UDb8Z32j5_-OL5LLiSV2IaVtu6zs3ZykmdKgY8aZvIZQ0Q0-1JSEtoqYzwDVCvCxgtHEnlnQ-RL6HYFUngHTEyXJKletfdm14L8UERnBk")' }}
            ></div>
          </div>
        </header>

        {/* Workspace Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Parameter Panel */}
          <section className="w-[320px] border-r border-border-dark flex flex-col bg-background-dark overflow-y-auto flex-shrink-0">
            <div className="flex border-b border-border-dark">
              <button className="flex-1 py-4 text-center text-sm font-bold text-white border-b-2 border-primary bg-primary/5">
                Text-to-Image
              </button>
              <button className="flex-1 py-4 text-center text-sm font-medium text-text-secondary hover:text-white transition-colors border-b-2 border-transparent hover:border-border-dark">
                Img-to-Img
              </button>
            </div>

            <div className="p-5 flex flex-col gap-8">
              {/* Model Selection */}
              <ControlGroup label="Model Checkpoint" helpTooltip>
                <div className="relative group">
                  <select 
                    className="w-full appearance-none bg-surface-dark border border-border-dark rounded-lg text-white text-sm px-4 py-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer hover:border-border-dark/80 transition-colors"
                    value={settings.model}
                    onChange={(e) => updateSetting("model", e.target.value)}
                  >
                    <option>NeoRealism XL v4.0</option>
                    <option>DreamShaper Turbo</option>
                    <option>Anime Pastel Mix</option>
                    <option>Gemini 2.5 Flash Image</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text-secondary">
                    <Icon name="expand_more" className="text-[20px]" />
                  </div>
                </div>
              </ControlGroup>

              {/* Aspect Ratio */}
              <ControlGroup label="Aspect Ratio">
                <div className="grid grid-cols-3 gap-2">
                  <AspectRatioBtn 
                    ratio="1:1" 
                    selected={settings.aspectRatio === AspectRatio.SQUARE} 
                    onClick={() => updateSetting("aspectRatio", AspectRatio.SQUARE)}
                    className="h-4 w-4"
                  />
                  <AspectRatioBtn 
                    ratio="3:2" 
                    subLabel="(4:3)"
                    selected={settings.aspectRatio === AspectRatio.LANDSCAPE} 
                    onClick={() => updateSetting("aspectRatio", AspectRatio.LANDSCAPE)}
                    className="h-4 w-6"
                  />
                  <AspectRatioBtn 
                    ratio="9:16" 
                    selected={settings.aspectRatio === AspectRatio.PORTRAIT} 
                    onClick={() => updateSetting("aspectRatio", AspectRatio.PORTRAIT)}
                    className="h-6 w-4"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                  <span>W: <span className="text-white font-mono">
                    {settings.aspectRatio === AspectRatio.SQUARE ? "1024" : settings.aspectRatio === AspectRatio.LANDSCAPE ? "1344" : "768"}
                  </span></span>
                  <span>H: <span className="text-white font-mono">
                    {settings.aspectRatio === AspectRatio.SQUARE ? "1024" : settings.aspectRatio === AspectRatio.LANDSCAPE ? "1024" : "1344"}
                  </span></span>
                </div>
              </ControlGroup>

              {/* Sliders */}
              <div className="flex flex-col gap-6">
                <SliderControl 
                  label="Guidance Scale" 
                  value={settings.guidanceScale} 
                  min={1} max={20} step={0.5} 
                  onChange={(v) => updateSetting("guidanceScale", v)} 
                />
                <SliderControl 
                  label="Steps" 
                  value={settings.steps} 
                  min={10} max={150} step={1} 
                  onChange={(v) => updateSetting("steps", v)} 
                />
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-white font-bold uppercase tracking-wider">Seed</label>
                    <button 
                      className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors text-text-secondary"
                      onClick={() => updateSetting("seed", -1)}
                    >
                      <Icon name="casino" className="text-[14px]" />
                      <span className="text-[10px]">Randomize</span>
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={settings.seed} 
                    readOnly
                    className="flex-1 bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* LoRAs */}
              <div className="border-t border-border-dark pt-5">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white text-xs font-bold uppercase tracking-wider">LoRAs & Adapters</label>
                  <button className="text-primary text-xs font-bold hover:underline">+ Add</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="px-2 py-1 rounded bg-surface-dark border border-border-dark flex items-center gap-2 group hover:border-border-dark/80 transition-colors">
                    <span className="text-xs text-text-secondary">Cyberpunk_Detailer</span>
                    <span className="text-[10px] text-primary font-mono">0.6</span>
                    <button className="text-text-secondary hover:text-red-400 flex items-center">
                      <Icon name="close" className="text-[12px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Center Canvas */}
          <section className="flex-1 relative flex flex-col min-w-0">
            {/* Viewport */}
            <div className="flex-1 bg-background-dark bg-canvas-grid animate-grid-pan relative overflow-hidden flex flex-col items-center justify-center p-8 group/canvas">
              
              <div className="relative shadow-2xl rounded-lg overflow-hidden border border-border-dark max-h-full max-w-full bg-[#000] transition-all duration-500 ease-in-out">
                {/* Overlay Controls */}
                <div className={`absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity flex items-end justify-center pb-4 gap-2 ${isInPaintMode ? 'opacity-100' : 'opacity-0 group-hover/canvas:opacity-100'}`}>
                   {!isInPaintMode && (
                     <>
                      <CanvasActionBtn icon="zoom_in" label="Upscale 2x" onClick={handleUpscale} />
                      <CanvasActionBtn icon="auto_fix_high" label="Variations" onClick={handleVariations} />
                      <CanvasActionBtn icon="brush" label="In-Paint" onClick={() => setIsInPaintMode(true)} />
                     </>
                   )}
                   {isInPaintMode && (
                     <div className="bg-surface-dark/90 backdrop-blur text-white px-4 py-2 rounded-md flex items-center gap-4 border border-white/10 shadow-lg">
                       <span className="text-xs font-bold">In-Painting Mode</span>
                       <div className="h-4 w-px bg-white/20"></div>
                       <button onClick={() => setIsInPaintMode(false)} className="text-xs hover:text-red-400 transition-colors font-bold">Cancel</button>
                     </div>
                   )}
                </div>

                {isGenerating && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-white font-bold tracking-wide animate-pulse">Generating...</p>
                    <p className="text-text-secondary text-xs mt-2 font-mono">{loadingTime.toFixed(1)}s</p>
                  </div>
                )}

                <div className="relative">
                  <img 
                    ref={imageRef}
                    src={currentImage} 
                    alt="Generated Content" 
                    className={`object-contain max-h-[calc(100vh-250px)] w-auto transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
                    crossOrigin="anonymous"
                  />
                  {/* Canvas Layer for In-Painting */}
                  {isInPaintMode && (
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 cursor-crosshair z-20 touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  )}
                </div>
              </div>

              {/* Floating Tools */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <FloatingToolBtn icon="fit_screen" />
                <FloatingToolBtn icon="pan_tool" />
              </div>
            </div>

            {/* Prompt Input (Sticky) */}
            <div className="p-6 bg-background-dark border-t border-border-dark z-20">
              <div className="max-w-4xl mx-auto w-full flex flex-col gap-3">
                <div className={`relative flex items-end gap-2 bg-surface-dark rounded-xl border p-2 transition-all shadow-lg ${isGenerating ? 'border-primary/50 opacity-80 cursor-not-allowed' : 'border-border-dark focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50'}`}>
                  <div className="flex-1">
                    <textarea 
                      className="w-full bg-transparent border-0 text-white placeholder-text-secondary focus:ring-0 resize-none py-2 px-3 text-base min-h-[56px] max-h-[120px]"
                      placeholder={isInPaintMode ? "Describe what to change in the masked area..." : "Describe your vision in detail... e.g. cyberpunk city with neon lights, realistic, 8k render"}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerate();
                        }
                      }}
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-1 pr-1">
                    <IconButton icon="style" title="Insert Style" />
                    <IconButton icon="add_photo_alternate" title="Upload Reference" />
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className={`h-10 px-6 bg-gradient-to-r from-primary to-[#9d3dfc] text-white text-sm font-bold rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2 transition-all ml-2
                        ${isGenerating || !prompt.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'}
                      `}
                    >
                      <Icon name="auto_awesome" className="text-[20px]" />
                      {isGenerating ? 'Working...' : isInPaintMode ? 'Apply Edit' : 'Generate'}
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex justify-between items-center px-1">
                  <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
                      {isGenerating ? 'Processing' : 'System Ready'}
                    </span>
                    <span className="text-border-dark">|</span>
                    <span>0.8s est. time</span>
                  </div>
                  <button className="text-xs font-bold text-text-secondary hover:text-primary flex items-center gap-1 transition-colors">
                    Advanced Settings <Icon name="tune" className="text-[14px]" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Right Panel */}
          <aside className="w-[280px] bg-background-dark border-l border-border-dark flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-border-dark flex items-center justify-between">
              <h3 className="text-white text-sm font-bold">Refinement</h3>
              <button className="text-text-secondary hover:text-white transition-colors">
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              {/* Negative Prompt */}
              <div className="flex flex-col gap-2">
                <label className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Icon name="do_not_disturb_on" className="text-[14px]" />
                  Negative Prompt
                </label>
                <textarea 
                  className="w-full h-24 bg-surface-dark border border-border-dark rounded-lg p-3 text-xs text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none placeholder-text-secondary/50"
                  value={settings.negativePrompt}
                  onChange={(e) => updateSetting("negativePrompt", e.target.value)}
                  placeholder="ugly, deformed, noisy..."
                />
              </div>

              {/* ControlNet Mock */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <label className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Icon name="gamepad" className="text-[14px]" />
                    ControlNet
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-surface-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-secondary after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white"></div>
                  </label>
                </div>
                <div className="p-3 border border-border-dark rounded-lg bg-surface-dark/50 opacity-50 pointer-events-none">
                  <div className="h-24 border-2 border-dashed border-border-dark rounded flex flex-col items-center justify-center text-text-secondary gap-2 mb-2">
                    <Icon name="upload_file" />
                    <span className="text-[10px]">Drop Control Image</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-text-secondary font-bold">
                    <span>Preprocessor: Canny</span>
                    <span>Weight: 1.0</span>
                  </div>
                </div>
              </div>

              {/* Session History */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border-dark">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-white text-xs font-bold uppercase tracking-wider">Session History</label>
                  <button className="text-[10px] text-primary hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {history.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleHistorySelect(item)}
                      className="aspect-square rounded-md bg-surface-dark border border-border-dark overflow-hidden cursor-pointer hover:border-primary transition-all relative group shadow-sm hover:shadow-[0_0_15px_rgba(127,19,236,0.3)] hover:scale-[1.02]"
                    >
                      <img 
                        src={item.url} 
                        alt="History" 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

/* --- Sub Components --- */

const NavItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <a 
    href="#" 
    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group
      ${active 
        ? 'bg-surface-dark border border-border-dark/50 shadow-sm hover:border-primary/50' 
        : 'text-text-secondary hover:bg-surface-dark hover:text-white'
      }`}
  >
    <Icon 
      name={icon} 
      className={`transition-colors ${active ? 'text-primary group-hover:text-white' : ''}`} 
    />
    <p className={`text-sm font-medium ${active ? 'text-white' : ''}`}>{label}</p>
  </a>
);

const ControlGroup: React.FC<{ label: string; children: React.ReactNode; helpTooltip?: boolean }> = ({ label, children, helpTooltip }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center">
      <label className="text-white text-xs font-bold uppercase tracking-wider">{label}</label>
      {helpTooltip && <Icon name="help" className="text-text-secondary text-[16px] cursor-help hover:text-white transition-colors" />}
    </div>
    {children}
  </div>
);

const AspectRatioBtn: React.FC<{ 
  ratio: string; 
  subLabel?: string;
  selected: boolean; 
  onClick: () => void;
  className: string; 
}> = ({ ratio, subLabel, selected, onClick, className }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all group
      ${selected 
        ? 'bg-primary/20 border-primary text-white shadow-[0_0_10px_rgba(127,19,236,0.2)]' 
        : 'bg-surface-dark border border-border-dark hover:border-primary/50 text-text-secondary hover:text-white active:bg-primary/20'
      }`}
  >
    <div className={`${className} border-2 border-current rounded-[2px]`}></div>
    <span className="text-[10px] font-medium">{ratio} {subLabel && <span className="opacity-50">{subLabel}</span>}</span>
  </button>
);

const SliderControl: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (val: number) => void }> = ({ label, value, min, max, step, onChange }) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center text-xs">
      <label className="text-white font-bold uppercase tracking-wider">{label}</label>
      <span className="text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-primary"
    />
  </div>
);

const CanvasActionBtn: React.FC<{ icon: string; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-surface-dark/90 backdrop-blur text-white px-3 py-1.5 rounded-md text-xs font-bold border border-white/10 hover:bg-primary hover:border-primary transition-all flex items-center gap-1 shadow-lg active:scale-95"
  >
    <Icon name={icon} className="text-[14px]" /> 
    {label}
  </button>
);

const FloatingToolBtn: React.FC<{ icon: string }> = ({ icon }) => (
  <button className="size-8 rounded bg-surface-dark border border-border-dark text-text-secondary hover:text-white flex items-center justify-center shadow-lg transition-colors hover:border-primary/50">
    <Icon name={icon} className="text-[18px]" />
  </button>
);

const IconButton: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <button className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors" title={title}>
    <Icon name={icon} className="text-[20px]" />
  </button>
);
