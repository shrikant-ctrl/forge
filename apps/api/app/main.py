from fastapi import FastAPI

app = FastAPI(
    title="Forge",
    description="Forge API",
    version="0.0.1",
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}