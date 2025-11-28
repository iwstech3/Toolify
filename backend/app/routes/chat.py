import uuid
from fastapi import APIRouter, HTTPException, Form, UploadFile, Depends
from datetime import datetime
from typing import Optional
from app.model.schemas import ChatResponse
from app.chains.chat_chain import _chat_chain
from app.services.vision_service import describe_image, recognize_tools_in_image
from app.services.tavily_service import perform_tool_research
from app.dependencies import optional_image_file_validator

router = APIRouter(prefix="/api", tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat(
    message: str = Form(...),
    session_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = Depends(optional_image_file_validator)
):
    """
    A multi-turn chat endpoint to converse with the Gemini AI assistant.
    Supports English (en), French (fr), and Nigerian Pidgin (pdg).
    This endpoint can optionally accept an image file for context.
    If an image is provided, it attempts to recognize a tool and perform research.
    If session_id is not provided, a new one is generated and returned.
    """
    try:
        if not session_id:
            session_id = str(uuid.uuid4())

        full_message = message
        if file:
            image_bytes = await file.read()
            if image_bytes:
                # First try to recognize a tool
                tool_name = recognize_tools_in_image(image_bytes)
                
                if tool_name:
                    # If tool found, research it
                    research_response = perform_tool_research(tool_name)
                    
                    # Format research for the LLM
                    research_text = f"Tool Identified: {tool_name}\n\nResearch Results:\n"
                    for res in research_response.research_results[:3]:
                        research_text += f"- {res.title}: {res.content}\n"
                    
                    full_message = (
                        f"The user uploaded an image of a tool identified as '{tool_name}'.\n"
                        f"Here is some research about it:\n{research_text}\n"
                        f"The user's message is: '{message}'"
                    )
                else:
                    # Fallback to general description if no tool recognized
                    image_description = describe_image(image_bytes)
                    if image_description:
                        full_message = (
                            f"The user has uploaded an image with the following description: '{image_description}'.\n"
                            f"The user's message is: '{message}'"
                        )

        # invoke_chat now returns a Pydantic object (LLMStructuredOutput)
        structured_response = await _chat_chain.invoke_chat(full_message, session_id)

        return ChatResponse(
            content=structured_response.response,
            language=structured_response.language,
            timestamp=datetime.now(),
            session_id=session_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")
