import os
from ultralytics import YOLO

dataset_path = r"C:\Users\abdel\VS Code\Ai-Car-Cost-Estimator-1" 
yaml_path = os.path.join(dataset_path, "data.yaml")

if __name__ == '__main__':
    
    model = YOLO("yolo11m.pt") 
    
    model.train(
        data=yaml_path,
        epochs=150,     
        imgsz=640,
        batch=6,         
        device=0,
        name="Car_Damage_Medium_Model", 
        workers=2
    )