from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.model.schemas import ChatRequest, ChatResponse
from app.chains.chat_chain import _chat_chain

router = APIRouter(prefix="/api", tags=[" Chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    A single-turn chat endpoint to converse with the Gemini AI assistant.
    Supports English (en), French (fr), and Nigerian Pidgin (pdg).
    This endpoint does not retain conversation history.
    """
    try:
        # invoke_chat now returns a Pydantic object (LLMStructuredOutput)
        structured_response = await _chat_chain.invoke_chat(request.message)

        return ChatResponse(
            content=structured_response.response,
            language=structured_response.language,
            timestamp=datetime.now()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")
