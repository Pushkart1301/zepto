from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import tickets, dashboard, health

app = FastAPI(title="Zepto API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(tickets.router, prefix="/api", tags=["tickets"])
app.include_router(dashboard.router, prefix="/api", tags=["dashboard"])