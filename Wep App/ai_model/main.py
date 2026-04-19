import base64
import cv2
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# تحميل الموديل
try:
    model = YOLO('best.pt')
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Error loading model: {e}")

PRICING = {
    0: {"loc": "الزجاج الأمامي", "loc_en": "Front windshield", "type": "crack", "low": 4000, "med": 15000, "high": 45000, "desc": "تشقق في الزجاج الأمامي"},
    1: {"loc": "الزجاج الخلفي", "loc_en": "Rear windshield", "type": "break", "low": 3000, "med": 10000, "high": 35000, "desc": "كسر في الزجاج الخلفي"},
    2: {"loc": "المرايا الجانبية", "loc_en": "Side mirror", "type": "break", "low": 1200, "med": 6000, "high": 22000, "desc": "تلف في المرايا"},
    3: {"loc": "الفانوس الخلفي", "loc_en": "Rear lamp", "type": "break", "low": 1500, "med": 8500, "high": 25000, "desc": "كسر في الإضاءة الخلفية"},
    4: {"loc": "الكبوت", "loc_en": "Hood", "type": "dent", "low": 3000, "med": 8000, "high": 22000, "desc": "انبعاج في غطاء المحرك"},
    5: {"loc": "صاج الباب", "loc_en": "Door panel", "type": "dent", "low": 2500, "med": 7000, "high": 18000, "desc": "تلف في صاج الباب"},
    6: {"loc": "الرفرف", "loc_en": "Fender", "type": "dent", "low": 1500, "med": 5000, "high": 12000, "desc": "خبطة في الرفرف"},
    7: {"loc": "الإكصدام الأمامي", "loc_en": "Front bumper", "type": "dent", "low": 1500, "med": 6000, "high": 18000, "desc": "تلف في المصد الأمامي"},
    8: {"loc": "الفانوس الأمامي", "loc_en": "Front lamp", "type": "break", "low": 2500, "med": 18000, "high": 55000, "desc": "كسر في المصباح الأمامي"},
    9: {"loc": "خلفية السيارة", "loc_en": "Rear body", "type": "break", "low": 5000, "med": 18000, "high": 50000, "desc": "ضرر في الهيكل الخلفي"},
    10: {"loc": "منتصف الهيكل", "loc_en": "Middle body", "type": "dent", "low": 3000, "med": 9000, "high": 25000, "desc": "ضرر جانبي"},
    11: {"loc": "القائم (Pillar)", "loc_en": "Pillar", "type": "break", "low": 4000, "med": 14000, "high": 40000, "desc": "ضرر في القوائم"},
    12: {"loc": "الربع الخلفي", "loc_en": "Rear quarter", "type": "dent", "low": 2500, "med": 6500, "high": 15000, "desc": "ضرر في الربع الخلفي"},
    13: {"loc": "الإكصدام الخلفي", "loc_en": "Rear bumper", "type": "dent", "low": 1500, "med": 6000, "high": 18000, "desc": "تلف في المصد الخلفي"},
    14: {"loc": "السقف", "loc_en": "Roof", "type": "dent", "low": 3000, "med": 10000, "high": 30000, "desc": "انبعاج في السقف"},
    15: {"loc": "العتبة الجانبية", "loc_en": "Side sill", "type": "dent", "low": 1200, "med": 4000, "high": 12000, "desc": "خبطة أسفل الأبواب"},
    16: {"loc": "إشارة جانبية", "loc_en": "Side indicator", "type": "break", "low": 500, "med": 2500, "high": 7000, "desc": "كسر في الإشارة"}
}

@app.post("/predict_full")
async def predict_full(data: dict):
    try:
        # 1. فك تشفير الصورة
        img_data = data['image']
        img_str = img_data.split(',')[1] if ',' in img_data else img_data
        img_bytes = base64.b64decode(img_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        h, w, _ = img_cv.shape # أبعاد الصورة للتحويل لنسبة مئوية

        # 2. تحديد فئة السعر
        car_name = data.get('carInfo', {}).get('carName', '').lower()
        tier = "low"
        if any(b in car_name for b in ['bmw', 'mercedes', 'audi', 'porsche', 'lexus', 'range']): tier = "high"
        elif any(b in car_name for b in ['toyota', 'kia', 'hyundai', 'nissan']): tier = "med"

        # 3. تشغيل الموديل
        results = model.predict(source=img_cv, conf=0.15)
        final_damages = []
        
        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                
                # استخراج الإحداثيات (x1, y1, x2, y2)
                coords = box.xyxy[0].tolist() 
                
                # ✅ المهم: تحويل الإحداثيات لنسبة مئوية (Normalizing) 
                # عشان الكود بتاع الـ Canvas اللي بعتهولي يفهمها
                bbox_normalized = {
                    "x1": coords[0] / w,
                    "y1": coords[1] / h,
                    "x2": coords[2] / w,
                    "y2": coords[3] / h
                }

                info = PRICING.get(cls, {"loc": "جسم السيارة", "type": "dent", "low": 1000, "med": 2000, "high": 3000, "desc": "ضرر"})
                
                final_damages.append({
                    "location": info["loc"],
                    "locationEn": info.get("loc_en", info["loc"]),
                    "label": info.get("loc_en", info["loc"]),
                    "type": info["type"],
                    "severity": "high" if conf > 0.7 else "medium", # دي بتتحكم في لون المربع (أحمر/أصفر)
                    "confidence": conf,
                    "bbox": bbox_normalized, # الإحداثيات اللي الـ Frontend هيرسم بيها
                    "estimatedCost": info[tier],
                    "description": info["desc"]
                })

        # تحويل الصورة لـ Base64 (نظيفة بدون رسم بايثون)
        _, buffer = cv2.imencode('.jpg', img_cv)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "success": True, 
            "results": final_damages, 
            "annotated_image": f"data:image/jpeg;base64,{img_base64}"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)