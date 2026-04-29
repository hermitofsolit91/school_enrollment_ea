import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from routers import data, models
from utils.data_loader import load_data

load_dotenv()
logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    df = load_data()
    if len(df) > 0:
        logging.info(
            "Loaded %s records across %s countries from %s",
            len(df),
            df["country"].nunique(),
            os.getenv("DATA_PATH", "./data/education_ea_clean.csv"),
        )
    else:
        logging.warning("No data loaded. Data file may be missing.")
    yield


app = FastAPI(title="EduData EA — Education Analytics API", lifespan=lifespan)

# CORS middleware - allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount public static files
public_dir = os.path.join(os.path.dirname(__file__), "public")
if os.path.exists(public_dir):
    app.mount("/public", StaticFiles(directory=public_dir), name="public")

@app.get("/")
def root():
    return {"status": "ok", "service": "EduData EA API", "version": "1.0.0"}

# Include API routers
app.include_router(data.router)
app.include_router(models.router)

# Error handlers
@app.exception_handler(HTTPException)
def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(404)
def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Not found"})

@app.exception_handler(422)
def validation_exception_handler(request: Request, exc):
    return JSONResponse(status_code=422, content={"detail": "Validation error"})

@app.exception_handler(500)
def internal_error_handler(request: Request, exc):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})