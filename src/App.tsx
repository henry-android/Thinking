import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Music, 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  Share2, 
  Calendar, 
  Edit3, 
  Copy, 
  Sparkles, 
  Settings, 
  X, 
  MailOpen, 
  Mail, 
  Check, 
  Info,
  Layers,
  FileText
} from 'lucide-react';

// Define the Theme types
type ThemeId = 'midnight' | 'rose' | 'ethereal';

interface ThemeConfig {
  id: ThemeId;
  name: string;
  bgClass: string;
  cardClass: string;
  accentClass: string;
  textColor: string;
  secondaryTextColor: string;
  particleColor: string;
  sealColor: string;
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  midnight: {
    id: 'midnight',
    name: 'Đêm Sao Sâu Thẳm',
    bgClass: 'bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900',
    cardClass: 'bg-slate-900/40 border-slate-800/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
    accentClass: 'from-amber-400 to-amber-200 text-amber-300',
    textColor: 'text-slate-100',
    secondaryTextColor: 'text-slate-400',
    particleColor: 'rgba(253, 224, 71, 0.6)', // amber gold
    sealColor: '#eab308'
  },
  rose: {
    id: 'rose',
    name: 'Bình Minh Ấm Áp',
    bgClass: 'bg-gradient-to-tr from-[#2d1b24] via-[#1f1625] to-[#14121f]',
    cardClass: 'bg-pink-950/20 border-rose-900/30 backdrop-blur-md shadow-[0_8px_32px_rgba(244,63,94,0.15)]',
    accentClass: 'from-rose-400 to-pink-300 text-rose-300',
    textColor: 'text-rose-100',
    secondaryTextColor: 'text-rose-300/60',
    particleColor: 'rgba(244, 63, 94, 0.6)', // rose pink
    sealColor: '#f43f5e'
  },
  ethereal: {
    id: 'ethereal',
    name: 'Sương Khói Thiên Đường',
    bgClass: 'bg-gradient-to-tr from-[#13111C] via-[#1c1b35] to-[#251f38]',
    cardClass: 'bg-purple-950/20 border-purple-800/30 backdrop-blur-md shadow-[0_8px_32px_rgba(168,85,247,0.15)]',
    accentClass: 'from-violet-400 to-fuchsia-300 text-violet-300',
    textColor: 'text-violet-100',
    secondaryTextColor: 'text-violet-300/60',
    particleColor: 'rgba(192, 132, 252, 0.6)', // purple/lavender
    sealColor: '#a855f7'
  }
};

// Beautiful royalty-free musical selection
interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
}

const TRACKS: Track[] = [
  {
    id: 'piano-soft',
    name: 'Acoustic Love Piano',
    artist: 'Chill Melody',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // High quality fallback synth piano loop
  },
  {
    id: 'guitar-ambient',
    name: 'Nostalgic Guitar Whisper',
    artist: 'Cozy Rain',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'sad-dreamy',
    name: 'Beautiful Melancholic Lofi',
    artist: 'Night Vibes',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  }
];

// Helper to safely pack options into a shareable URL string
interface ShareData {
  title: string;
  subtitle: string;
  secondsSince: number; // custom base timestamp
  message: string;
  theme: ThemeId;
  trackId: string;
  senderName: string;
  receiverName: string;
}

const DEFAULT_MESSAGE = `Em yêu ơi, mỗi một giây phút trôi qua không có em bên cạnh đều khiến anh cảm thấy trống trải. 

Khoảng cách tuy có xa về địa lý, nhưng trái tim anh lúc nào cũng hướng về em, lấp đầy bởi những kỷ niệm dịu ngọt mà hai đứa đã cùng nhau trải qua. Từ nụ cười tỏa nắng của em, cái ôm ấm áp, đến cả những lời hờn dỗi đáng yêu nhất.

Hẹn gặp em vào một ngày không xa, ngày mà anh có thể ôm em thật chặt và nói trực tiếp với em rằng: "Anh nhớ em nhiều lắm!" ❤️`;

export default function App() {
  // Parsing Query Parameters for dynamic URL sharing
  const getInitialState = (): ShareData => {
    try {
      const params = new URLSearchParams(window.location.search);
      const encodedData = params.get('love');
      if (encodedData) {
        const decoded = decodeURIComponent(atob(encodedData));
        const parsed = JSON.parse(decoded) as Partial<ShareData>;
        return {
          title: parsed.title || 'Anh Nhớ Em',
          subtitle: parsed.subtitle || 'Từng Giây Phút Chờ Đợi...',
          secondsSince: parsed.secondsSince || new Date('2025-06-01T00:00:00').getTime() / 1000,
          message: parsed.message || DEFAULT_MESSAGE,
          theme: parsed.theme || 'midnight',
          trackId: parsed.trackId || 'piano-soft',
          senderName: parsed.senderName || 'Anh',
          receiverName: parsed.receiverName || 'Em'
        };
      }
    } catch (e) {
      console.warn("Failed to decode share data from URL query. Using defaults.", e);
    }
    
    // Default config: 1 year in the past roughly, or configurable
    return {
      title: 'Anh Nhớ Em',
      subtitle: 'Từng Giây Phút Chờ Đợi...',
      secondsSince: new Date('2025-06-01T00:00:00').getTime() / 1000,
      message: DEFAULT_MESSAGE,
      theme: 'midnight',
      trackId: 'piano-soft',
      senderName: 'Anh',
      receiverName: 'Em'
    };
  };

  const [loveData, setLoveData] = useState<ShareData>(getInitialState);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const idx = TRACKS.findIndex(t => t.id === loveData.trackId);
    return idx !== -1 ? idx : 0;
  });
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Layout & Customization dashboard
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  
  // Customization Form States
  const [formTitle, setFormTitle] = useState(loveData.title);
  const [formSubtitle, setFormSubtitle] = useState(loveData.subtitle);
  const [formDate, setFormDate] = useState(() => {
    const d = new Date(loveData.secondsSince * 1000);
    // return YYYY-MM-DD
    return d.toISOString().split('T')[0];
  });
  const [formTime, setFormTime] = useState(() => {
    const d = new Date(loveData.secondsSince * 1000);
    // return HH:MM
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  });
  const [formMessage, setFormMessage] = useState(loveData.message);
  const [formTheme, setFormTheme] = useState<ThemeId>(loveData.theme);
  const [formSender, setFormSender] = useState(loveData.senderName);
  const [formReceiver, setFormReceiver] = useState(loveData.receiverName);

  // Share outcomes
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Timer Countdown state
  const [timeDiff, setTimeDiff] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Reference for Canvas, Audio
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio elements control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio track change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = TRACKS[currentTrackIndex].url;
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log("Audio play blocked by browser. User gesture needed.", err);
        });
      }
    }
  }, [currentTrackIndex]);

  // Custom toast notifications
  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 4000);
  };

  // Toggle play audio and handle browser gesture block
  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(null);
        })
        .catch(err => {
          console.error("Audio block: Needs click gesture first", err);
          setIsPlaying(true); // Attempt to show playing state, browser fallback
          setAudioError("Vui lòng tương tác với trang trước khi phát nhạc.");
          triggerNotification("Nhấp vào nút phát nhạc lần nữa để kiểm tra.");
        });
    }
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  // Live Timer countdown logic
  useEffect(() => {
    const calculateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const target = loveData.secondsSince;
      
      // Calculate absolute difference (could be in the past or future)
      const absDiff = Math.abs(now - target);
      
      const days = Math.floor(absDiff / (60 * 60 * 24));
      const hours = Math.floor((absDiff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((absDiff % (60 * 60)) / 60);
      const seconds = Math.floor(absDiff % 60);

      setTimeDiff({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [loveData.secondsSince]);

  // Canvas particle logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic particles structure
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      decay: number;
      isHeart: boolean;
      angle: number;
      spin: number;
    }

    let particles: Particle[] = [];
    const maxParticles = 60;

    // Create single particle
    const createParticle = (isBurst = false, clickX?: number, clickY?: number): Particle => {
      const px = clickX !== undefined ? clickX : Math.random() * width;
      const py = clickY !== undefined ? clickY : (isBurst ? clickY : height + 20);
      
      // Heart shapes vs simple sparkling stars
      const isHeart = isBurst ? Math.random() > 0.3 : Math.random() > 0.7;
      
      return {
        x: px,
        y: py,
        size: isHeart ? Math.random() * 8 + 6 : Math.random() * 3 + 1,
        speedX: isBurst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 1.5,
        speedY: isBurst ? (Math.random() - 0.5) * 6 - 2 : -(Math.random() * 1.2 + 0.4),
        alpha: isBurst ? 1.0 : Math.random() * 0.7 + 0.3,
        decay: isBurst ? Math.random() * 0.015 + 0.008 : 0,
        isHeart,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05
      };
    };

    // Initialize stars/hearts
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(false));
      // randomize heights initially
      particles[i].y = Math.random() * height;
    }

    // Draw vector heart
    const drawHeart = (context: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) => {
      context.save();
      context.translate(x, y);
      context.beginPath();
      // Heart outline equation
      for (let t = 0; t < Math.PI * 2; t += 0.05) {
        const hx = size * 16 * Math.pow(Math.sin(t), 3) / 16;
        const hy = -size * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 16;
        if (t === 0) {
          context.moveTo(hx, hy);
        } else {
          context.lineTo(hx, hy);
        }
      }
      context.fillStyle = THEMES[loveData.theme].particleColor.replace('0.6', String(alpha * 0.7));
      context.shadowColor = THEMES[loveData.theme].sealColor;
      context.shadowBlur = 6;
      context.fill();
      context.restore();
    };

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint background stars grid on midnight theme
      if (loveData.theme === 'midnight') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 40; i++) {
          const sx = (Math.sin(i + Date.now() * 0.0002) * 0.5 + 0.5) * width;
          const sy = (Math.cos(i * 1.5 + Date.now() * 0.0001) * 0.5 + 0.5) * height;
          ctx.fillRect(sx, sy, 2, 2);
        }
      }

      particles.forEach((p, index) => {
        // Move particle
        p.x += p.speedX;
        p.y += p.speedY;
        p.angle += p.spin;

        // Apply decay to bursts
        if (p.decay > 0) {
          p.alpha -= p.decay;
        }

        // Draw particle
        if (p.isHeart) {
          drawHeart(ctx, p.x, p.y, p.size, p.alpha);
        } else {
          // Twinkling Star
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.shadowBlur = 4;
          ctx.shadowColor = THEMES[loveData.theme].sealColor;
          ctx.fillStyle = THEMES[loveData.theme].particleColor.replace('0.6', String(p.alpha));
          
          // Draw diamond star
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 2);
          ctx.lineTo(p.size * 0.6, -p.size * 0.6);
          ctx.lineTo(p.size * 2, 0);
          ctx.lineTo(p.size * 0.6, p.size * 0.6);
          ctx.lineTo(0, p.size * 2);
          ctx.lineTo(-p.size * 0.6, p.size * 0.6);
          ctx.lineTo(-p.size * 2, 0);
          ctx.lineTo(-p.size * 0.6, -p.size * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Respawn decayed or out-of-screen particles
        if (p.y < -30 || p.x < -30 || p.x > width + 30 || p.alpha <= 0) {
          if (p.decay > 0) {
            // Remove bursts completely once faint
            particles.splice(index, 1);
          } else {
            // Re-render ambient floating particle
            particles[index] = createParticle(false);
          }
        }
      });

      // Keep minimum particles alive for ambient sparkle
      while (particles.filter(p => !p.decay).length < maxParticles) {
        particles.push(createParticle(false));
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });
    
    resizeObserver.observe(document.body);

    // Mouse click event to burst hearts
    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Burst 12 emotional hearts/stars at click location
      for (let i = 0; i < 15; i++) {
        particles.push(createParticle(true, clickX, clickY));
      }
    };

    // Touch click event support
    const handleCanvasTouch = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.touches[0].clientX - rect.left;
        const clickY = e.touches[0].clientY - rect.top;
        
        for (let i = 0; i < 10; i++) {
          particles.push(createParticle(true, clickX, clickY));
        }
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasTouch, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('touchstart', handleCanvasTouch);
    };
  }, [loveData.theme]);

  // Quick reset to defaults
  const handleResetDefaults = () => {
    setFormTitle('Anh Nhớ Em');
    setFormSubtitle('Từng Giây Phút Chờ Đợi...');
    setFormDate('2025-06-01');
    setFormTime('00:00');
    setFormMessage(DEFAULT_MESSAGE);
    setFormSender('Anh');
    setFormReceiver('Em');
    setFormTheme('midnight');
  };

  // Form Submission & Live State update & encoding logic
  const handleApplySettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse Date and Time
    const combinedString = `${formDate}T${formTime || '00:00'}:00`;
    let parsedTimestamp = new Date(combinedString).getTime() / 1000;
    if (isNaN(parsedTimestamp)) {
      parsedTimestamp = new Date().getTime() / 1000;
    }

    const updatedData: ShareData = {
      title: formTitle.trim() || 'Anh Nhớ Em',
      subtitle: formSubtitle.trim() || 'Từng Giây Phút Chờ Đợi...',
      secondsSince: parsedTimestamp,
      message: formMessage.trim() || DEFAULT_MESSAGE,
      theme: formTheme,
      trackId: TRACKS[currentTrackIndex].id,
      senderName: formSender.trim() || 'Anh',
      receiverName: formReceiver.trim() || 'Em'
    };

    setLoveData(updatedData);
    setIsSettingsOpen(false);
    triggerNotification("Đã cập nhật các thay đổi trên giao diện!");
  };

  // Generate Compressed URL for instant sharing representation
  const handleGenerateShareUrl = () => {
    // Collect settings
    const combinedString = `${formDate}T${formTime || '00:00'}:00`;
    let parsedTimestamp = new Date(combinedString).getTime() / 1000;
    if (isNaN(parsedTimestamp)) {
      parsedTimestamp = new Date().getTime() / 1000;
    }

    const toShare: ShareData = {
      title: formTitle.trim() || 'Anh Nhớ Em',
      subtitle: formSubtitle.trim() || 'Từng Giây Phút Chờ Đợi...',
      secondsSince: parsedTimestamp,
      message: formMessage.trim() || DEFAULT_MESSAGE,
      theme: formTheme,
      trackId: TRACKS[currentTrackIndex].id,
      senderName: formSender.trim() || 'Anh',
      receiverName: formReceiver.trim() || 'Em'
    };

    try {
      // JSON dynamic string
      const jsonStr = JSON.stringify(toShare);
      // encode with standard Base64 string that can slide safely into URL parameter
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
      
      let baseUrl = window.location.origin + window.location.pathname;
      let isDevRedirected = false;
      if (baseUrl.includes('ais-dev-')) {
        baseUrl = baseUrl.replace('ais-dev-', 'ais-pre-');
        isDevRedirected = true;
      }
      const shareLink = `${baseUrl}?love=${b64}`;

      // Try copy to clipboard
      navigator.clipboard.writeText(shareLink)
        .then(() => {
          setShareSuccess(true);
          if (isDevRedirected) {
            triggerNotification("Đã sao chép liên kết công khai (ais-pre) để gửi! Link đã tự động đổi để người nhận xem được bình thường.");
          } else {
            triggerNotification("Đã sao chép liên kết chia sẻ vào khay nhớ tạm!");
          }
          setTimeout(() => setShareSuccess(false), 5000);
        })
        .catch(() => {
          // Fallback if browser permission is blocked
          const tempInput = document.createElement('input');
          tempInput.value = shareLink;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          
          setShareSuccess(true);
          if (isDevRedirected) {
            triggerNotification("Đã sao chép liên kết công khai (ais-pre) để gửi! Link đã tự động đổi để người khác xem được.");
          } else {
            triggerNotification("Đã sao chép liên kết chia sẻ!");
          }
          setTimeout(() => setShareSuccess(false), 5000);
        });
    } catch (e) {
      console.error(e);
      triggerNotification("Có lỗi xảy ra khi tạo liên kết.");
    }
  };

  // Active theme properties
  const activeTheme = THEMES[loveData.theme];

  return (
    <div id="main_wrapper" className={`relative min-h-screen ${activeTheme.bgClass} text-slate-100 flex flex-col justify-between overflow-hidden transition-all duration-1000 selection:bg-rose-500/30 selection:text-white`}>
      
      {/* Background Particle Effects Canvas */}
      <canvas 
        ref={canvasRef} 
        id="particle_canvas" 
        className="absolute inset-0 z-0 pointer-events-auto cursor-pointer"
        title="Nhấp chuột hoặc chạm màn hình để tạo trái tim bay bổng!"
      />

      {/* Floating Sparkles Ambient Light */}
      <div className="absolute inset-0 bg-[radial-gradient(radial,circle_at_center,rgba(255,255,255,0.01)_0%,transparent_80%)] pointer-events-none z-0" />

      {/* Header Utilities */}
      <header id="app_header" className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-6 md:pt-8 flex justify-between items-center">
        
        {/* Soft elegant signature or brand */}
        <div 
          id="brand_container" 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            triggerNotification(`Ý tưởng thiết kế gửi trao yêu thương đích thực ✨ Từ ${loveData.senderName} ➜ ${loveData.receiverName}`);
          }}
        >
          <div className="relative">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-heartbeat group-hover:scale-125 transition-transform duration-300" />
            <span className="absolute -inset-0.5 bg-rose-500 rounded-full blur-md opacity-40 animate-pulse"></span>
          </div>
          <span className="font-serif font-light text-sm tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400 group-hover:text-white transition-colors duration-300">
            {loveData.senderName.toUpperCase()} &hearts; {loveData.receiverName.toUpperCase()}
          </span>
        </div>

        {/* Interaction items */}
        <div id="controls_bar" className="flex items-center gap-2 md:gap-3">
          
          {/* Quick instructions indicator */}
          <button
            id="btn_help"
            onClick={() => triggerNotification("Chạm bất kỳ đâu trên màn hình để thả tim lãng mạn. 💕")}
            className="p-2 md:p-2.5 rounded-full bg-slate-800/40 border border-slate-700/40 text-slate-300 hover:text-white hover:bg-slate-700/40 transition-all duration-300 backdrop-blur-sm"
            title="Mẹo tương tác"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Quick Theme Switch cycle */}
          <button
            id="btn_cycle_theme"
            onClick={() => {
              const currentThemes: ThemeId[] = ['midnight', 'rose', 'ethereal'];
              const currentIndex = currentThemes.indexOf(loveData.theme);
              const nextIndex = (currentIndex + 1) % currentThemes.length;
              const nextTheme = currentThemes[nextIndex];
              setLoveData(prev => ({ ...prev, theme: nextTheme }));
              setFormTheme(nextTheme);
              triggerNotification(`Đã chuyển đổi không gian: ${THEMES[nextTheme].name} ✨`);
            }}
            className="p-2 md:p-2.5 rounded-full bg-slate-800/40 border border-slate-700/40 text-slate-300 hover:text-white hover:bg-slate-700/40 transition-all duration-300 backdrop-blur-sm"
            title="Đổi chủ đề nhanh"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Open Settings button */}
          <button
            id="btn_open_settings"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 md:py-2 rounded-full bg-slate-800/40 border border-slate-700/40 text-slate-300 hover:text-white hover:bg-slate-700/40 transition-all duration-300 backdrop-blur-sm"
            title="Tạo liên kết & Tùy chỉnh thông điệp"
          >
            <Settings className="w-4 h-4 animate-spin-hover" />
            <span className="text-xs font-medium hidden md:inline">Tạo Thư Chia Sẻ</span>
          </button>
        </div>
      </header>

      {/* Main Contents Area */}
      <main id="main_content" className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 flex flex-col justify-center items-center py-8 md:py-12 gap-8 md:gap-12 select-none">
        
        {/* Memory Header & Typography */}
        <section id="hero_section" className="text-center space-y-4 max-w-2xl animate-fade-in">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span className="text-[11px] font-sans tracking-[0.15em] text-slate-300 uppercase font-light">
              Món quà tâm tư &bull; Gửi người thương
            </span>
          </div>

          {/* Elegant handwritten styling top text */}
          <p className="font-handwritten text-3xl md:text-4xl text-rose-300/90 tracking-wide mt-1 animate-pulse">
            {loveData.secondsSince < Date.now() / 1000 ? "Chúng mình đã xa dặm đường..." : "Khoảng cách sắp được lấp đầy..."}
          </p>

          <h1 id="hero_title" className="font-serif font-serif-ital font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-tight select-none">
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              {loveData.title}
            </span>
            <span className="text-rose-500 animate-pulse ml-2 inline-block">❤️</span>
          </h1>

          <p id="hero_subtitle" className="text-sm md:text-base font-light tracking-widest text-slate-400 max-w-md mx-auto line-clamp-2 uppercase">
            {loveData.subtitle}
          </p>
        </section>

        {/* Love Space Countdown Section */}
        <section id="countdown_section" className="w-full max-w-xl animate-fade-in" style={{ animationDelay: '150ms' }}>
          
          <div className={`p-6 md:p-8 rounded-3xl ${activeTheme.cardClass} relative overflow-hidden group border border-white/5`}>
            
            {/* Background absolute graphic blur */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col items-center gap-4">
              
              <div className="flex items-center gap-2 text-xs font-light text-slate-400 tracking-[0.2em] uppercase mb-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                <span>Số Ngày Mong Mỏi</span>
              </div>

              {/* Grid counter elements with dynamic layout */}
              <div id="counter_grid" className="grid grid-cols-4 gap-2 md:gap-4 w-full">
                
                {/* Days Card */}
                <div className="flex flex-col items-center p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner transition-transform duration-300 hover:scale-105">
                  <span className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight glow-amber">
                    {timeDiff.days}
                  </span>
                  <span className="text-[10px] md:text-xs font-light text-slate-400 tracking-wider mt-1.5 uppercase">Ngày</span>
                </div>

                {/* Hours Card */}
                <div className="flex flex-col items-center p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner transition-transform duration-300 hover:scale-105">
                  <span className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
                    {String(timeDiff.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs font-light text-slate-400 tracking-wider mt-1.5 uppercase">Giờ</span>
                </div>

                {/* Minutes Card */}
                <div className="flex flex-col items-center p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner transition-transform duration-300 hover:scale-105">
                  <span className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
                    {String(timeDiff.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs font-light text-slate-400 tracking-wider mt-1.5 uppercase font-medium">Phút</span>
                </div>

                {/* Seconds Card */}
                <div className="flex flex-col items-center p-3 md:p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner transition-transform duration-300 hover:scale-105">
                  <span className="text-3xl md:text-5xl font-serif font-bold text-rose-400 tracking-tight animate-pulse-slow">
                    {String(timeDiff.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] md:text-xs font-light text-rose-400/80 tracking-wider mt-1.5 uppercase font-bold">Giây</span>
                </div>

              </div>
              
              {/* Info timeline summary */}
              <div className="text-xs text-center text-slate-400 font-light italic mt-2 px-4 max-w-sm">
                "Kể từ mốc thời gian quý giá {new Date(loveData.secondsSince * 1000).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}"
              </div>

            </div>
          </div>
        </section>

        {/* Custom 3D Elegant Visual Envelope Section */}
        <section id="envelope_section" className="w-full max-w-md animate-fade-in flex flex-col items-center" style={{ animationDelay: '300ms' }}>
          
          <p className="text-xs text-slate-400 font-light tracking-[0.2em] uppercase mb-4 flex items-center gap-1.5 animate-pulse">
            <span>{isLetterOpen ? "Chạm vào lá thư để khép lại" : "Chạm để mở bức thư tình"}</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>

          {/* Envelope wrapper container */}
          <div className="relative w-full h-80 flex justify-center items-center">
            
            {/* The actual letter envelope */}
            <div 
              id="interact_mail_envelope"
              onClick={() => setIsLetterOpen(!isLetterOpen)}
              className={`relative w-80 h-52 bg-slate-900 border border-white/10 rounded-2xl cursor-pointer shadow-2xl transition-all duration-700 select-none ${
                isLetterOpen ? 'transform -translate-y-16 scale-95 md:scale-90 bg-slate-900/90' : 'hover:scale-[1.03]'
              }`}
              style={{
                perspective: '1000px',
                boxShadow: isLetterOpen ? '0 20px 40px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.4)'
              }}
            >
              {/* Back paper back of envelope */}
              <div className="absolute inset-0 bg-[#e2d5c7] dark:bg-[#201826] border border-stone-400/40 dark:border-rose-950/40 rounded-2xl overflow-hidden z-0 shadow-inner" />

              {/* Heart Sticker Stamp (The interactive trigger seal) */}
              <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-700 ${isLetterOpen ? 'opacity-0 scale-50 rotate-45 pointer-events-none' : 'hover:scale-110'}`}>
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform"
                  style={{ backgroundColor: activeTheme.sealColor }}
                >
                  <Mail className="w-6 h-6 text-white stroke-[2px] animate-pulse" />
                </div>
              </div>

              {/* Decorative Envelope Address Fields for cozy/realistic romance */}
              {!isLetterOpen && (
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-stone-600/30 dark:text-rose-200/20 uppercase tracking-widest font-sans text-[10px]">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium text-xs text-stone-400/50 dark:text-rose-400/40">Gửi: {loveData.receiverName}</p>
                      <p className="text-[8px]">Nơi bình yên bên cạnh thương nhớ</p>
                    </div>
                    <div className="w-12 h-16 border border-dashed border-stone-500/20 dark:border-rose-500/20 rounded flex items-center justify-center p-1 font-serif text-[7px] text-center leading-tight">
                      Stamp Only <br/> For You
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-[8px]">Người ký: {loveData.senderName}</p>
                    <p className="text-[7px]">Được mã hóa với trái tim 💕</p>
                  </div>
                </div>
              )}

              {/* Visual Opened Leaf Header inside card background */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1/2 bg-[#dfd2c4] dark:bg-[#1a1320] border-b border-light-400/30 rounded-t-2xl z-10 origin-top transition-transform duration-700 ${
                  isLetterOpen ? 'transform rotateX(180deg) z-0' : 'transform rotateX(0deg)'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              />

              {/* Left/Right folding details */}
              <div className="absolute inset-y-0 left-0 w-1/2 bg-[#d7c9b8]/30 dark:bg-rose-950/10 border-r border-[#beaf9f]/10 rounded-l-2xl z-10 pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-1/2 bg-[#d7c9b8]/20 dark:bg-rose-950/5 border-l border-[#beaf9f]/10 rounded-r-2xl z-10 pointer-events-none" />

              {/* The Dynamic Pop-out Letter */}
              <div 
                id="romantic_paper_letter"
                onClick={(e) => {
                  // prevent duplicate clicks since clicking paper toggles too
                  e.stopPropagation();
                  setIsLetterOpen(!isLetterOpen);
                }}
                className={`absolute bottom-3 left-4 right-4 md:left-6 md:right-6 bg-[#fdfaf2] dark:bg-slate-900 border border-amber-800/10 dark:border-stone-800 text-stone-800 dark:text-slate-200 p-4 rounded-xl shadow-2xl transition-all duration-700 flex flex-col justify-between ${
                  isLetterOpen 
                    ? 'h-96 transform -translate-y-36 scale-105 opacity-100 z-20 cursor-text' 
                    : 'h-16 opacity-30 z-0 pointer-events-none transform translate-y-0'
                }`}
                style={{
                  transitionDelay: isLetterOpen ? '150ms' : '0ms',
                }}
              >
                {/* Lined notebook/paper overlay styling */}
                <div 
                  className="absolute inset-0 bg-repeat bg-left-top opacity-[0.03] pointer-events-none dark:opacity-[0.02]"
                  style={{
                    backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                    backgroundSize: '16px 16px'
                  }}
                />

                {/* Inside Heart Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05] dark:opacity-[0.03]">
                  <Heart className="w-56 h-56 text-rose-600 fill-rose-600" />
                </div>

                {/* Letter Header */}
                <div className="relative z-10 flex justify-between items-center border-b border-rose-100 dark:border-stone-800 pb-2 mb-2 font-serif text-xs tracking-wider">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                    <span className="font-semibold text-rose-700/80 dark:text-rose-400">Gửi {loveData.receiverName},</span>
                  </div>
                  <span className="text-[10px] text-stone-400 dark:text-slate-400 font-light">
                    Kỷ niệm thương yêu
                  </span>
                </div>

                {/* Scrollable Emotional Custom Letter Message content */}
                <div className="relative z-10 flex-1 overflow-y-auto pr-1 text-sm leading-relaxed font-handwritten font-normal text-base text-stone-700 dark:text-slate-300 space-y-2 select-text custom-scrollbar">
                  {loveData.message.split('\n').map((paragraph, i) => (
                    <p key={i} className="min-h-[1.2rem]">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Letter Footer Signature */}
                <div className="relative z-10 border-t border-rose-100 dark:border-stone-800 pt-2 mt-2 flex justify-between items-end">
                  <div className="text-[9px] text-stone-400 dark:text-slate-500 font-sans tracking-tight">
                    Nơi gửi gắm: {loveData.senderName}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] italic text-rose-500/70 font-sans">Mãi nhớ thương...</p>
                    <p className="font-handwritten text-lg text-rose-600 dark:text-rose-400 font-semibold leading-none mt-1">
                      {loveData.senderName}
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Prompt warning inside envelope */}
          {isLetterOpen && (
            <button
              onClick={() => setIsLetterOpen(false)}
              className="mt-6 md:mt-8 px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-300 transition-colors backdrop-blur-md flex items-center gap-2"
            >
              <MailOpen className="w-3.5 h-3.5 text-rose-400" />
              <span>Đóng thư lại</span>
            </button>
          )}

        </section>

      </main>

      {/* Embedded High Craft Ambient Audio Player in Corner */}
      <footer id="app_footer" className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-6 md:pb-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        
        {/* Footnote simple description */}
        <p className="text-xs text-slate-500 font-light tracking-wide order-2 md:order-1 text-center md:text-left">
          &ldquo;Gió mang nỗi nhớ đi khắp phương trời, mây chở tình yêu đọng lại bờ mi.&rdquo;
        </p>

        {/* Minimal Audio widget */}
        <div 
          id="ambient_audio_player" 
          className="order-1 md:order-2 flex items-center gap-3 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 px-4 py-2.5 rounded-full shadow-lg transition-transform duration-300 hover:scale-102"
        >
          {/* Wave voice indicator visible when playing */}
          <div className="flex gap-0.5 items-center justify-center p-1 w-6 h-4">
            {[1, 2, 3, 4].map((bar) => {
              const activeHeights = ["h-3", "h-4", "h-2.5", "h-3.5"];
              const inactiveHeights = "h-1";
              return (
                <div
                  key={bar}
                  className={`w-0.5 bg-rose-400 rounded-full transition-all duration-300 ${
                    isPlaying 
                      ? `${activeHeights[bar - 1]} animate-pulse` 
                      : inactiveHeights
                  }`}
                  style={{
                    animationDelay: `${bar * 150}ms`
                  }}
                />
              );
            })}
          </div>

          {/* Current track info summary */}
          <div className="text-left max-w-[124px] overflow-hidden leading-tight">
            <p className="text-[11px] font-medium text-slate-200 truncate font-sans">
              {TRACKS[currentTrackIndex].name}
            </p>
            <p className="text-[9px] text-slate-400 truncate">
              {TRACKS[currentTrackIndex].artist}
            </p>
          </div>

          <div className="w-[1px] h-6 bg-slate-800" />

          {/* Multi-track toggle / play-pause trigger */}
          <div className="flex items-center gap-1.5 text-slate-300">
            
            {/* Play trigger button */}
            <button
              onClick={handleTogglePlay}
              className="p-1.5 rounded-full hover:bg-slate-800 hover:text-white transition-colors"
              title={isPlaying ? "Tạm Dừng Nhạc" : "Phát Nhạc Lãng Mạn"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-rose-400 fill-rose-400" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            {/* Skip track button */}
            <button
              onClick={handleNextTrack}
              className="p-1.5 rounded-full hover:bg-slate-800 hover:text-white transition-colors"
              title="Đổi Bài Nhạc Khác"
            >
              <Music className="w-3.5 h-3.5" />
            </button>

            {/* Mute button toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-full hover:bg-slate-800 hover:text-white transition-colors"
              title={isMuted ? "Mở Âm" : "Tắt Âm"}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-rose-300" />
              )}
            </button>

          </div>

          {/* Native HTML5 Audio node element */}
          <audio 
            ref={audioRef}
            src={TRACKS[currentTrackIndex].url}
            loop
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

        </div>

      </footer>

      {/* Floating dynamic toast warnings or successful copies notification */}
      {showNotification && (
        <div className="fixed bottom-24 right-4 z-50 bg-slate-900/90 border border-indigo-500/35 text-slate-100 py-3 px-5 rounded-2xl shadow-2xl backdrop-blur-lg flex items-center gap-3 animate-fade-in text-xs max-w-sm">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <p className="font-light tracking-wide leading-relaxed">{showNotification}</p>
        </div>
      )}

      {/* Settings & Share Link Personalizer Drawer Modal Overlay */}
      {isSettingsOpen && (
        <div id="settings_modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto animate-fade-in animate-duration-300">
          
          <div 
            onClick={(e) => e.stopPropagation()} // stop close on inner click
            className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] text-slate-100"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/80 sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-rose-400" />
                <h2 className="text-lg font-serif font-semibold tracking-wide">Tạo Mảnh Tình Riêng &amp; Share Link</h2>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Fields scrollable scroll-block container */}
            <form onSubmit={handleApplySettings} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              
              <div className="p-3 bg-slate-950/40 rounded-xl border border-rose-500/20 flex gap-3 text-xs leading-relaxed text-slate-300 font-light">
                <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-semibold text-rose-300 mb-0.5">Tạo Link Để Gửi Người Thương (Tự Động Đổi Định Dạng)</p>
                  <span>Mọi tùy chỉnh sẽ được nén và đóng gói vào liên kết. Khi bạn nhấn 'Tạo &amp; Sao Chép Link', hệ thống tự chuyển đổi tên miền thử nghiệm (<code className="bg-slate-950 px-1 py-0.5 rounded text-rose-400 font-mono">ais-dev-...</code>) sang dạng công khai (<code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 font-mono">ais-pre-...</code>) để người thương truy cập được lập tức mà không gặp lỗi phân quyền!</span>
                </div>
              </div>

              {/* Sender & Receiver layout */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Bạn là ai (Xưng hô)</label>
                  <input 
                    type="text" 
                    value={formSender}
                    onChange={(e) => setFormSender(e.target.value)}
                    placeholder="Ví dụ: Anh, Chồng yêu, Nam..."
                    maxLength={15}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Gửi cho ai (Xưng hô)</label>
                  <input 
                    type="text" 
                    value={formReceiver}
                    onChange={(e) => setFormReceiver(e.target.value)}
                    placeholder="Ví dụ: Em, Vợ iu, Vy..."
                    maxLength={15}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              {/* Title & Subtitle fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Tiêu đề trang chính (Hero Heading)</label>
                  <input 
                    type="text" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ví dụ: Anh Nhớ Em, Chờ Ngày Gặp Lại..."
                    maxLength={32}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Dòng trạng thái phụ (Subtitle)</label>
                  <input 
                    type="text" 
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="Ví dụ: Từng Giây Phút Chờ Đợi..."
                    maxLength={64}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              {/* Datepicker Countdown timer fields */}
              <div className="p-4 bg-slate-950/20 rounded-2xl border border-slate-800/60 space-y-3">
                <p className="text-xs font-semibold text-rose-400 tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Mốc Thời Gian Bắt Đầu (Thời điểm xa cách hoặc ngày yêu)
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 tracking-wide block">Ngày tháng</span>
                    <input 
                      type="date" 
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 tracking-wide block">Giờ phút chính xác</span>
                    <input 
                      type="time" 
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Theme custom picker */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Chọn Giao Diện Không Gian (Theme)</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(THEMES).map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setFormTheme(th.id)}
                      className={`p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-20 ${
                        formTheme === th.id 
                          ? 'border-rose-500 bg-rose-500/10 shadow-lg scale-[1.02]' 
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-200">{th.name}</span>
                      <div className="flex gap-1.5 items-center">
                        <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: th.sealColor }} />
                        <span className="text-[9px] text-slate-400 font-light truncate">Mẫu bầu trời</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Love memo details block text */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400">Lời Nhắn Gửi Trong Bức Thư (Custom Letter)</label>
                  <button 
                    type="button"
                    onClick={() => setFormMessage(DEFAULT_MESSAGE)}
                    className="text-[10px] text-rose-400 hover:underline hover:text-rose-300 font-light"
                  >
                    Khôi phục thư gốc
                  </button>
                </div>
                <textarea 
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="Hãy viết toàn bộ tâm tư, những lời hứa ngọt ngào của bạn gửi gắm nơi đây..."
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-slate-200 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 font-sans custom-scrollbar"
                />
              </div>

            </form>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-slate-800/60 bg-slate-950/40 flex justify-between items-center gap-3">
              
              <button 
                type="button"
                onClick={handleResetDefaults}
                className="px-4 py-2 text-xs font-light tracking-wide text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-xl transition-colors"
              >
                Nhập Lại Mặc Định
              </button>

              <div className="flex gap-2">
                {/* Apply locally but dont generate share string */}
                <button 
                  type="button"
                  onClick={handleApplySettings}
                  className="px-4 py-2 text-xs bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-100 rounded-xl transition-all"
                >
                  Áp dụng thử trên máy
                </button>

                {/* Main Action: Generate compressed Base64 share parameter URL */}
                <button 
                  type="button"
                  onClick={handleGenerateShareUrl}
                  className="px-5 py-2 text-xs bg-gradient-to-r from-rose-600 to-pink-500 text-white font-medium hover:from-rose-500 hover:to-pink-400 rounded-xl transition-all shadow-lg shadow-rose-950/30 flex items-center gap-1.5 animate-bounce-short"
                >
                  {shareSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã Tạo Thành Công!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Tạo &amp; Sao Chép Link</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
