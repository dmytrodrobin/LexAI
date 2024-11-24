from fastapi import FastAPI
from fastapi import Body
from inference import rag_chain_wrapper

app = FastAPI()

@app.post("/generate")
async def generate_response(input_text: str = Body(..., embed=True)):
    response = rag_chain_wrapper(input_text)
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
