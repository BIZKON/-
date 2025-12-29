from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional
import json

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.agents.personas import get_all_personas, get_persona, Persona
from app.agents.board_meeting import board_meeting_agent

router = APIRouter()


class PersonaResponse(BaseModel):
    id: str
    name: str
    title: str
    avatar: str
    style: str
    key_principles: List[str]


class BoardMeetingRequest(BaseModel):
    question: str
    personas: List[str]
    stream: bool = True


class BoardMeetingResponse(BaseModel):
    conversation_id: str
    advisor_responses: List[dict]
    synthesis: str
    action_items: List[str]
    consensus_points: List[str]
    conflict_points: List[str]


@router.get("/personas", response_model=List[PersonaResponse])
async def list_personas():
    """Get list of available advisor personas."""
    personas = get_all_personas()
    return [
        PersonaResponse(
            id=p.id,
            name=p.name,
            title=p.title,
            avatar=p.avatar,
            style=p.style,
            key_principles=p.key_principles
        )
        for p in personas
    ]


@router.post("/board-meeting")
async def run_board_meeting(
    request: BoardMeetingRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Run a board meeting session with selected advisors."""
    # Validate personas
    if len(request.personas) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one persona must be selected"
        )
    if len(request.personas) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 personas can be selected"
        )

    for persona_id in request.personas:
        if not get_persona(persona_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown persona: {persona_id}"
            )

    # Get user's organization
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    organization_id = str(user.organization_id) if user.organization_id else ""

    # Create conversation
    conversation = Conversation(
        user_id=user.id,
        agent_type="board_meeting",
        metadata={"personas": request.personas}
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)

    # Save user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.question
    )
    db.add(user_message)
    await db.commit()

    if request.stream:
        async def stream_generator():
            async for chunk in board_meeting_agent.run_stream(
                question=request.question,
                organization_id=organization_id,
                personas=request.personas
            ):
                yield chunk

        return StreamingResponse(
            stream_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    else:
        # Non-streaming response
        result = await board_meeting_agent.run(
            question=request.question,
            organization_id=organization_id,
            personas=request.personas
        )

        # Save assistant messages
        for resp in result.get("advisor_responses", []):
            msg = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=resp.get("advice", ""),
                persona=resp.get("persona_id")
            )
            db.add(msg)

        # Save synthesis
        synthesis_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=result.get("synthesis", ""),
            persona="synthesis"
        )
        db.add(synthesis_msg)
        await db.commit()

        return BoardMeetingResponse(
            conversation_id=str(conversation.id),
            advisor_responses=result.get("advisor_responses", []),
            synthesis=result.get("synthesis", ""),
            action_items=result.get("action_items", []),
            consensus_points=result.get("consensus_points", []),
            conflict_points=result.get("conflict_points", [])
        )
