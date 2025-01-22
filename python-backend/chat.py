from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI
from util import generateToken

generateToken()
client = OpenAI()
router = APIRouter()


class ChatRequest(BaseModel):
    query: str
    messages: list

@router.post("/chat")
async def chat(request: ChatRequest):
    query = request.query
    messages = request.messages

    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-2024-05-13",
            messages=messages,
            temperature=0.7
        )

        assistant_message = response.choices[0].message.content
        messages.append({"role": "assistant", "content": assistant_message})

        return JSONResponse(content={"messages": messages})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")
