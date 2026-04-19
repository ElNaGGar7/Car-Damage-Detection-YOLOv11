'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Car, Home, ClipboardList, PlusCircle, Bell, UserCircle, LogOut,
  Menu, Camera, BarChart3, DollarSign, CheckCircle, AlertTriangle,
  Target, TrendingUp, Clock, Inbox, ChevronLeft, CircleDot, Layers, TriangleAlert, Zap,
  Download, Share2, Calendar, MapPin, Phone, Eye, EyeOff, Upload, RotateCcw, Trash2, ImagePlus,
  Maximize2, Minimize2, X
} from 'lucide-react';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import { useLang } from '@/contexts/LanguageContext';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface DashboardPageProps {
  user: User;
  token: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface DamageItem {
  type: string;
  severity: string;
  severityAr?: string;
  severityEn?: string;
  location: string;
  locationEn?: string;
  label?: string;
  estimatedCost: number;
  description: string;
  descriptionEn?: string;
  bbox?: BBox;
  confidence?: number;
}

interface Estimation {
  id: string;
  carName: string;
  carModel: string;
  carYear: string;
  totalCost: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed';
  confidence: number;
  damages: DamageItem[];
  createdAt: string;
}

interface Stats {
  totalEstimations: number;
  savedMoney: number;
  completedEstimations: number;
  pendingEstimations: number;
  averageCost: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const carBrands: Record<string, string[]> = {
  'تويوتا': ['كامري', 'كورولا', 'لاند كروزر', 'هايلكس', 'يارس', 'راف فور', 'أفالون', 'برادو', 'C-HR', 'فورتشنر', 'راش', 'كورولا كروس', 'هايليكس'],
  'هيونداي': ['أكسنت', 'النترا', 'توسان', 'سوناتا', 'كريتا', 'إلنترا HD', 'سنتافي', 'أيونيك 5', 'فيرنا', 'i10', 'i20', 'إلنترا'],
  'نيسان': ['صني', 'جوك', 'قشقاي', 'باترول', 'سنترا', 'ألتيما', 'إكس تريل', 'نافارا', 'ميكرا', 'بلاسرما', 'كيكس', 'جي تي آر'],
  'كيا': ['ريو', 'سيراتو', 'سبورتاج', 'أوبتيما', 'سورينتو', 'بيكانتو', 'كارنفال', 'سيلتوس', 'كادو', 'K5', 'K8', 'نيرو'],
  'شيفروليه': ['لانوس', 'أفيو', 'كروز', 'أوبترا', 'إكوينوكس', 'تاهو', ' captiva', 'أورلاندو', 'ماليبو', 'سبارك', 'كابتيفا'],
  'بي إم دبليو': ['320i', '520i', 'X3', 'X5', '740i', 'X7', '330i', 'X1', 'X2', 'X4', 'X6', 'Z4', 'i4', 'iX'],
  'مرسيدس': ['C200', 'E200', 'S500', 'GLC', 'GLE', 'A200', 'GLA', 'S400', 'E300', 'C300', 'GLB', 'GLS', 'AMG GT', 'CLA'],
  'أودي': ['A3', 'A4', 'A6', 'Q5', 'Q7', 'A5', 'TT', 'Q2', 'Q3', 'Q8', 'A7', 'A8', 'RS3', 'RS6', 'e-tron'],
  'فولكسفاغن': ['جولف', 'تيجوان', 'باسات', 'بولو', 'أطلس', 'آيدي 4', 'تيغوان', 'جيتا', 'سيكات', 'أرتيون', 'توارق'],
  'هوندا': ['سيفيك', 'أكورد', 'CR-V', 'سيتي', 'HR-V', 'بايلوت', 'جاز', 'بريليود', 'أوديسي', 'إنسايت'],
  'فورد': ['فوكس', 'فيوجن', 'إكسبلورر', 'رينجر', 'إيكو سبورت', 'موستانج', 'فيغو', 'بروكو', 'إيدج', 'F-150', 'إكسبيديشن', 'مافريك'],
  'بيجو': ['301', '308', '508', '2008', '3008', '5008', '208', '308 SW', '2008', 'رينجر'],
  'رينو': ['لوجان', 'سانديرو', 'داستر', 'كادجار', 'ميجان', 'كابتشر', 'فلوينس', 'كليو', 'سيمبول', 'كوليوس', 'آركانا'],
  'سوزوكي': ['سويفت', 'ديزاير', 'فيتارا', 'إرتيجا', 'جيمني', 'سياز', 'بالينو', 'إيجنيز', 'سيليريو', 'جيمني', 'سوزوكي جيمني'],
  'ميتسوبيشي': ['لانسر', 'باجيرو', 'أوتلاندر', 'أتيس', 'إكليبس كروس', 'مونتيرو', 'L200', 'أتراج', 'Pajero Sport', 'إكليبس كروس'],
  'سكودا': ['أوكتافيا', 'سوبيرب', 'كودياك', 'كاميك', 'رابيد', 'فابيا', 'كاروك', 'سكالا', 'إنياك'],
  'فيات': ['تيبو', '500', 'بونتو', 'لينيا', 'باندو', '500X', 'أرجنتا', 'إيجيا'],
  'سيات': ['إيبيزا', 'ليون', 'أتيكا', 'أرونا', 'تاراكو', 'توليدو', 'ميست'],
  'MG': ['ZS', 'HS', '5', '6', 'GX', 'Marvel R', 'One'],
  'شيري': ['تيجو 2', 'تيجو 4', 'تيجو 7', 'تيجو 8', 'أريزو 5', 'أريزو 6', 'إكسيد'],
  'جيلي': ['إمجراند', 'مونجارو', 'كولراي', 'ستارري', 'أزكارا', 'توجيلا', 'بينراي'],
  'بروتون': ['ساجا', 'X50', 'X70', 'بيرسونا', 'إكسورا', 'إيرز'],
  'هافال': ['H6', 'Jolion', 'Dargo', 'F7', 'M6', 'H9'],
  'فولفو': ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90'],
  'لكزس': ['ES', 'IS', 'NX', 'RX', 'LX', 'UX', 'LS', 'GX'],
  'إنفينيتي': ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  'جاجوار': ['XE', 'XF', 'XJ', 'F-Pace', 'E-Pace', 'I-Pace'],
  'لاند روفر': ['رينج روفر', 'رينج روفر سبورت', 'ديسكفري', 'ديفندر', 'إيفوك', 'سبورت'],
  'بورش': ['كايين', 'ماكان', 'تايكان', '911', 'باناميرا', 'كايين كوبيه'],
  'لينكولن': ['نافيغيتور', 'أفييتور', 'MKZ', 'كورساتير', 'زيفير'],
  'كاديلاك': ['إسكاليد', 'CTS', 'XT5', 'XT4', 'CT5'],
  'جيب': ['رينقلي', 'جراند شيروكي', 'شيروكي', 'كومباس', 'رانجلر'],
  'سوبارو': ['إمبريزا', 'أوتباك', 'فورستر', 'XV', 'برزي', 'WRX'],
  'مازدا': ['3', '6', 'CX-3', 'CX-5', 'CX-9', 'CX-30', 'MX-5', 'MAZDA2'],
  'دايهاتسو': ['ميرا', 'كوبي', 'روكي', 'هيجيت', 'تيريل', 'أتراي'],
  'هيونداي N': ['آي20 N', 'آي30 N', 'كونا N', 'توسان N', 'إلنترا N'],
  'تسلا': ['موديل 3', 'موديل Y', 'موديل S', 'موديل X'],
  'BYD': ['سول', 'هان', 'تونغ', 'سيلف', 'أوتو 3', 'دولفين', 'سيجل'],
};

const years = Array.from({ length: 20 }, (_, i) => String(2025 - i));

const carImages: Record<string, string> = {
  'تويوتا': '/images/toyota-camry.png',
  'بي إم دبليو': '/images/bmw-320i.png',
  'مرسيدس': '/images/mercedes-c200.png',
  'هيونداي': '/images/hyundai-accent.png',
};

function getCarImage(carName: string): string {
  for (const [key, value] of Object.entries(carImages)) {
    if (carName.includes(key)) return value;
  }
  return '/images/hero-car.png';
}

export default function DashboardPage({ user, token, onNavigate, onLogout }: DashboardPageProps) {
  const [activeNav, setActiveNav] = useState('home');
  const [stats, setStats] = useState<Stats | null>(null);
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(user);

  const [newAnalysisForm, setNewAnalysisForm] = useState({ carName: '', carModel: '', carYear: '' });
  const [analysisResult, setAnalysisResult] = useState<Estimation | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showCarImages, setShowCarImages] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { t, lang, isRTL, toggleLang } = useLang();

  const navItems = [
    { id: 'new-analysis', icon: PlusCircle, label: t('newAnalysis') },
    { id: 'home', icon: Home, label: t('home') },
    { id: 'estimations', icon: ClipboardList, label: t('estimations') },
    { id: 'notifications', icon: Bell, label: t('notifications') },
    { id: 'profile', icon: UserCircle, label: t('profile') },
  ];

  const fetchData = useCallback(async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      const [statsRes, estimationsRes, notifsRes, profileRes] = await Promise.all([
        fetch('/api/stats', { headers }),
        fetch('/api/estimations?limit=50', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/user/profile', { headers }),
      ]);
      const statsData = await statsRes.json();
      const estData = await estimationsRes.json();
      const notifsData = await notifsRes.json();
      const profileData = await profileRes.json();
      if (statsData.success) setStats(statsData.stats);
      if (estData.success) setEstimations(estData.estimations);
      if (notifsData.success) setNotifications(notifsData.notifications);
      if (profileData.success && profileData.user) {
        setCurrentUser(profileData.user);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      // First: send image to AI for analysis
      let analysisData = null;
      if (capturedImage) {
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            carName: newAnalysisForm.carName,
            carModel: newAnalysisForm.carModel,
            carYear: newAnalysisForm.carYear,
            imageBase64: capturedImage,
          }),
        });
        const analyzeResult = await analyzeRes.json();
        if (analyzeResult.success) {
          analysisData = analyzeResult.analysis;
        }
      }

      // Second: create estimation record (with AI data or mock)
      const res = await fetch('/api/estimations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAnalysisForm,
          imageBase64: capturedImage || undefined,
          aiAnalysis: analysisData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data.estimation);
        fetchData();
      }
    } catch {
      // silent fail
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    onNavigate('landing');
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // silent
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ─── Delete estimation ───
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteEstimation = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/estimations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEstimations(prev => prev.filter(e => e.id !== id));
        if (analysisResult?.id === id) setAnalysisResult(null);
      }
    } catch {
      // silent
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getAnalysisLevel = () => {
    const count = estimations.length;
    if (count >= 20) return { level: 4, cls: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' };
    if (count >= 10) return { level: 3, cls: 'badge badge-info' };
    if (count >= 5) return { level: 2, cls: 'badge badge-success' };
    if (count >= 1) return { level: 1, cls: 'badge badge-warning' };
    return null;
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; cls: string; icon: typeof CheckCircle }> = {
      completed: { label: t('completed'), cls: 'badge badge-success', icon: CheckCircle },
      pending: { label: t('pending'), cls: 'badge badge-warning', icon: Clock },
      processing: { label: t('processing'), cls: 'badge badge-info', icon: BarChart3 },
    };
    return map[status] || { label: status, cls: 'badge badge-muted', icon: AlertTriangle };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDamageIcon = (type: string) => {
    switch (type) {
      case 'dent': return <CircleDot className="w-4 h-4 text-teal-400" />;
      case 'scratch': return <Layers className="w-4 h-4 text-amber-400" />;
      case 'break': return <TriangleAlert className="w-4 h-4 text-red-400" />;
      case 'crack': return <Zap className="w-4 h-4 text-orange-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-[var(--text-dim)]" />;
    }
  };

  const getDamageLabel = (type: string) => {
    switch (type) {
      case 'dent': return t('dent');
      case 'scratch': return t('scratch');
      case 'break': return t('break');
      case 'crack': return t('crack');
      default: return t('other');
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low': return t('low');
      case 'medium': return t('medium');
      case 'high': return t('severe');
      default: return severity;
    }
  };

  const startCamera = async () => {
    try {
      // On mobile, use native camera via input[capture]
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        cameraInputRef.current?.click();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      setCameraMode(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      // Fallback to file input if camera not available
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraMode(false);
  };

  // ─── Reusable bounding-box drawer ───
  const drawBoxesOnCanvas = useCallback((targetCanvas: HTMLCanvasElement, imgSrc: string, damages: NonNullable<typeof analysisResult>['damages']) => {
    const damagesWithBbox = damages.filter(d => d.bbox);
    console.log('Damages:', damages.length, 'With bbox:', damagesWithBbox.length);
    if (damagesWithBbox.length === 0) return;
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log('Image loaded, drawing boxes');
      requestAnimationFrame(() => {
        const cw = targetCanvas.parentElement?.clientWidth || targetCanvas.width || 1200;
        const scale = img.width > cw ? cw / img.width : 1;
        const dw = Math.round(img.width * scale);
        const dh = Math.round(img.height * scale);
        targetCanvas.width = dw;
        targetCanvas.height = dh;
        ctx.drawImage(img, 0, 0, dw, dh);

        const themes: Record<string, { main: string; glow: string; fill: string; gradient: [string, string]; light: string }> = {
          high:   { main: '#ff3b3b', glow: 'rgba(255,59,59,0.35)', fill: 'rgba(255,59,59,0.12)', gradient: ['#ff3b3b', '#ff6b6b'], light: 'rgba(255,100,100,0.08)' },
          medium: { main: '#ff9f1c', glow: 'rgba(255,159,28,0.35)', fill: 'rgba(255,159,28,0.12)', gradient: ['#ff9f1c', '#ffbf69'], light: 'rgba(255,175,50,0.08)' },
          low:    { main: '#00c853', glow: 'rgba(0,200,83,0.30)', fill: 'rgba(0,200,83,0.10)', gradient: ['#00c853', '#69f0ae'], light: 'rgba(80,220,130,0.06)' },
        };
        const getTheme = (sev: string) => themes[sev] || themes.medium;
        const rrp = (x: number, y: number, w: number, h: number, r: number) => {
          ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
          ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
          ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
          ctx.closePath();
        };

        damagesWithBbox.forEach((d, idx) => {
          if (!d.bbox) return;
          const theme = getTheme(d.severity);
          const bx = d.bbox.x1 * dw; const by = d.bbox.y1 * dh;
          const bw = (d.bbox.x2 - d.bbox.x1) * dw; const bh = (d.bbox.y2 - d.bbox.y1) * dh;
          const bx2 = bx + bw; const by2 = by + bh;

          const grad = ctx.createLinearGradient(bx, by, bx2, by2);
          grad.addColorStop(0, theme.fill); grad.addColorStop(1, 'rgba(0,0,0,0.06)');
          ctx.fillStyle = grad; rrp(bx, by, bw, bh, 6); ctx.fill();

          ctx.save(); ctx.shadowColor = theme.glow; ctx.shadowBlur = 18;
          ctx.strokeStyle = theme.main; ctx.lineWidth = 2; rrp(bx, by, bw, bh, 6); ctx.stroke(); ctx.restore();

          ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = theme.light; ctx.lineWidth = 1;
          rrp(bx + 3, by + 3, bw - 6, bh - 6, 4); ctx.stroke(); ctx.restore(); ctx.setLineDash([]);

          const cl = Math.max(14, Math.min(bw, bh) * 0.22);
          ctx.lineWidth = 3.5; ctx.strokeStyle = theme.main; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(bx - 1, by + cl); ctx.lineTo(bx - 1, by - 1); ctx.lineTo(bx + cl, by - 1); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx2 - cl, by - 1); ctx.lineTo(bx2 + 1, by - 1); ctx.lineTo(bx2 + 1, by + cl); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx - 1, by2 - cl); ctx.lineTo(bx - 1, by2 + 1); ctx.lineTo(bx + cl, by2 + 1); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx2 - cl, by2 + 1); ctx.lineTo(bx2 + 1, by2 + 1); ctx.lineTo(bx2 + 1, by2 - cl); ctx.stroke();
          ctx.lineCap = 'butt';

          const scanY = by + bh * 0.55;
          const scanG = ctx.createLinearGradient(bx, scanY, bx2, scanY);
          scanG.addColorStop(0, 'rgba(0,0,0,0)'); scanG.addColorStop(0.3, theme.main + '55');
          scanG.addColorStop(0.5, theme.main + 'aa'); scanG.addColorStop(0.7, theme.main + '55'); scanG.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.strokeStyle = scanG; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(bx + 6, scanY); ctx.lineTo(bx2 - 6, scanY); ctx.stroke();

          const cx = bx + bw / 2; const cy = by + bh / 2;
          ctx.fillStyle = theme.main + 'cc'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = theme.main + '44'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10); ctx.stroke();

          const bR = 12; const bX = bx + 8; const bY = by + 8;
          ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 6;
          ctx.fillStyle = theme.main; ctx.beginPath(); ctx.arc(bX + bR, bY + bR, bR, 0, Math.PI * 2); ctx.fill(); ctx.restore();
          ctx.fillStyle = '#fff'; ctx.font = `bold ${bR + 1}px Arial, "Segoe UI", sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(idx + 1), bX + bR, bY + bR + 1); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';

          const typeText = getDamageLabel(d.type);
          const arName = d.location || typeText;
          const text = arName;
          const maxTextWidth = Math.max(bw - 16, 40);
          let fontSize = 28;
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = 'rgba(0,0,0,0.7)';
          ctx.lineWidth = 5;
          ctx.textBaseline = 'top';
          while (fontSize >= 14) {
            ctx.font = `bold ${fontSize}px Arial, "Segoe UI", Tahoma, sans-serif`;
            if (ctx.measureText(text).width <= maxTextWidth) break;
            fontSize -= 2;
          }
          const dX = bx;
          let dY = by - fontSize - 6;
          if (dY < 4) dY = 4;
          ctx.textAlign = 'left';
          ctx.strokeText(text, dX, dY);
          ctx.fillText(text, dX, dY);
          ctx.textBaseline = 'alphabetic';
        });

        const bH = 32; const bGr = ctx.createLinearGradient(0, dh - bH, 0, dh);
        bGr.addColorStop(0, 'rgba(0,0,0,0)'); bGr.addColorStop(0.4, 'rgba(0,0,0,0.6)'); bGr.addColorStop(1, 'rgba(0,0,0,0.75)');
        ctx.fillStyle = bGr; ctx.fillRect(0, dh - bH, dw, bH);
        ctx.font = 'bold 11px Arial, "Segoe UI", Tahoma, sans-serif'; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle';
        ctx.fillText(`AutoCost AI  •  ${damagesWithBbox.length} detection${damagesWithBbox.length > 1 ? 's' : ''}  •  YOLOv8`, 12, dh - bH / 2);
        ctx.textAlign = 'end'; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '10px Arial, "Segoe UI", Tahoma, sans-serif';
        ctx.fillText(new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'), dw - 12, dh - bH / 2);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
      });
    };
    img.src = imgSrc;
  }, []);

  // ─── Draw on normal canvas ───
  useEffect(() => {
    const canvas = resultCanvasRef.current;
    if (!canvas || !capturedImage || !analysisResult?.damages?.length) return;
    drawBoxesOnCanvas(canvas, capturedImage, analysisResult.damages);
  }, [analysisResult, capturedImage, drawBoxesOnCanvas]);

  // ─── Draw on fullscreen canvas ───
  useEffect(() => {
    if (!isFullscreen || !fullscreenCanvasRef.current || !capturedImage || !analysisResult?.damages?.length) return;
    const timer = setTimeout(() => {
      drawBoxesOnCanvas(fullscreenCanvasRef.current!, capturedImage, analysisResult.damages);
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen, analysisResult, capturedImage, drawBoxesOnCanvas]);

  // ─── ESC to close fullscreen ───
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  return (
    <div className="relative min-h-screen flex" style={{ fontFamily: 'var(--font-cairo), Cairo, sans-serif' }}>
      <AnimatedBackground />

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ===== Top Navigation Bar ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.97), rgba(11, 17, 32, 0.99))', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Right section: Logo + Profile */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center glass-subtle"
              >
                <Menu className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
              {/* Logo */}
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700 flex-shrink-0">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gradient hidden sm:inline">AutoCost</span>
              </div>
              {/* Separator */}
              <div className="hidden sm:block w-px h-6" style={{ background: 'var(--border-subtle)' }} />
              {/* User info */}
              <button onClick={() => setActiveNav('profile')} className="flex items-center gap-2 sm:gap-2.5 transition-all hover:opacity-80">
                <div className="w-8 h-8 rounded-full border-2 border-teal-400/30 flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(14, 165, 233, 0.15))' }}>
                  {currentUser.avatar ? <img src={currentUser.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : <UserCircle className="w-4 h-4 text-[var(--primary-light)]" />}
                </div>
                <div className="hidden sm:block text-right">
                  <div className="font-bold text-[11px] leading-tight truncate max-w-[100px]">{currentUser.name}</div>
                  <div className="text-[var(--text-muted)] text-[9px] leading-tight truncate max-w-[100px]">{currentUser.email}</div>
                </div>
              </button>
            </div>

            {/* Center section: Nav items (desktop only) */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-[11px] font-medium whitespace-nowrap ${activeNav === item.id ? 'bg-teal-500/15 text-[var(--primary-light)] border border-teal-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03] border border-transparent'}`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center font-bold text-white">{unreadCount}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Left section: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowCarImages(!showCarImages)}
                className="w-8 h-8 rounded-lg flex items-center justify-center glass-subtle transition-all"
                title={showCarImages ? t('hideCarImages') : t('showCarImages')}
              >
                {showCarImages ? <Eye className="w-4 h-4 text-[var(--primary-light)]" /> : <EyeOff className="w-4 h-4 text-[var(--text-muted)]" />}
              </button>
              {getAnalysisLevel() && (
                <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.15)' }}>
                  <ClipboardList className="w-3 h-3 text-[var(--primary-light)]" />
                  <span className={`${getAnalysisLevel()!.cls} text-[9px] font-medium`}>{estimations.length} {t('newAnalysis')}</span>
                </div>
              )}
              {/* Language Toggle */}
              <button
                onClick={toggleLang}
                className="w-8 h-8 rounded-lg flex items-center justify-center glass-subtle transition-all hover:scale-105 cursor-pointer"
                title={t('language')}
              >
                <span className="text-[10px] font-black text-[var(--primary-light)]">
                  {lang === 'ar' ? 'EN' : 'عر'}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(11, 17, 32, 0.98)' }}>
            <div className="px-3 py-2 space-y-1">
              {navItems.map(item => {
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveNav(item.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-xs font-medium ${activeNav === item.id ? 'bg-teal-500/15 text-[var(--primary-light)] border border-teal-500/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.03] border border-transparent'}`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                    {item.id === 'notifications' && unreadCount > 0 && (
                      <span className="mr-auto w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">{unreadCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* ===== Main Content ===== */}
      <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 relative z-10 min-h-screen mt-[56px] sm:mt-[64px]">

        {/* Header */}
        <header className="mb-6">
          <div>
            <h1 className="text-base md:text-lg font-bold">
              {t('welcomeMsg')}, <span className="text-gradient">{currentUser.name}</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-[10px] mt-0.5">{t('dashboardSubtitle')}</p>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="spinner spinner-accent mx-auto mb-4" style={{ width: 36, height: 36, borderWidth: 3 }} />
              <div className="text-[var(--text-secondary)] text-sm">{t('loading')}</div>
            </div>
          </div>
        ) : (
          <>
            {/* ===== Home Tab ===== */}
            {activeNav === 'home' && (
              <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                {/* Stats Grid */}
                {stats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { icon: ClipboardList, value: stats.totalEstimations, label: t('totalEstimations'), change: '+12%', color: '#14B8A6' },
                      { icon: DollarSign, value: `${(stats.savedMoney / 1000).toFixed(1)}K`, label: t('savedMoney'), change: '+30%', color: '#0EA5E9' },
                      { icon: CheckCircle, value: stats.completedEstimations, label: t('completedEstimations'), change: '+8%', color: '#22c55e' },
                      { icon: TrendingUp, value: stats.averageCost.toLocaleString(), label: t('averageCost'), change: '', color: '#F59E0B' },
                    ].map((s) => (
                      <div key={s.label} className="stat-card">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}12` }}>
                            <s.icon className="w-[18px] h-[18px]" style={{ color: s.color }} />
                          </div>
                          {s.change && <span className="badge badge-success">{s.change}</span>}
                        </div>
                        <div className="text-base lg:text-lg font-black text-gradient">{s.value}</div>
                        <div className="text-[var(--text-secondary)] text-[11px] mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <button
                    onClick={() => setActiveNav('new-analysis')}
                    className="md:col-span-2 flex items-center gap-4 p-4 rounded-xl transition-all hover:border-[var(--primary)]/25 hover:-translate-y-0.5 relative overflow-hidden group card-static cursor-pointer"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <Image src="/images/dashboard-bg.png" alt="" fill className="object-cover" />
                    </div>
                    <div className="relative z-10 w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700 flex-shrink-0">
                      <PlusCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="relative z-10 text-right flex-1">
                      <div className="font-bold text-xs sm:text-sm">{t('newDamageAnalysis')}</div>
                      <div className="text-[var(--text-secondary)] text-[10px] sm:text-[11px] mt-0.5">{t('newDamageDesc')}</div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[var(--text-dim)] mr-auto relative z-10" />
                  </button>
                  <button
                    onClick={() => setActiveNav('estimations')}
                    className="flex items-center gap-3 p-4 rounded-xl transition-all hover:border-[var(--primary)]/25 hover:-translate-y-0.5 card-static cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-sky-500 to-sky-700">
                      <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs sm:text-sm">{t('previousEstimations')}</div>
                      <div className="text-[var(--text-secondary)] text-[10px] sm:text-[11px]">{estimations.length} {t('reports')}</div>
                    </div>
                  </button>
                </div>

                {/* Recent Estimations */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold section-title">{t('latestEstimations')}</h2>
                    <button onClick={() => setActiveNav('estimations')} className="text-[var(--primary-light)] text-xs hover:text-[var(--primary)] transition-colors">
                      {t('viewAll')} {isRTL ? '←' : '→'}
                    </button>
                  </div>
                  <div className="card-static p-4 relative overflow-hidden">
                    {estimations.length === 0 ? (
                      <div className="text-center py-16 text-[var(--text-dim)]">
                        <Image src="/images/hero-car.png" alt="" width={120} height={80} className="mx-auto mb-4 rounded-xl opacity-20" />
                        <div className="text-sm mb-2">{t('noEstimations')}</div>
                        <button onClick={() => setActiveNav('new-analysis')} className="btn-primary px-5 py-2.5 text-xs">
                          {t('startFirstAnalysis')}
                        </button>
                      </div>
                    ) : (
                      <div className="p-1 space-y-2 max-h-[500px] overflow-y-auto">
                        {estimations.slice(0, 5).map(est => {
                          const st = getStatusLabel(est.status);
                          return (
                            <div
                              key={est.id}
                              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all hover:bg-white/[0.02] cursor-pointer"
                              style={{ border: '1px solid var(--border-subtle)' }}
                            >
                              {showCarImages && (
                                <div className="w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
                                  <Image src={getCarImage(est.carName)} alt={est.carName} fill className="object-cover" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs sm:text-sm truncate">{est.carName} {est.carModel} {est.carYear}</div>
                                <div className="text-[var(--text-secondary)] text-[10px] sm:text-xs flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(est.createdAt)}</span>
                                  <span className="text-[var(--border-light)]">•</span>
                                  <span>{est.damages.length} {t('damages')}</span>
                                  <span className="text-[var(--border-light)]">•</span>
                                  <span>{t('confidence')} {est.confidence}%</span>
                                </div>
                              </div>
                              <div className="text-left flex-shrink-0">
                                <div className="text-[var(--primary-light)] font-bold text-xs sm:text-sm">{est.totalCost.toLocaleString()} {t('egp')}</div>
                                <span className={`${st.cls} mt-1 inline-flex`}>{st.label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===== Estimations Tab ===== */}
            {activeNav === 'estimations' && (
              <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold section-title">{t('allEstimations')}</h2>
                  <div className="flex items-center gap-2">
                    {estimations.length > 0 && (
                      <button
                        onClick={() => setDeleteTarget('all')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all hover:bg-red-500/10 text-red-400/70 hover:text-red-400 cursor-pointer"
                        style={{ border: '1px solid rgba(239,68,68,0.15)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('deleteAll')}
                      </button>
                    )}
                    <button onClick={() => setActiveNav('new-analysis')} className="btn-primary px-3 py-1.5 text-[11px]">
                      <PlusCircle className="w-4 h-4" />
                      {t('newAnalysisBtn')}
                    </button>
                  </div>
                </div>
                <div className="card-static p-4 relative overflow-hidden">
                  {estimations.length === 0 ? (
                    <div className="text-center py-20 text-[var(--text-dim)]">
                      <Image src="/images/hero-car.png" alt="" width={150} height={100} className="mx-auto mb-4 rounded-xl opacity-20" />
                      <div className="text-sm mb-4">{t('noAnalysisYet')}</div>
                      <button onClick={() => setActiveNav('new-analysis')} className="btn-primary px-6 py-3 text-sm">
                        {t('startNewNow')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto p-1">
                      {estimations.map(est => {
                        const st = getStatusLabel(est.status);
                        return (
                          <div
                            key={est.id}
                            className="p-3 sm:p-5 rounded-xl transition-all hover:bg-white/[0.02] cursor-pointer"
                            style={{ border: '1px solid var(--border-subtle)' }}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 mb-3">
                              {showCarImages && (
                                <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                                  <Image src={getCarImage(est.carName)} alt={est.carName} fill className="object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs sm:text-sm">{est.carName} {est.carModel} {est.carYear}</div>
                                <div className="text-[var(--text-secondary)] text-[10px] sm:text-xs flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(est.createdAt)}</span>
                                  <span>{t('confidence')}: {est.confidence}%</span>
                                  <span>{est.damages.length} {t('damages')}</span>
                                </div>
                              </div>
                              <div className="text-left flex-shrink-0">
                                <div className="text-[var(--primary-light)] font-bold text-xs sm:text-sm">{est.totalCost.toLocaleString()} {t('egp')}</div>
                                <span className={`${st.cls} mt-1 inline-flex`}>{st.label}</span>
                              </div>
                              {/* Delete single item button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(est.id); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:bg-red-500/15 text-[var(--text-dim)] hover:text-red-400 cursor-pointer"
                                title={t('deleteAnalysis')}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {est.damages.map((d, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                                  style={{ background: 'rgba(20, 184, 166, 0.05)', border: '1px solid var(--border-subtle)' }}
                                >
                                  {getDamageIcon(d.type)}
                                  {getDamageLabel(d.type)} - {d.location}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== New Analysis Tab ===== */}
            {activeNav === 'new-analysis' && (
              <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                <h2 className="text-sm md:text-base font-bold mb-4 section-title">{t('newDamageAnalysis')}</h2>
                {/* Form - Full Width */}
                <div className="card-static p-5 sm:p-6 md:p-8 relative overflow-hidden">
                    <form onSubmit={handleAnalyze} className="space-y-5 sm:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                          {/* Car Brand Select */}
                          <div>
                            <label className="block mb-1.5 font-medium text-[var(--text-secondary)] text-[11px]">{t('carName')}</label>
                            <div className="relative">
                              <select
                                value={newAnalysisForm.carName}
                                onChange={e => setNewAnalysisForm({ ...newAnalysisForm, carName: e.target.value, carModel: '' })}
                                className="input-field text-xs py-2.5 appearance-none cursor-pointer pr-10"
                                required
                                style={{ background: 'var(--bg-input, rgba(15, 23, 42, 0.6))' }}
                              >
                                <option value="">{t('selectBrand')}</option>
                                {Object.keys(carBrands).map(brand => (
                                  <option key={brand} value={brand}>{brand}</option>
                                ))}
                              </select>
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              </div>
                            </div>
                          </div>
                          {/* Car Model Select */}
                          <div>
                            <label className="block mb-1.5 font-medium text-[var(--text-secondary)] text-[11px]">{t('carModel')}</label>
                            <div className="relative">
                              <select
                                value={newAnalysisForm.carModel}
                                onChange={e => setNewAnalysisForm({ ...newAnalysisForm, carModel: e.target.value })}
                                className="input-field text-xs py-2.5 appearance-none cursor-pointer pr-10"
                                required
                                disabled={!newAnalysisForm.carName}
                                style={{ background: 'var(--bg-input, rgba(15, 23, 42, 0.6))', opacity: newAnalysisForm.carName ? 1 : 0.5 }}
                              >
                                <option value="">{newAnalysisForm.carName ? t('selectModel') : t('selectBrandFirst')}</option>
                                {newAnalysisForm.carName && carBrands[newAnalysisForm.carName]?.map(model => (
                                  <option key={model} value={model}>{model}</option>
                                ))}
                              </select>
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              </div>
                            </div>
                          </div>
                          {/* Year Select */}
                          <div>
                            <label className="block mb-1.5 font-medium text-[var(--text-secondary)] text-[11px]">{t('carYear')}</label>
                            <div className="relative">
                              <select
                                value={newAnalysisForm.carYear}
                                onChange={e => setNewAnalysisForm({ ...newAnalysisForm, carYear: e.target.value })}
                                className="input-field text-xs py-2.5 appearance-none cursor-pointer pr-10"
                                required
                                style={{ background: 'var(--bg-input, rgba(15, 23, 42, 0.6))' }}
                              >
                                <option value="">{t('selectYear')}</option>
                                {years.map(year => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronLeft className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Image Upload / Camera Area */}
                        <div>
                          <label className="block mb-1.5 font-medium text-[var(--text-secondary)] text-[11px]">{t('damageImage')}</label>

                          {/* Captured Image Preview */}
                          {capturedImage ? (
                            <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                              <img src={capturedImage} alt={t('damageImage')} className="w-full h-56 sm:h-72 object-cover" />
                              <div className="absolute top-2 left-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => { setCapturedImage(null); setCameraMode(false); }}
                                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-black/60 hover:bg-black/80 transition-colors backdrop-blur-sm"
                                  title={t('removeImage')}
                                >
                                  <Trash2 className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setCapturedImage(null); startCamera(); }}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/60 hover:bg-black/80 transition-colors backdrop-blur-sm"
                                  title={t('retakePhoto')}
                                >
                                  <RotateCcw className="w-3.5 h-3.5 text-white" />
                                </button>
                              </div>
                              <div className="absolute bottom-2 right-2">
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-sm">{t('imageCaptured')}</span>
                              </div>
                            </div>
                          ) : cameraMode && cameraStream ? (
                            /* Camera Live View */
                            <div className="relative rounded-xl overflow-hidden" style={{ border: '2px solid var(--primary)', background: '#000' }}>
                              <video ref={videoRef} autoPlay playsInline className="w-full h-56 sm:h-72 object-cover" />
                              <canvas ref={canvasRef} className="hidden" />
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3">
                                <button
                                  type="button"
                                  onClick={capturePhoto}
                                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                                  title="التقاط الصورة"
                                >
                                  <div className="w-11 h-11 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-red-500" />
                                  </div>
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={stopCamera}
                                className="absolute top-2 left-2 w-9 h-9 rounded-lg flex items-center justify-center bg-black/60 hover:bg-black/80 transition-colors backdrop-blur-sm"
                                title={t('close')}
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                              <div className="absolute top-2 right-2">
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500/90 text-white backdrop-blur-sm animate-pulse">LIVE</span>
                              </div>
                            </div>
                          ) : (
                            /* Upload / Camera Options */
                            <div className="space-y-3">
                              <div
                                className="drop-area cursor-pointer hover:border-[var(--primary)]/30 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--primary)] opacity-40" />
                                <div className="text-[var(--text-secondary)] font-medium mb-1 text-[11px]">{t('dropImageHere')}</div>
                                <div className="text-[var(--text-dim)] text-[10px]">{t('supportedFormats')}, {t('maxSize')}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                                <span className="text-[var(--text-dim)] text-[10px] font-medium">{t('or')}</span>
                                <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
                              </div>
                              <button
                                type="button"
                                onClick={startCamera}
                                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[11px] font-medium"
                                style={{ background: 'rgba(20, 184, 166, 0.08)', border: '1px dashed rgba(20, 184, 166, 0.3)', color: 'var(--primary-light)' }}
                              >
                                <Camera className="w-4 h-4" />
                                {t('takePhoto')}
                              </button>
                            </div>
                          )}

                          {/* Hidden file inputs */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setCapturedImage(ev.target?.result as string);
                                reader.readAsDataURL(file);
                              }
                              e.target.value = '';
                            }}
                          />
                          <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setCapturedImage(ev.target?.result as string);
                                reader.readAsDataURL(file);
                              }
                              e.target.value = '';
                            }}
                          />
                        </div>

                        <button type="submit" disabled={analyzing} className="btn-primary w-full py-2.5 text-xs">
                          {analyzing ? (
                            <>
                              <span className="spinner" />
                              {t('analyzing')}
                            </>
                          ) : (
                            <>
                              <Target className="w-4 h-4" />
                              {t('analyzeBtn')}
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Tips - Compact strip below form */}
                    <div className="mt-5 flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(20, 184, 166, 0.04)', border: '1px solid rgba(20, 184, 166, 0.1)' }}>
                      <CheckCircle className="w-4 h-4 text-[var(--primary-light)] mt-0.5 flex-shrink-0" />
                      <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        <span className="font-semibold text-[var(--text-secondary)]">{t('tip')}:</span> {t('tipDesc')}
                      </div>
                    </div>

                {/* Analysis Result */}
                {analysisResult && (
                  <div
                    className="mt-6 p-5 md:p-6 rounded-xl relative overflow-hidden"
                    style={{ background: 'rgba(20, 184, 166, 0.04)', border: '1px solid rgba(20, 184, 166, 0.15)', animation: 'fadeInUp 0.5s ease-out' }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        {t('analysisResult')} - {analysisResult.carName} {analysisResult.carModel}
                        <span className="badge badge-info mr-2 text-[9px]">AI</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" style={{ border: '1px solid var(--border-light)' }}>
                          <Download className="w-4 h-4 text-[var(--text-secondary)]" />
                        </button>
                        <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" style={{ border: '1px solid var(--border-light)' }}>
                          <Share2 className="w-4 h-4 text-[var(--text-secondary)]" />
                        </button>
                      </div>
                    </div>

                    {/* 🖼️ Image with Bounding Boxes */}
                    {capturedImage && analysisResult?.damages?.some(d => d.bbox) && (
                      <div className="mb-5 rounded-xl overflow-hidden relative group" style={{ border: '1px solid var(--border-subtle)' }}>
                        {/* Fullscreen button overlay */}
                        <button
                          type="button"
                          onClick={() => setIsFullscreen(true)}
                          className="absolute top-3 left-3 z-20 w-10 h-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)' }}
                          title={t('zoomIn')}
                        >
                          <Maximize2 className="w-[18px] h-[18px] text-white" />
                        </button>
                        {/* Zoom hint label */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                          <span className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white/70" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}>
                            {t('zoomIn')}
                          </span>
                        </div>
                        <canvas
                          ref={resultCanvasRef}
                          className="w-full h-auto block cursor-pointer"
                          style={{ maxHeight: '400px', objectFit: 'contain' }}
                          onClick={() => setIsFullscreen(true)}
                        />
                        {/* Professional Legend */}
                        <div className="flex items-center justify-between gap-2 px-4 py-2.5" style={{ background: 'linear-gradient(135deg, rgba(15,20,35,0.95), rgba(8,12,25,0.98))', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-red-400" style={{ background: 'rgba(255,59,59,0.15)', padding: '2px 8px', borderRadius: '4px' }}>{t('severe')}</span>
                            <span className="text-[9px] font-bold text-amber-400" style={{ background: 'rgba(255,159,28,0.15)', padding: '2px 8px', borderRadius: '4px' }}>{t('medium')}</span>
                            <span className="text-[9px] font-bold text-emerald-400" style={{ background: 'rgba(0,200,83,0.12)', padding: '2px 8px', borderRadius: '4px' }}>{t('low')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-[9px] text-gray-400">YOLOv8 AI Detection</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Plain image if no bboxes detected */}
                    {capturedImage && !analysisResult?.damages?.some(d => d.bbox) && (
                      <div className="mb-5 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                        <img src={capturedImage} alt={t('damageImage')} className="w-full h-auto block" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                        <div className="text-base font-black text-gradient">{analysisResult.totalCost.toLocaleString()}</div>
                        <div className="text-[var(--text-secondary)] text-[10px] mt-0.5">{t('totalEstimatedCost')}</div>
                      </div>
                      <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                        <div className="text-base font-black text-gradient">{analysisResult.confidence}%</div>
                        <div className="text-[var(--text-secondary)] text-[10px] mt-0.5">{t('confidence')}</div>
                      </div>
                      <div className="text-center p-3 rounded-xl col-span-2 md:col-span-1" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                        <div className="text-base font-black text-gradient">{analysisResult.damages.length}</div>
                        <div className="text-[var(--text-secondary)] text-[10px] mt-0.5">{t('detectedDamages')}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--primary-light)]" />
                        {t('damageDetails')}
                      </h4>
                      {analysisResult.damages.map((d, i) => {
                        const sevColor = d.severity === 'high' ? 'text-red-400' : d.severity === 'medium' ? 'text-amber-400' : 'text-emerald-400';
                        const sevBg = d.severity === 'high' ? 'bg-red-500/10' : d.severity === 'medium' ? 'bg-amber-500/10' : 'bg-emerald-500/10';
                        return (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white/[0.01]" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                            <div className="mt-0.5 flex-shrink-0">{getDamageIcon(d.type)}</div>
                            <div className="flex-1 min-w-0">
                              {/* Arabic name - primary */}
                                      <div className="font-bold text-xs leading-relaxed">
                                {d.location || getDamageLabel(d.type)}
                              </div>
                              {/* English location or class type */}
                              {(d.locationEn || d.label || d.location) && (
                                <div className="text-[var(--text-dim)] text-[10px] font-normal mt-0.5" dir="ltr">
                                  {d.locationEn || d.label || getDamageLabel(d.type)}
                                </div>
                              )}
                              {/* Description bilingual */}
                              <div className="text-[var(--text-secondary)] text-[10px] mt-1">
                                {d.description}
                                {d.descriptionEn && (
                                  <span className="text-[var(--text-dim)] mr-1" dir="ltr"> | {d.descriptionEn}</span>
                                )}
                              </div>
                              {/* Severity + Confidence badge */}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${sevColor} ${sevBg}`}>
                                  {d.severityAr || getSeverityLabel(d.severity)}
                                  {d.severityEn && <span className="opacity-70">/ {d.severityEn}</span>}
                                </span>
                                {d.confidence != null && (
                                  <span className="text-[9px] text-[var(--text-dim)]">
                                    {t('confidence')}: {Math.round(d.confidence * 100)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Cost */}
                            <div className="flex-shrink-0 text-left">
                              <div className="text-[var(--primary-light)] font-bold text-xs whitespace-nowrap">{d.estimatedCost.toLocaleString()} {t('egp')}</div>
                              <div className="text-[var(--text-dim)] text-[8px] mt-0.5" dir="ltr">EGP</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ===== Notifications Tab ===== */}
            {activeNav === 'notifications' && (
              <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold section-title">{t('notifications')}</h2>
                  {unreadCount > 0 && (
                    <span className="text-xs text-[var(--primary-light)]">{unreadCount} {t('markRead')}</span>
                  )}
                </div>
                <div className="card-static p-4 relative overflow-hidden">
                  {notifications.length === 0 ? (
                    <div className="text-center py-20 text-[var(--text-dim)]">
                      <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <div className="text-sm mb-1">{t('noNotifications')}</div>
                      <div className="text-xs text-[var(--text-dim)] opacity-60">{t('notificationAnalysis')}</div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto p-1">
                      {notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && markNotificationRead(n.id)}
                          className={`p-4 rounded-xl cursor-pointer transition-all ${!n.read ? 'border border-[var(--primary)]/15' : ''}`}
                          style={{ background: !n.read ? 'rgba(20, 184, 166, 0.03)' : 'transparent' }}
                        >
                          <div className="flex items-start gap-3">
                            {!n.read && <div className="w-2 h-2 rounded-full bg-[var(--primary-light)] mt-2 flex-shrink-0" />}
                            <div className="flex-1">
                              <div className="font-bold text-xs">{n.title}</div>
                              <div className="text-[var(--text-secondary)] text-xs mt-1 leading-relaxed">{n.message}</div>
                              <div className="text-[var(--text-dim)] text-[10px] mt-2 flex items-center gap-1 opacity-60">
                                <Clock className="w-3 h-3" />
                                {formatDate(n.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== Profile Tab ===== */}
            {activeNav === 'profile' && (
              <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                <h2 className="text-sm font-bold mb-4 section-title">{t('profilePage')}</h2>
                <div className="card-static relative overflow-hidden">
                  {/* Cover Image */}
                  <div className="h-32 relative">
                    <Image src="/images/dashboard-bg.png" alt="" fill className="object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
                  </div>
                  <div className="px-6 md:px-8 pb-8 -mt-12 relative z-10">
                    <div className="flex flex-col items-center mb-8">
                      <div
                        className="w-20 h-20 rounded-full border-4 border-[var(--bg-card)] flex items-center justify-center mb-3 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.12), rgba(14, 165, 233, 0.12))' }}
                      >
                        {currentUser.avatar ? <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-12 h-12 text-[var(--primary-light)]" />}
                      </div>
                      <h3 className="text-base font-bold">{currentUser.name}</h3>
                      <p className="text-[var(--text-secondary)] text-xs">{currentUser.email}</p>
                      {getAnalysisLevel() && (
                        <div className={`${getAnalysisLevel()!.cls} mt-2 inline-flex items-center gap-1`}>
                          <ClipboardList className="w-3 h-3" />
                          {estimations.length} {t('estimations')}
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--primary)]/10">
                          <UserCircle className="w-3.5 h-3.5 text-[var(--primary-light)]" />
                        </div>
                        <div>
                          <div className="text-[var(--text-secondary)] text-[9px]">{t('fullName')}</div>
                          <div className="font-semibold text-xs">{currentUser.name}</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-500/10">
                          <Bell className="w-3.5 h-3.5 text-sky-400" />
                        </div>
                        <div>
                          <div className="text-[var(--text-secondary)] text-[9px]">{t('email')}</div>
                          <div className="font-semibold text-xs">{currentUser.email}</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-[var(--text-secondary)] text-[9px]">{t('phone')}</div>
                          <div className="font-semibold text-xs">{currentUser.phone || t('unknown')}</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(0, 0, 0, 0.15)' }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10">
                          <Car className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-[var(--text-secondary)] text-[9px]">{t('totalAnalyses')}</div>
                          <div className="font-semibold text-xs">{estimations.length} {t('estimations')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ===== Delete Confirmation Dialog ===== */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out' }}
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: 'linear-gradient(135deg, rgba(17,24,39,0.98), rgba(11,17,32,0.99))', border: '1px solid var(--border-subtle)', animation: 'fadeInUp 0.3s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            {/* Title */}
            <h3 className="text-base font-bold text-center mb-2">
              {deleteTarget === 'all' ? t('deleteAllTitle') : t('deleteAnalysis')}
            </h3>
            <p className="text-xs text-center mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {deleteTarget === 'all'
                ? t('deleteAllConfirm')
                : t('deleteConfirm')}
            </p>
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => !deleting && setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5 cursor-pointer"
                style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (deleteTarget === 'all') {
                    Promise.all(estimations.map(e => fetch(`/api/estimations/${e.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })))
                      .then(() => { setEstimations([]); setAnalysisResult(null); setDeleting(false); setDeleteTarget(null); })
                      .catch(() => { setDeleting(false); setDeleteTarget(null); });
                  } else {
                    handleDeleteEstimation(deleteTarget);
                  }
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: deleting ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                {deleting ? (
                  <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>{t('deleting')}</span></>
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" /><span>{t('confirmDelete')}</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Fullscreen Image Overlay ===== */}
      {isFullscreen && capturedImage && analysisResult?.damages?.some(d => d.bbox) && (
        <div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', animation: 'fadeIn 0.25s ease-out' }}
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
                <Car className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  {analysisResult.carName} {analysisResult.carModel} {analysisResult.carYear}
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-500/20 text-teal-400">AI</span>
                </div>
                <div className="text-[10px] text-white/40">{t('analysisResult')} - {t('fullscreenTitle')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Damage count pills */}
              <div className="hidden sm:flex items-center gap-1.5 mr-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-white/50">{analysisResult.damages.filter(d => d.severity === 'high').length} {t('severe')}</span>
                <span className="text-[10px] text-white/20 mx-1">|</span>
                <span className="text-[10px] text-white/50">{analysisResult.damages.filter(d => d.severity === 'medium').length} {t('medium')}</span>
                <span className="text-[10px] text-white/20 mx-1">|</span>
                <span className="text-[10px] text-white/50">{analysisResult.damages.filter(d => d.severity === 'low').length} {t('low')}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 cursor-pointer"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                title={t('closeEsc')}
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Canvas area - scrollable */}
          <div className="flex-1 overflow-auto flex items-start justify-center py-6 px-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative inline-block" style={{ maxWidth: '100%' }}>
              <canvas
                ref={fullscreenCanvasRef}
                className="block rounded-xl"
                style={{ maxHeight: 'calc(100vh - 160px)', width: 'auto', height: 'auto', objectFit: 'contain', border: '1px solid rgba(255,255,255,0.06)' }}
              />
            </div>
          </div>

          {/* Bottom stats bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-sm font-black text-gradient">{analysisResult.totalCost.toLocaleString()}</div>
                <div className="text-[9px] text-white/30">{t('egp')}</div>
              </div>
              <div className="w-px h-6" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="text-center">
                <div className="text-sm font-black text-white">{analysisResult.confidence}%</div>
                <div className="text-[9px] text-white/30">{t('confidence')}</div>
              </div>
              <div className="w-px h-6 hidden sm:block" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="text-center hidden sm:block">
                <div className="text-sm font-black text-white">{analysisResult.damages.length}</div>
                <div className="text-[9px] text-white/30">{t('damages')}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-white/25 hidden sm:inline">YOLOv8 AI Detection</span>
              <span className="text-[10px] text-white/35 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                {t('escToClose')}
              </span>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
