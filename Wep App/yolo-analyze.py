#!/usr/bin/env python3
"""
AutoCost AI — YOLO Car Damage Analyzer
Input: JSON via stdin  →  Output: JSON via stdout
Labels: Arabic + English
"""
import sys, os, json, base64, tempfile

# ─── مسارات ديناميكية ───
MODEL_PATH = os.environ.get('MODEL_PATH', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'upload', 'car_damage_medium.pt'))

# ─── إضافة مسار المكتبات ───
sys.path.insert(0, '/home/z/.venv/lib/python3.12/site-packages')
os.environ['ULTRALYTICS_CONFIG_DIR'] = '/tmp/Ultralytics'

from ultralytics import YOLO

# ─── تحميل الموديل ───
if not os.path.exists(MODEL_PATH):
    print(json.dumps({"success": False, "error": f"Model file not found: {MODEL_PATH}"}), flush=True)
    sys.exit(1)

model = YOLO(MODEL_PATH)

# ─── أسماء الأضرار (Arabic + English) ───
DAMAGE_NAMES = {
    0:  {'ar': 'زجاج أمامي',     'en': 'Front Windscreen Damage'},
    1:  {'ar': 'زجاج خلفي',     'en': 'Rear Windscreen Damage'},
    2:  {'ar': 'مرآة جانبية',   'en': 'Sidemirror Damage'},
    3:  {'ar': 'مصباح خلفي',    'en': 'Taillight Damage'},
    4:  {'ar': 'غطاء محرك',     'en': 'Bonnet Damage'},
    5:  {'ar': 'باب خارجي',     'en': 'Door Outer Damage'},
    6:  {'ar': 'جناح',          'en': 'Fender Damage'},
    7:  {'ar': 'مصد أمامي',     'en': 'Front Bumper Damage'},
    8:  {'ar': 'مصباح أمامي',   'en': 'Headlight Damage'},
    9:  {'ar': 'مصد خلفي - ضرر كبير', 'en': 'Major Rear Bumper Damage'},
    10: {'ar': 'هيكل - ضرر متوسط',   'en': 'Medium Body Damage'},
    11: {'ar': 'عمود',          'en': 'Pillar Damage'},
    12: {'ar': 'ربع جناح',      'en': 'Quarter Panel Damage'},
    13: {'ar': 'مصد خلفي',      'en': 'Rear Bumper Damage'},
    14: {'ar': 'سقف',           'en': 'Roof Damage'},
    15: {'ar': 'درجة جانبية',   'en': 'Running Board Damage'},
    16: {'ar': 'إشارة جانبية',  'en': 'Sign Light Damage'},
}

DAMAGE_TYPE_MAP = {
    0: 'crack', 1: 'crack', 2: 'break', 3: 'break',
    4: 'dent', 5: 'dent', 6: 'dent', 7: 'dent',
    8: 'break', 9: 'break', 10: 'dent', 11: 'crack',
    12: 'dent', 13: 'dent', 14: 'dent', 15: 'scratch', 16: 'break',
}

COST_BASE = {'crack': 3500, 'break': 4500, 'dent': 3000, 'scratch': 1200, 'other': 2000}
SEVERITY_MULT = {'low': 0.6, 'medium': 1.2, 'high': 2.0}
SEVERITY_AR = {'low': 'خفيف', 'medium': 'متوسط', 'high': 'شديد'}
SEVERITY_EN = {'low': 'Low', 'medium': 'Medium', 'high': 'High'}

# ─── قراءة المدخلات ───
input_data = json.loads(sys.stdin.read())
img_b64 = input_data.get('image', '')
if ',' in img_b64:
    img_b64 = img_b64.split(',', 1)[1]

# ─── حفظ الصورة في ملف مؤقت ───
img_bytes = base64.b64decode(img_b64)
tmp_fd, tmp_path = tempfile.mkstemp(suffix='.jpg')
try:
    os.write(tmp_fd, img_bytes)
    os.close(tmp_fd)

    # ─── تشغيل YOLO ───
    results = model(tmp_path, conf=0.25, verbose=False)

    damages = []
    img_width = 0
    img_height = 0
    for r in results:
        if hasattr(r, 'orig_img') and r.orig_img is not None:
            img_height, img_width = r.orig_img.shape[:2]

        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            dtype = DAMAGE_TYPE_MAP.get(cls_id, 'other')
            sev = 'high' if conf >= 0.75 else ('medium' if conf >= 0.45 else 'low')
            cost = int(COST_BASE.get(dtype, 2000) * SEVERITY_MULT[sev])
            names = DAMAGE_NAMES.get(cls_id, {'ar': str(cls_id), 'en': str(cls_id)})

            # ─── Bounding box coordinates (normalized 0-1) ───
            xyxy = box.xyxy[0].tolist()
            bbox = {
                "x1": round(xyxy[0] / max(img_width, 1), 4) if img_width > 0 else 0,
                "y1": round(xyxy[1] / max(img_height, 1), 4) if img_height > 0 else 0,
                "x2": round(xyxy[2] / max(img_width, 1), 4) if img_width > 0 else 0,
                "y2": round(xyxy[3] / max(img_height, 1), 4) if img_height > 0 else 0,
            }

            damages.append({
                "type": dtype,
                "severity": sev,
                "severityAr": SEVERITY_AR[sev],
                "severityEn": SEVERITY_EN[sev],
                "location": names['ar'],
                "locationEn": names['en'],
                "label": names['en'],         # English label for bounding box
                "description": f"{SEVERITY_AR[sev]} في {names['ar']}",
                "descriptionEn": f"{SEVERITY_EN[sev]} {names['en']}",
                "estimatedCost": cost,
                "confidence": round(conf, 3),
                "bbox": bbox,
            })

    output = {
        "success": True,
        "damages": damages,
        "totalCost": sum(d['estimatedCost'] for d in damages),
        "imageWidth": img_width,
        "imageHeight": img_height,
    }
    print(json.dumps(output, ensure_ascii=False), flush=True)
finally:
    try:
        os.unlink(tmp_path)
    except:
        pass
