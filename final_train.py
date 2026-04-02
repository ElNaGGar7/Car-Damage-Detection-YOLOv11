import os
from roboflow import Roboflow
from ultralytics import YOLO

rf = Roboflow(api_key="2i938JMFGaDIOlEDyBtZ")
project = rf.workspace("abdelrhmans-workspace-9otia").project("ai-car-cost-estimator-kbvqd")
version = project.version(1)
dataset = version.download("yolov11")

yaml_path = os.path.join(dataset.location, "data.yaml")

if __name__ == '__main__':
    model = YOLO("yolo11n.pt") 
    
    model.train(
        data=yaml_path,
        epochs=150,
        imgsz=640,
        batch=16,
        device=0,
        name="Car_Damage_Final_Model",
        workers=2
    )