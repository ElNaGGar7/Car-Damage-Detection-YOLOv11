import os
from ultralytics import YOLO

def setup_and_train():

    dataset_path = os.path.join(os.getcwd(), "Ai-Car-Damage-Estimator-1", "data.yaml")
    
    model = YOLO("yolo11m.pt")
    
    print("--- Starting Medium Model Training ---")
    model.train(
        data=dataset_path,
        epochs=150,
        imgsz=640,
        batch=4,   
        device=0,
        name="yolo11_medium_results"
    )

if __name__ == "__main__":
    setup_and_train()