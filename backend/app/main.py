from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from backend.authentication import router as authentication_router
from backend.dashboard import router as dashboard_router
from backend.movies import router as movie_router

app = FastAPI()
app.include_router(authentication_router.router)
app.include_router(dashboard_router.router)
app.include_router(movie_router.router)

@app.get('/')
async def read_root():
    return { "message": "Backed is up"}