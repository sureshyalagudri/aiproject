### server.py

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

import os
from dotenv import load_dotenv

# Import the router from mcq and rag endpoints
from askquestion import router as question_router
from descriptive import router as descriptive_router
from mcq import router as mcq_router
from rag_uploadfiles import router as rag_router
from rag_search import router as search_router
from chat import router as chat_router

# Load environment variables from .env.local
load_dotenv()

app = FastAPI()

# Configure CORS
# Allow all origins for simplicity
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router for mcq endpoints
app.include_router(question_router)
app.include_router(descriptive_router)
app.include_router(mcq_router)
app.include_router(rag_router)
app.include_router(search_router)
app.include_router(chat_router)

current_directory = os.getcwd()
static_files = os.path.join(current_directory, "static")    

# app.mount("/", StaticFiles(directory=static_files, html=True), name="static")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
