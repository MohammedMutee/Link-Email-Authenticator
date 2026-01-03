from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ml_engine import detector

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """
    Train/Load models on server startup.
    """
    detector.train()

class AnalysisRequest(BaseModel):
    text: str
    scan_type: str = 'url'  # Default to 'url' if not provided

@app.post("/analyze")
def analyze_content(request: AnalysisRequest):
    """
    Analyze text (URL or Email Body) for phishing threats.
    """
    # Predict using the imported detector object
    result = detector.predict(request.text, request.scan_type)
    
    return {
        "text": request.text,
        "scan_type": request.scan_type,
        "risk_score": result["risk_score"],
        "verdict": result["verdict"],
        "reasons": result["reasons"]
    }

class BulkAnalysisRequest(BaseModel):
    texts: list[str]
    scan_type: str = 'url'

@app.post("/analyze/bulk")
def analyze_bulk_content(request: BulkAnalysisRequest):
    """
    Analyze multiple texts in bulk.
    """
    results = []
    for text in request.texts:
        # Skip empty lines
        if not text.strip():
            continue
            
        prediction = detector.predict(text, request.scan_type)
        results.append({
            "text": text,
            "risk_score": prediction["risk_score"],
            "verdict": prediction["verdict"],
            "reasons": prediction["reasons"]
        })
    return results

@app.get("/")
def read_root():
    return {"message": "Mail & Link Authenticator API is running"}
