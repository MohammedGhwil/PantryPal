from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import base64
from PIL import Image
import io
from ultralytics import YOLO
import os
import uvicorn

app = FastAPI()

# Enable CORS with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the YOLO model
model = YOLO('best.pt')

# Mock recipes data
mock_recipes = [
    {
        "id": 1,
        "name": "Pasta with Tomato Sauce",
        "ingredients": ["pasta", "tomatoes", "garlic", "olive oil"],
        "instructions": "Cook pasta, make sauce, combine and serve"
    },
    {
        "id": 2,
        "name": "Vegetable Stir Fry",
        "ingredients": ["rice", "vegetables", "soy sauce", "oil"],
        "instructions": "Stir fry vegetables, cook rice, combine and serve"
    }
]

@app.get("/api/recipes")
async def get_recipes():
    return mock_recipes

@app.post("/api/process-image")
async def process_image(file: UploadFile = File(...)):
    try:
        # Read the image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Process the image with YOLO
        results = model(image)
        
        # Extract unique ingredient names from the results
        detected_ingredients = []
        for result in results:
            for box in result.boxes:
                class_id = int(box.cls[0])
                ingredient_name = result.names[class_id]
                detected_ingredients.append(ingredient_name)
        
        # Remove duplicates and sort
        detected_ingredients = sorted(list(set(detected_ingredients)))
        
        return {"ingredients": detected_ingredients}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Get your computer's local IP address
    import socket
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    
    print(f"Server running at http://{local_ip}:5000")
    uvicorn.run(app, host="0.0.0.0", port=5000) 