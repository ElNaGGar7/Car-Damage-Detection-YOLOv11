'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Lang = 'ar' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
  align: 'right' | 'left';
  isRTL: boolean;
  toggleLang: () => void;
}

/* ────────────────────────────────────────────────────────────────────────────
   INLINE TRANSLATIONS – AutoCost Car Damage Assessment App
   Record<string, { ar: string; en: string }>
   ──────────────────────────────────────────────────────────────────────────── */
const translations: Record<string, { ar: string; en: string }> = {
  // ─── App ───
  appName: { ar: 'أوتوكوست', en: 'AutoCost' },
  appTagline: { ar: 'تقييم أضرار السيارات بالذكاء الاصطناعي', en: 'AI-Powered Car Damage Assessment' },

  // ─── Navigation ───
  newAnalysis: { ar: 'تحليل جديد', en: 'New Analysis' },
  home: { ar: 'الرئيسية', en: 'Home' },
  estimations: { ar: 'التقديرات', en: 'Estimations' },
  notifications: { ar: 'الإشعارات', en: 'Notifications' },
  profile: { ar: 'الملف الشخصي', en: 'Profile' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  language: { ar: 'اللغة', en: 'Language' },
  arabic: { ar: 'العربية', en: 'Arabic' },
  english: { ar: 'الإنجليزية', en: 'English' },

  // ─── Dashboard ───
  welcomeMsg: { ar: 'مرحباً بك', en: 'Welcome Back' },
  dashboardSubtitle: { ar: 'إليك ملخص تقديراتك اليوم', en: "Here's a summary of your estimations today" },
  totalEstimations: { ar: 'إجمالي التقديرات', en: 'Total Estimations' },
  savedMoney: { ar: 'المبلغ الموفّر', en: 'Money Saved' },
  completedEstimations: { ar: 'التقديرات المكتملة', en: 'Completed Estimations' },
  averageCost: { ar: 'متوسط التكلفة', en: 'Average Cost' },
  newDamageAnalysis: { ar: 'تحليل أضرار جديد', en: 'New Damage Analysis' },
  newDamageDesc: { ar: 'قم بتحميل صورة السيارة للحصول على تقييم فوري للأضرار والتكاليف', en: 'Upload a car image to get instant damage assessment and cost estimation' },
  previousEstimations: { ar: 'التقديرات السابقة', en: 'Previous Estimations' },
  reports: { ar: 'التقارير', en: 'Reports' },
  latestEstimations: { ar: 'أحدث التقديرات', en: 'Latest Estimations' },
  viewAll: { ar: 'عرض الكل', en: 'View All' },
  noEstimations: { ar: 'لا توجد تقديرات بعد', en: 'No estimations yet' },
  startFirstAnalysis: { ar: 'ابدأ أول تحليل لك الآن', en: 'Start your first analysis now' },
  allEstimations: { ar: 'جميع التقديرات', en: 'All Estimations' },
  deleteAll: { ar: 'حذف الكل', en: 'Delete All' },
  newAnalysisBtn: { ar: 'تحليل جديد', en: 'New Analysis' },
  noAnalysisYet: { ar: 'لا يوجد تحليلات بعد', en: 'No analyses yet' },
  startNewNow: { ar: 'ابدأ تحليلاً جديداً الآن', en: 'Start a new analysis now' },
  recentActivity: { ar: 'النشاط الأخير', en: 'Recent Activity' },
  quickActions: { ar: 'إجراءات سريعة', en: 'Quick Actions' },
  thisMonth: { ar: 'هذا الشهر', en: 'This Month' },
  thisWeek: { ar: 'هذا الأسبوع', en: 'This Week' },
  today: { ar: 'اليوم', en: 'Today' },
  overview: { ar: 'نظرة عامة', en: 'Overview' },

  // ─── Stats Labels ───
  totalCostEGP: { ar: 'إجمالي التكلفة (جنيه)', en: 'Total Cost (EGP)' },
  confidenceRate: { ar: 'نسبة الثقة', en: 'Confidence Rate' },
  detectedDamages: { ar: 'الأضرار المكتشفة', en: 'Detected Damages' },
  estimationCount: { ar: 'عدد التقديرات', en: 'Estimation Count' },
  accuracyRate: { ar: 'معدل الدقة', en: 'Accuracy Rate' },
  processingTime: { ar: 'وقت المعالجة', en: 'Processing Time' },

  // ─── Analysis Form ───
  carName: { ar: 'اسم السيارة', en: 'Car Name' },
  carModel: { ar: 'موديل السيارة', en: 'Car Model' },
  carYear: { ar: 'سنة الصنع', en: 'Year' },
  damageImage: { ar: 'صورة الضرر', en: 'Damage Image' },
  selectBrand: { ar: 'اختر الماركة', en: 'Select Brand' },
  selectBrandFirst: { ar: 'اختر الماركة أولاً', en: 'Select a brand first' },
  selectModel: { ar: 'اختر الموديل', en: 'Select Model' },
  selectYear: { ar: 'اختر السنة', en: 'Select Year' },
  uploadImage: { ar: 'رفع صورة', en: 'Upload Image' },
  takePhoto: { ar: 'التقاط صورة', en: 'Take Photo' },
  removeImage: { ar: 'إزالة الصورة', en: 'Remove Image' },
  retakePhoto: { ar: 'إعادة التصوير', en: 'Retake Photo' },
  imageCaptured: { ar: 'تم التقاط الصورة', en: 'Image Captured' },
  analyzeBtn: { ar: 'تحليل الأضرار', en: 'Analyze Damage' },
  analyzing: { ar: 'جاري التحليل...', en: 'Analyzing...' },
  tip: { ar: 'نصيحة', en: 'Tip' },
  tipDesc: { ar: 'التقط صورة واضحة للضرر من زاوية مباشرة للحصول على أفضل النتائج', en: 'Take a clear, well-lit photo of the damage from a direct angle for best results' },
  dropImageHere: { ar: 'اسحب الصورة وأفلتها هنا', en: 'Drop image here' },
  or: { ar: 'أو', en: 'or' },
  browseFiles: { ar: 'تصفح الملفات', en: 'Browse Files' },
  supportedFormats: { ar: 'الصيغ المدعومة: JPG, PNG, WebP', en: 'Supported formats: JPG, PNG, WebP' },
  maxSize: { ar: 'الحد الأقصى: 10 ميجابايت', en: 'Max size: 10 MB' },
  selectCar: { ar: 'اختر السيارة', en: 'Select Car' },
  carInfo: { ar: 'معلومات السيارة', en: 'Car Information' },
  imageSection: { ar: 'صورة الضرر', en: 'Damage Image' },
  step1: { ar: 'الخطوة ١: معلومات السيارة', en: 'Step 1: Car Info' },
  step2: { ar: 'الخطوة ٢: رفع الصورة', en: 'Step 2: Upload Image' },
  step3: { ar: 'الخطوة ٣: التحليل', en: 'Step 3: Analysis' },
  next: { ar: 'التالي', en: 'Next' },
  back: { ar: 'رجوع', en: 'Back' },
  submit: { ar: 'إرسال', en: 'Submit' },

  // ─── Results ───
  analysisResult: { ar: 'نتيجة التحليل', en: 'Analysis Result' },
  aiBadge: { ar: 'مدعوم بالذكاء الاصطناعي', en: 'AI-Powered' },
  noDamageYet: { ar: 'لم يتم العثور على أضرار', en: 'No damage detected' },
  damageDetails: { ar: 'تفاصيل الأضرار', en: 'Damage Details' },
  estimatedCost: { ar: 'التكلفة المقدرة', en: 'Estimated Cost' },
  estimatedRepairTime: { ar: 'وقت الإصلاح المقدر', en: 'Estimated Repair Time' },
  confidence: { ar: 'نسبة الثقة', en: 'Confidence' },
  severity: { ar: 'الشدة', en: 'Severity' },
  repairRecommendation: { ar: 'توصية الإصلاح', en: 'Repair Recommendation' },
  totalEstimatedCost: { ar: 'إجمالي التكلفة المقدرة', en: 'Total Estimated Cost' },
  downloadReport: { ar: 'تحميل التقرير', en: 'Download Report' },
  shareReport: { ar: 'مشاركة التقرير', en: 'Share Report' },
  saveEstimation: { ar: 'حفظ التقدير', en: 'Save Estimation' },
  newAnalysisFromResult: { ar: 'تحليل جديد', en: 'New Analysis' },
  analysisDate: { ar: 'تاريخ التحليل', en: 'Analysis Date' },
  resultId: { ar: 'رقم النتيجة', en: 'Result ID' },

  // ─── Severity Levels ───
  severe: { ar: 'شديد', en: 'Severe' },
  medium: { ar: 'متوسط', en: 'Medium' },
  low: { ar: 'خفيف', en: 'Low' },
  critical: { ar: 'حرج', en: 'Critical' },

  // ─── Damage Types ───
  dent: { ar: 'نتوء', en: 'Dent' },
  scratch: { ar: 'خدش', en: 'Scratch' },
  break: { ar: 'كسر', en: 'Break' },
  crack: { ar: 'تشقق', en: 'Crack' },
  other: { ar: 'أخرى', en: 'Other' },
  bumper: { ar: 'صدام', en: 'Bumper' },
  windshield: { ar: 'زجاج أمامي', en: 'Windshield' },
  door: { ar: 'باب', en: 'Door' },
  hood: { ar: 'غطاء المحرك', en: 'Hood' },
  fender: { ar: 'رفرف', en: 'Fender' },
  roof: { ar: 'سقف', en: 'Roof' },
  tire: { ar: 'إطار', en: 'Tire' },
  headlight: { ar: 'مصباح أمامي', en: 'Headlight' },
  taillight: { ar: 'مصباح خلفي', en: 'Taillight' },
  mirror: { ar: 'مرآة', en: 'Mirror' },

  // ─── Status ───
  completed: { ar: 'مكتمل', en: 'Completed' },
  pending: { ar: 'قيد الانتظار', en: 'Pending' },
  processing: { ar: 'قيد المعالجة', en: 'Processing' },
  failed: { ar: 'فشل', en: 'Failed' },
  cancelled: { ar: 'ملغي', en: 'Cancelled' },

  // ─── Notifications ───
  markRead: { ar: 'تحديد كمقروء', en: 'Mark as Read' },
  markAllRead: { ar: 'تحديد الكل كمقروء', en: 'Mark All as Read' },
  noNotifications: { ar: 'لا توجد إشعارات', en: 'No notifications' },
  notificationNew: { ar: 'إشعار جديد', en: 'New Notification' },
  notificationAnalysis: { ar: 'اكتمل تحليل الأضرار', en: 'Damage analysis completed' },
  notificationWelcome: { ar: 'مرحباً بك في أوتوكوست', en: 'Welcome to AutoCost' },
  clearAll: { ar: 'مسح الكل', en: 'Clear All' },

  // ─── Delete Dialog ───
  deleteAnalysis: { ar: 'حذف التحليل', en: 'Delete Analysis' },
  deleteAllTitle: { ar: 'حذف جميع التحليلات', en: 'Delete All Analyses' },
  deleteConfirm: { ar: 'هل أنت متأكد من حذف هذا التحليل؟', en: 'Are you sure you want to delete this analysis?' },
  deleteAllConfirm: { ar: 'هل أنت متأكد من حذف جميع التحليلات؟ لا يمكن التراجع عن هذا الإجراء.', en: 'Are you sure you want to delete all analyses? This action cannot be undone.' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  confirmDelete: { ar: 'تأكيد الحذف', en: 'Confirm Delete' },
  deleting: { ar: 'جاري الحذف...', en: 'Deleting...' },
  cannotUndo: { ar: 'لا يمكن التراجع عن هذا الإجراء', en: 'This action cannot be undone' },

  // ─── Fullscreen / Detection Viewer ───
  fullscreenTitle: { ar: 'عرض ملء الشاشة', en: 'Fullscreen View' },
  closeEsc: { ar: 'إغلاق (Esc)', en: 'Close (Esc)' },
  escToClose: { ar: 'اضغط Esc للإغلاق', en: 'Press Esc to close' },
  detections: { ar: 'الاكتشافات', en: 'Detections' },
  damages: { ar: 'الأضرار', en: 'Damages' },
  zoomIn: { ar: 'تكبير', en: 'Zoom In' },
  zoomOut: { ar: 'تصغير', en: 'Zoom Out' },
  fitScreen: { ar: 'ملائمة الشاشة', en: 'Fit Screen' },
  toggleBoxes: { ar: 'إظهار/إخفاء الإطارات', en: 'Toggle Bounding Boxes' },

  // ─── Profile ───
  profilePage: { ar: 'الملف الشخصي', en: 'Profile' },
  editProfile: { ar: 'تعديل الملف الشخصي', en: 'Edit Profile' },
  fullName: { ar: 'الاسم الكامل', en: 'Full Name' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  phone: { ar: 'رقم الهاتف', en: 'Phone Number' },
  avatar: { ar: 'الصورة الشخصية', en: 'Avatar' },
  changeAvatar: { ar: 'تغيير الصورة', en: 'Change Avatar' },
  memberSince: { ar: 'عضو منذ', en: 'Member Since' },
  totalAnalyses: { ar: 'إجمالي التحليلات', en: 'Total Analyses' },
  accountSettings: { ar: 'إعدادات الحساب', en: 'Account Settings' },
  changePassword: { ar: 'تغيير كلمة المرور', en: 'Change Password' },
  currentPassword: { ar: 'كلمة المرور الحالية', en: 'Current Password' },
  newPassword: { ar: 'كلمة المرور الجديدة', en: 'New Password' },
  confirmPassword: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  saveChanges: { ar: 'حفظ التغييرات', en: 'Save Changes' },
  deleteAccount: { ar: 'حذف الحساب', en: 'Delete Account' },
  deleteAccountDesc: { ar: 'سيتم حذف حسابك وجميع بياناتك نهائياً', en: 'Your account and all data will be permanently deleted' },
  preferences: { ar: 'التفضيلات', en: 'Preferences' },
  darkMode: { ar: 'الوضع الداكن', en: 'Dark Mode' },
  emailNotifications: { ar: 'إشعارات البريد', en: 'Email Notifications' },

  // ─── Auth Page ───
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب', en: 'Register' },
  forgotPassword: { ar: 'نسيت كلمة المرور؟', en: 'Forgot Password?' },
  resetPassword: { ar: 'إعادة تعيين كلمة المرور', en: 'Reset Password' },
  username: { ar: 'اسم المستخدم', en: 'Username' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  confirmPasswordLabel: { ar: 'تأكيد كلمة المرور', en: 'Confirm Password' },
  rememberMe: { ar: 'تذكرني', en: 'Remember Me' },
  signIn: { ar: 'تسجيل الدخول', en: 'Sign In' },
  signUp: { ar: 'إنشاء حساب', en: 'Sign Up' },
  noAccount: { ar: 'ليس لديك حساب؟', en: "Don't have an account?" },
  hasAccount: { ar: 'لديك حساب بالفعل؟', en: 'Already have an account?' },
  orContinueWith: { ar: 'أو تابع باستخدام', en: 'Or continue with' },
  googleLogin: { ar: 'تسجيل الدخول بـ Google', en: 'Sign in with Google' },
  facebookLogin: { ar: 'تسجيل الدخول بـ Facebook', en: 'Sign in with Facebook' },
  loginDesc: { ar: 'سجّل دخولك للوصول إلى تحليلاتك وحفظ تقديراتك', en: 'Sign in to access your analyses and saved estimations' },
  registerDesc: { ar: 'أنشئ حساباً لبدء تقييم أضرار سيارتك مجاناً', en: 'Create an account to start assessing your car damage for free' },
  termsAgreement: { ar: 'بالتسجيل أنت توافق على', en: 'By signing up you agree to our' },
  termsOfService: { ar: 'شروط الخدمة', en: 'Terms of Service' },
  privacyPolicy: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
  andStr: { ar: 'و', en: 'and' },
  forgotDesc: { ar: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور', en: "Enter your email and we'll send you a password reset link" },
  sendResetLink: { ar: 'إرسال رابط إعادة التعيين', en: 'Send Reset Link' },
  backToLogin: { ar: 'العودة لتسجيل الدخول', en: 'Back to Login' },
  resetSent: { ar: 'تم إرسال رابط إعادة التعيين', en: 'Reset link sent' },
  resetSentDesc: { ar: 'تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور', en: 'Check your email for the password reset link' },
  orLoginWith: { ar: 'أو سجّل الدخول باستخدام', en: 'Or login with' },

  // ─── Landing Page ───
  heroTitle: { ar: 'قيّم أضرار سيارتك بالذكاء الاصطناعي', en: 'Assess Car Damage with AI' },
  heroSubtitle: { ar: 'التقط صورة واحصل على تقييم فوري للأضرار وتكلفة الإصلاح بدقة عالية', en: 'Snap a photo and get instant damage assessment with accurate repair cost estimates' },
  heroCta: { ar: 'ابدأ التحليل المجاني', en: 'Start Free Analysis' },
  heroSecondaryCta: { ar: 'شاهد كيف يعمل', en: 'See How It Works' },
  howItWorks: { ar: 'كيف يعمل؟', en: 'How It Works' },
  howItWorksDesc: { ar: 'ثلاث خطوات بسيطة لتقييم أضرار سيارتك', en: 'Three simple steps to assess your car damage' },
  step1Title: { ar: 'ارفع صورة', en: 'Upload a Photo' },
  step1Desc: { ar: 'التقط صورة واضحة للضرر أو ارفع صورة من معرض الصور', en: 'Take a clear photo of the damage or upload from gallery' },
  step2Title: { ar: 'تحليل بالذكاء الاصطناعي', en: 'AI Analysis' },
  step2Desc: { ar: 'يقوم الذكاء الاصطناعي بتحليل الصورة واكتشاف أنواع الأضرار', en: 'AI analyzes the image and detects damage types' },
  step3Title: { ar: 'احصل على التقرير', en: 'Get Your Report' },
  step3Desc: { ar: 'استلم تقريراً مفصلاً بالأضرار والتكاليف المقدرة وتوصيات الإصلاح', en: 'Receive a detailed report with damages, cost estimates, and repair recommendations' },
  features: { ar: 'المميزات', en: 'Features' },
  featuresDesc: { ar: 'أدوات متقدمة لتقييم أضرار السيارات', en: 'Advanced tools for car damage assessment' },
  feature1Title: { ar: 'اكتشاف دقيق للأضرار', en: 'Accurate Damage Detection' },
  feature1Desc: { ar: 'تقنية ذكاء اصطناعي متقدمة لتحديد أنواع ومواقع الأضرار بدقة عالية', en: 'Advanced AI technology to identify damage types and locations with high precision' },
  feature2Title: { ar: 'تقدير تكلفة فوري', en: 'Instant Cost Estimation' },
  feature2Desc: { ar: 'احصل على تقدير فوري لتكلفة الإصلاح بالعملة المحلية', en: 'Get instant repair cost estimates in your local currency' },
  feature3Title: { ar: 'تقارير مفصلة', en: 'Detailed Reports' },
  feature3Desc: { ar: 'تقارير شاملة تشمل تفاصيل الأضرار والتوصيات وتكاليف الإصلاح', en: 'Comprehensive reports including damage details, recommendations, and repair costs' },
  feature4Title: { ar: 'سريع وسهل', en: 'Fast & Easy' },
  feature4Desc: { ar: 'احصل على النتائج في ثوانٍ معدودة بواجهة سهلة الاستخدام', en: 'Get results in seconds with a user-friendly interface' },
  feature5Title: { ar: 'حفظ السجلات', en: 'History Tracking' },
  feature5Desc: { ar: 'احفظ جميع تحليلاتك وتقديراتك وراجعها في أي وقت', en: 'Save all your analyses and estimations to review anytime' },
  feature6Title: { ar: 'دعم متعدد اللغات', en: 'Multi-language Support' },
  feature6Desc: { ar: 'واجهة عربية وإنجليزية لتجربة استخدام مريحة', en: 'Arabic and English interface for a comfortable user experience' },
  pricing: { ar: 'الأسعار', en: 'Pricing' },
  freePlan: { ar: 'مجاني', en: 'Free' },
  proPlan: { ar: 'احترافي', en: 'Pro' },
  enterprisePlan: { ar: 'المؤسسات', en: 'Enterprise' },
  getStarted: { ar: 'ابدأ الآن', en: 'Get Started' },
  contactSales: { ar: 'تواصل مع المبيعات', en: 'Contact Sales' },
  faq: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
  testimonials: { ar: 'آراء العملاء', en: 'Testimonials' },
  footerRights: { ar: 'جميع الحقوق محفوظة', en: 'All Rights Reserved' },
  aboutUs: { ar: 'من نحن', en: 'About Us' },
  contact: { ar: 'اتصل بنا', en: 'Contact Us' },
  privacyPolicyPage: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' },
  footerDesc: { ar: 'تقييم أضرار السيارات بالذكاء الاصطناعي - سريع، دقيق، ومجاني', en: 'AI-Powered Car Damage Assessment - Fast, Accurate, and Free' },
  learnMore: { ar: 'اعرف المزيد', en: 'Learn More' },

  // ─── Common / Utility ───
  loading: { ar: 'جاري التحميل...', en: 'Loading...' },
  error: { ar: 'حدث خطأ', en: 'An error occurred' },
  success: { ar: 'تم بنجاح', en: 'Success' },
  retry: { ar: 'إعادة المحاولة', en: 'Retry' },
  save: { ar: 'حفظ', en: 'Save' },
  close: { ar: 'إغلاق', en: 'Close' },
  search: { ar: 'بحث', en: 'Search' },
  filter: { ar: 'تصفية', en: 'Filter' },
  sort: { ar: 'ترتيب', en: 'Sort' },
  export: { ar: 'تصدير', en: 'Export' },
  print: { ar: 'طباعة', en: 'Print' },
  copy: { ar: 'نسخ', en: 'Copy' },
  copied: { ar: 'تم النسخ', en: 'Copied' },
  yes: { ar: 'نعم', en: 'Yes' },
  no: { ar: 'لا', en: 'No' },
  ok: { ar: 'حسناً', en: 'OK' },
  done: { ar: 'تم', en: 'Done' },
  skip: { ar: 'تخطي', en: 'Skip' },
  seeMore: { ar: 'عرض المزيد', en: 'See More' },
  showLess: { ar: 'عرض أقل', en: 'Show Less' },
  required: { ar: 'مطلوب', en: 'Required' },
  optional: { ar: 'اختياري', en: 'Optional' },
  egp: { ar: 'ج.م', en: 'EGP' },
  currency: { ar: 'جنيه مصري', en: 'Egyptian Pound' },
  days: { ar: 'أيام', en: 'Days' },
  hours: { ar: 'ساعات', en: 'Hours' },
  minutes: { ar: 'دقائق', en: 'Minutes' },
  seconds: { ar: 'ثوانٍ', en: 'Seconds' },
  unknown: { ar: 'غير معروف', en: 'Unknown' },
  noData: { ar: 'لا توجد بيانات', en: 'No Data' },
  comingSoon: { ar: 'قريباً', en: 'Coming Soon' },
  version: { ar: 'الإصدار', en: 'Version' },
  poweredBy: { ar: 'مدعوم بواسطة', en: 'Powered By' },

  // ─── Landing Page Extras ───
  whyAutoCost: { ar: 'لماذا', en: 'Why' },
  quickLinks: { ar: 'روابط سريعة', en: 'Quick Links' },
  ctaTitle: { ar: 'جاهز لتحليل', en: 'Ready to Analyze Your' },
  ctaHighlight: { ar: 'سيارتك', en: 'Car' },
  ctaDesc: { ar: 'ابدأ الآن واحصل على تقدير دقيق ومفصّل لتكاليف إصلاح سيارتك في ثوانٍ معدودة. خدمة مجانية بالكامل بدون أي رسوم أو اشتراكات.', en: 'Start now and get an accurate, detailed repair cost estimate for your car in seconds. Completely free service with no fees or subscriptions.' },
  trustFree: { ar: 'مجاني 100%', en: '100% Free' },
  trustNoAccount: { ar: 'بدون تسجيل مسبق', en: 'No Sign-up Required' },
  trustInstant: { ar: 'نتائج فورية', en: 'Instant Results' },
  trustUsers: { ar: 'مستخدم يثقون بنا', en: 'users trust us' },
  trustDesc: { ar: 'انضم إلى آلاف المستخدمين الذين يستخدمون AutoCost يومياً', en: 'Join thousands of users who use AutoCost daily' },
  statsCars: { ar: 'سيارة تم فحصها', en: 'Cars Inspected' },
  statsBrands: { ar: 'ماركات مختلفة', en: 'Different Brands' },
  statsAccuracy: { ar: 'دقة التقدير', en: 'Estimation Accuracy' },
  statsReliable: { ar: 'نتائج موثوقة', en: 'Reliable Results' },
  statsSavings: { ar: 'متوسط التوفير', en: 'Average Savings' },
  statsThanNormal: { ar: 'عن الأسعار العادية', en: 'Than Regular Prices' },
  statsRating: { ar: 'تقييم المستخدمين', en: 'User Rating' },
  statsFromUsers: { ar: 'من أكثر من 2000 مستخدم', en: 'From 2000+ Users' },
  howItWorksEnd: { ar: 'يعمل', en: 'It Works' },

  // ─── Auth Page Extras ───
  welcomeBack: { ar: 'مرحباً بعودتك', en: 'Welcome Back' },
  createNewAccount: { ar: 'إنشاء حساب جديد', en: 'Create Account' },
  enterPassword: { ar: 'أدخل كلمة المرور', en: 'Enter password' },
  enterFullName: { ar: 'أدخل اسمك الكامل', en: 'Enter full name' },
  createStrongPassword: { ar: 'أنشئ كلمة مرور قوية', en: 'Create a strong password' },
  reEnterPassword: { ar: 'أعد إدخال كلمة المرور', en: 'Re-enter password' },
  hideCarImages: { ar: 'إخفاء صور السيارات', en: 'Hide car images' },
  showCarImages: { ar: 'إظهار صور السيارات', en: 'Show car images' },
  selectBrandPlaceholder: { ar: 'اختر الماركة', en: 'Select Brand' },
  selectModelPlaceholder: { ar: 'اختر الموديل', en: 'Select Model' },
  selectYearPlaceholder: { ar: 'اختر السنة', en: 'Select Year' },
  connectionError: { ar: 'حدث خطأ في الاتصال بالخادم', en: 'Connection error. Please try again.' },
  passwordMismatch: { ar: 'كلمة المرور غير متطابقة', en: 'Passwords do not match' },
  passwordTooShort: { ar: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', en: 'Password must be at least 6 characters' },
  weak: { ar: 'ضعيفة', en: 'Weak' },
  strong: { ar: 'قوية', en: 'Strong' },

  // ─── Landing Page Video ───
  videoTitle: { ar: 'شاهد كيف يغيّر AutoCost عالم تقييم السيارات', en: 'See How AutoCost Changes Car Assessment' },
  videoDesc: { ar: 'فيديو تعريفي عن منصة AutoCost لتقييم أضرار السيارات بالذكاء الاصطناعي', en: 'Introductory video about the AutoCost AI-powered car damage assessment platform' },
  watchTrailer: { ar: 'شاهد العرض التقديمي', en: 'Watch the Trailer' },
  playVideo: { ar: 'تشغيل الفيديو', en: 'Play Video' },
  muteVideo: { ar: 'كتم الصوت', en: 'Mute' },
  unmuteVideo: { ar: 'إلغاء الكتم', en: 'Unmute' },
};

/* ────────────────────────────────────────────────────────────────────────────
   CONTEXT
   ──────────────────────────────────────────────────────────────────────────── */

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');

  // Load saved preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lang');
      if (saved === 'en' || saved === 'ar') setLangState(saved);
    } catch {
      // localStorage unavailable (SSR guard)
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('lang', l);
    } catch {
      // localStorage unavailable
    }
  };

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar');

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isRTL = lang === 'ar';
  const align = isRTL ? ('right' as const) : ('left' as const);

  // Sync <html> dir & lang attributes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key; // graceful fallback: show key itself
    return entry[lang] || entry.ar || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, align, isRTL, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within a <LanguageProvider>');
  return ctx;
}
