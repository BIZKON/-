from typing import TypedDict, List, Dict, Any, Optional, AsyncIterator
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel
import asyncio
import json
import logging

from app.core.config import settings
from app.core.qdrant import qdrant_service
from app.services.embedding import embedding_service
from app.agents.personas import get_persona, Persona

logger = logging.getLogger(__name__)


class AdvisorResponse(BaseModel):
    persona_id: str
    persona_name: str
    advice: str
    key_points: List[str]
    risk_assessment: str
    confidence: str  # 'high', 'medium', 'low'


class BoardMeetingState(TypedDict):
    question: str
    organization_id: str
    personas: List[str]
    retrieved_context: str
    advisor_responses: List[Dict[str, Any]]
    synthesis: str
    action_items: List[str]
    consensus_points: List[str]
    conflict_points: List[str]


class BoardMeetingAgent:
    def __init__(self):
        self.llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            anthropic_api_key=settings.ANTHROPIC_API_KEY,
            temperature=0.7
        )
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        workflow = StateGraph(BoardMeetingState)

        # Add nodes
        workflow.add_node("retrieve_context", self._retrieve_context)
        workflow.add_node("parallel_advisors", self._get_advisor_responses)
        workflow.add_node("synthesize", self._synthesize_responses)

        # Add edges
        workflow.set_entry_point("retrieve_context")
        workflow.add_edge("retrieve_context", "parallel_advisors")
        workflow.add_edge("parallel_advisors", "synthesize")
        workflow.add_edge("synthesize", END)

        return workflow.compile()

    async def _retrieve_context(self, state: BoardMeetingState) -> BoardMeetingState:
        """Retrieve relevant context from the knowledge base."""
        try:
            # Generate embedding for the question
            query_embedding = await embedding_service.embed_text(state["question"])

            # Search Qdrant
            results = qdrant_service.search(
                query_vector=query_embedding,
                filter_conditions={"organization_id": state["organization_id"]},
                limit=5
            )

            # Combine context
            context_parts = []
            for result in results:
                content = result["payload"].get("content", "")
                if content:
                    context_parts.append(content)

            state["retrieved_context"] = "\n\n---\n\n".join(context_parts) if context_parts else ""
            return state
        except Exception as e:
            logger.warning(f"Context retrieval failed: {e}")
            state["retrieved_context"] = ""
            return state

    async def _get_single_advisor_response(
        self,
        persona: Persona,
        question: str,
        context: str
    ) -> AdvisorResponse:
        """Get response from a single advisor."""
        system_prompt = f"""{persona.system_prompt}

КОНТЕКСТ БИЗНЕСА (документы компании):
{context if context else "Контекст не предоставлен."}

Отвечай на русском языке, если вопрос на русском.
Структурируй ответ следующим образом:
1. Основной совет (2-3 абзаца)
2. Ключевые пункты (3-5 bullet points)
3. Оценка рисков (краткое описание)
4. Уровень уверенности в совете (высокий/средний/низкий)"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Вопрос для обсуждения: {question}")
        ]

        response = await self.llm.ainvoke(messages)
        content = response.content

        # Parse response (simple extraction)
        key_points = []
        risk_assessment = ""
        confidence = "medium"

        lines = content.split('\n')
        in_key_points = False

        for line in lines:
            line_lower = line.lower().strip()
            if 'ключев' in line_lower or 'key point' in line_lower:
                in_key_points = True
                continue
            if in_key_points and line.strip().startswith(('-', '•', '*', '–')):
                key_points.append(line.strip().lstrip('-•*– '))
            if 'риск' in line_lower or 'risk' in line_lower:
                risk_assessment = line.strip()
                in_key_points = False
            if 'уверенност' in line_lower or 'confidence' in line_lower:
                if 'высок' in line_lower or 'high' in line_lower:
                    confidence = "high"
                elif 'низк' in line_lower or 'low' in line_lower:
                    confidence = "low"

        return AdvisorResponse(
            persona_id=persona.id,
            persona_name=persona.name,
            advice=content,
            key_points=key_points[:5] if key_points else ["Смотрите основной совет"],
            risk_assessment=risk_assessment or "Риски требуют дополнительного анализа",
            confidence=confidence
        )

    async def _get_advisor_responses(self, state: BoardMeetingState) -> BoardMeetingState:
        """Get responses from all selected advisors in parallel."""
        tasks = []
        for persona_id in state["personas"]:
            persona = get_persona(persona_id)
            if persona:
                tasks.append(
                    self._get_single_advisor_response(
                        persona,
                        state["question"],
                        state["retrieved_context"]
                    )
                )

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        valid_responses = []
        for response in responses:
            if isinstance(response, AdvisorResponse):
                valid_responses.append(response.model_dump())
            else:
                logger.error(f"Advisor error: {response}")

        state["advisor_responses"] = valid_responses
        return state

    async def _synthesize_responses(self, state: BoardMeetingState) -> BoardMeetingState:
        """Synthesize all advisor responses into a unified recommendation."""
        if not state["advisor_responses"]:
            state["synthesis"] = "Не удалось получить советы от выбранных советников."
            state["action_items"] = []
            state["consensus_points"] = []
            state["conflict_points"] = []
            return state

        advisor_summaries = []
        for resp in state["advisor_responses"]:
            advisor_summaries.append(
                f"**{resp['persona_name']}**:\n{resp['advice'][:500]}..."
            )

        synthesis_prompt = f"""Ты - модератор совета директоров. Проанализируй советы от разных экспертов и создай синтез.

ВОПРОС: {state['question']}

СОВЕТЫ ЭКСПЕРТОВ:
{"".join([f"\n\n---\n{s}" for s in advisor_summaries])}

Создай структурированный синтез:
1. ОБЩИЙ ВЫВОД (2-3 предложения): Краткое резюме всех советов
2. ТОЧКИ КОНСЕНСУСА (bullet points): В чём эксперты согласны
3. ТОЧКИ РАЗНОГЛАСИЙ (bullet points): В чём мнения расходятся
4. ПЛАН ДЕЙСТВИЙ (numbered list): Конкретные шаги на основе лучших советов

Отвечай на русском языке."""

        messages = [
            SystemMessage(content="Ты - опытный модератор бизнес-совещаний."),
            HumanMessage(content=synthesis_prompt)
        ]

        response = await self.llm.ainvoke(messages)
        content = response.content

        state["synthesis"] = content

        # Extract action items, consensus, conflicts
        action_items = []
        consensus_points = []
        conflict_points = []

        lines = content.split('\n')
        current_section = None

        for line in lines:
            line_lower = line.lower().strip()
            if 'план действий' in line_lower or 'action' in line_lower:
                current_section = 'actions'
            elif 'консенсус' in line_lower or 'согласн' in line_lower:
                current_section = 'consensus'
            elif 'разноглас' in line_lower or 'conflict' in line_lower:
                current_section = 'conflicts'

            if current_section and line.strip().startswith(('-', '•', '*', '–', '1', '2', '3', '4', '5')):
                clean_line = line.strip().lstrip('-•*–0123456789. ')
                if clean_line:
                    if current_section == 'actions':
                        action_items.append(clean_line)
                    elif current_section == 'consensus':
                        consensus_points.append(clean_line)
                    elif current_section == 'conflicts':
                        conflict_points.append(clean_line)

        state["action_items"] = action_items[:7]
        state["consensus_points"] = consensus_points[:5]
        state["conflict_points"] = conflict_points[:5]

        return state

    async def run(
        self,
        question: str,
        organization_id: str,
        personas: List[str]
    ) -> Dict[str, Any]:
        """Run the board meeting agent."""
        initial_state: BoardMeetingState = {
            "question": question,
            "organization_id": organization_id,
            "personas": personas,
            "retrieved_context": "",
            "advisor_responses": [],
            "synthesis": "",
            "action_items": [],
            "consensus_points": [],
            "conflict_points": []
        }

        result = await self.graph.ainvoke(initial_state)
        return result

    async def run_stream(
        self,
        question: str,
        organization_id: str,
        personas: List[str]
    ) -> AsyncIterator[str]:
        """Run the board meeting with streaming responses."""
        # Step 1: Retrieve context
        yield json.dumps({"type": "status", "message": "Анализирую контекст бизнеса..."}) + "\n"

        try:
            query_embedding = await embedding_service.embed_text(question)
            results = qdrant_service.search(
                query_vector=query_embedding,
                filter_conditions={"organization_id": organization_id},
                limit=5
            )
            context = "\n\n---\n\n".join([
                r["payload"].get("content", "") for r in results if r["payload"].get("content")
            ])
        except Exception:
            context = ""

        yield json.dumps({"type": "status", "message": "Получаю советы от экспертов..."}) + "\n"

        # Step 2: Get advisor responses
        advisor_responses = []
        for persona_id in personas:
            persona = get_persona(persona_id)
            if persona:
                yield json.dumps({
                    "type": "advisor_start",
                    "persona_id": persona_id,
                    "persona_name": persona.name
                }) + "\n"

                try:
                    response = await self._get_single_advisor_response(persona, question, context)
                    advisor_responses.append(response.model_dump())
                    yield json.dumps({
                        "type": "advisor_response",
                        "data": response.model_dump()
                    }) + "\n"
                except Exception as e:
                    logger.error(f"Error from {persona_id}: {e}")
                    yield json.dumps({
                        "type": "advisor_error",
                        "persona_id": persona_id,
                        "error": str(e)
                    }) + "\n"

        # Step 3: Synthesize
        yield json.dumps({"type": "status", "message": "Синтезирую рекомендации..."}) + "\n"

        state: BoardMeetingState = {
            "question": question,
            "organization_id": organization_id,
            "personas": personas,
            "retrieved_context": context,
            "advisor_responses": advisor_responses,
            "synthesis": "",
            "action_items": [],
            "consensus_points": [],
            "conflict_points": []
        }

        state = await self._synthesize_responses(state)

        yield json.dumps({
            "type": "synthesis",
            "data": {
                "synthesis": state["synthesis"],
                "action_items": state["action_items"],
                "consensus_points": state["consensus_points"],
                "conflict_points": state["conflict_points"]
            }
        }) + "\n"

        yield json.dumps({"type": "complete"}) + "\n"


board_meeting_agent = BoardMeetingAgent()
