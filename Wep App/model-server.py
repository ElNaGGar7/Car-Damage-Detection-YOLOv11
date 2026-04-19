#!/usr/bin/env python3
"""
AutoCost AI — Car Damage Detection via YOLOv8
Runs as a subprocess API server on port 8765
"""

import sys, os, json, io, base64, signal

# Setup paths
sys.path.insert(0, '/home/z/.venv/lib/python3.12/site-packages')
os.environ['ULTRALYTICS_CONFIG_DIR'] = '/tmp/Ultralytics'

from http.server import HTTPServer, BaseHTTPRequestHandler
from ultralytics import YOLO

# Load model
MODEL_PATH = '/home/z/my-project/upload/car_damage_medium.pt'
model = YOLO(MODEL_PATH)

# Arabic names for each class
DAMAGE_NAMES_AR = {
    0: 'زجاج أمامي', 1: 'زجاج خلفي', 2: 'مرآة جانبية',
    3: 'مصباح خلفي', 4: 'غطاء محرك', 5: 'باب خارجي',
    6: 'جناح', 7: 'مصد أمامي', 8: 'مصباح أمامي',
    9: 'مصد خلفي - ضرر كبير', 10: 'هيكل - ضرر متوسط',
    11: 'عمود', 12: 'ربع جناح', 13: 'مصد خلفي',
    14: 'سقف', 15: 'درجة جانبية', 16: 'إشارة جانبية',
}

# Map class to damage type
DAMAGE_TYPE_MAP = {
    0: 'crack', 1: 'crack', 2: 'break', 3: 'break',
    4: 'dent', 5: 'dent', 6: 'dent', 7: 'dent',
    8: 'break', 9: 'break', 10: 'dent', 11: 'crack',
    12: 'dent', 13: 'dent', 14: 'dent', 15: 'scratch',
    16: 'break',
}

COST_BASE = {'crack': 3500, 'break': 4500, 'dent': 3000, 'scratch': 1200, 'other': 2000}
SEVERITY_MULT = {'low': 0.6, 'medium': 1.2, 'high': 2.0}
SEVERITY_AR = {'low': 'خفيف', 'medium': 'متوسط', 'high': 'شديد'}


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/analyze':
            self.send_response(404); self.end_headers(); return

        try:
            body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
            data = json.loads(body)
            img_b64 = data.get('image', '')
            if ',' in img_b64:
                img_b64 = img_b64.split(',', 1)[1]
            image_bytes = io.BytesIO(base64.b64decode(img_b64))

            results = model(image_bytes, conf=0.25, verbose=False)
            damages = []
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    dtype = DAMAGE_TYPE_MAP.get(cls_id, 'other')
                    sev = 'high' if conf >= 0.75 else 'medium' if conf >= 0.45 else 'low'
                    cost = int(COST_BASE.get(dtype, 2000) * SEVERITY_MULT[sev])
                    damages.append({
                        "type": dtype, "severity": sev,
                        "location": DAMAGE_NAMES_AR.get(cls_id, str(cls_id)),
                        "description": f"{SEVERITY_AR[sev]} في {DAMAGE_NAMES_AR.get(cls_id, str(cls_id))}",
                        "estimatedCost": cost,
                    })

            # Deduplicate
            seen = {}
            for d in damages:
                if d['location'] not in seen or d['estimatedCost'] > seen[d['location']]['estimatedCost']:
                    seen[d['location']] = d
            damages = list(seen.values())

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "damages": damages, "totalCost": sum(d['estimatedCost'] for d in damages)}, ensure_ascii=False).encode())
        except Exception as e:
            self.send_response(500); self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200); self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "model": "YOLOv8", "classes": list(model.names.values())}).encode())
        else:
            self.send_response(404); self.end_headers()

    def log_message(self, format, *args):
        print(f"[YOLO] {args[0]}")


if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 8765), Handler)
    print(f"YOLO Server ready on :8765", flush=True)
    server.serve_forever()
