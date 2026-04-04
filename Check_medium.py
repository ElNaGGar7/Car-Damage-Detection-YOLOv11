from ultralytics import YOLO

def show_metrics():
    try:
        model = YOLO(r"runs/detect/Car_Damage_Medium_Model/weights/best.pt")
        metrics = model.val()
        
        results = metrics.mean_results()
        
        print("\n" + "="*40)
        print("FINAL MODEL RESULTS")
        print("="*40)
        print(f"mAP50:     {results[2]*100:.1f}%")
        print(f"Precision: {results[0]*100:.1f}%")
        print(f"Recall:    {results[1]*100:.1f}%")
        print("="*40)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    show_metrics()