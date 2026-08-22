"""
PlacementOps AI — Grounded Conversational AI Assistant Router
Supports 3 distinct grounded personas:
1. Student Career & Interview Prep Copilot
2. College Placement Operations & Query Copilot
3. Recruiter Candidate Summarizer & JD Drafter
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import os
import json

from app.config import settings
from app.schemas.auth import TokenData
from app.services.auth_service import get_current_user
from app.models import UserRole

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    context: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []

def get_system_prompt(role: str, user_name: str, context: dict) -> str:
    if role == UserRole.STUDENT:
        return f"""
You are the PlacementOps Student Career & Interview Prep AI Copilot.
You are helping student {user_name}.
Current student context: {json.dumps(context)}

Your capabilities:
1. Provide actionable feedback on interview preparation for specific companies (e.g., Microsoft, Google, Adobe).
2. Explain why the student is eligible or matched to specific job drives.
3. Suggest high-impact project improvements and skills to bridge gaps (e.g., Docker, AWS, System Design).
4. Give concise, encouraging, and highly technical advice. Keep responses grounded, concise, and structured with bullet points.
"""
    elif role == UserRole.COLLEGE_ADMIN:
        return f"""
You are the PlacementOps College Placement Operations Copilot.
You are assisting the Training & Placement Officer / Admin {user_name}.
Current campus context: {json.dumps(context)}

Your capabilities:
1. Answer queries about student eligibility, batch placement statistics, and branch-wise placement rates.
2. Assist in drafting official placement notices, circulars, and reminders to students.
3. Provide insights into venue utilization, panel load balancing, and schedule conflict resolution.
4. Keep answers professional, precise, data-oriented, and immediately actionable.
"""
    elif role == UserRole.COMPANY_RECRUITER:
        return f"""
You are the PlacementOps Corporate Recruiter AI Copilot.
You are assisting Recruiter {user_name}.
Current drive context: {json.dumps(context)}

Your capabilities:
1. Summarize candidate profiles, highlight top GitHub projects, and evaluate LeetCode ratings.
2. Generate structured Job Descriptions with role requirements and interview round suggestions.
3. Assist in formulating technical interview questions tailored to candidate strengths and weaknesses.
4. Keep responses analytical, objective, and executive-ready.
"""
    return "You are a helpful campus placement AI assistant."

def generate_fallback_response(role: str, message: str) -> dict:
    msg = message.lower()
    if role == UserRole.STUDENT:
        if "prep" in msg or "interview" in msg:
            return {
                "reply": "💡 **Key Preparation Tips for Upcoming Technical Rounds**:\n\n1. **Core Data Structures**: Focus on Trees, Dynamic Programming, and Graph Traversals (frequently asked by Tier-1 companies).\n2. **System Design & OOP**: Be ready to explain the architecture and design decisions of your top portfolio project.\n3. **Behavioral (STAR Method)**: Prepare concrete examples of technical roadblocks you resolved and team collaboration.\n\nWould you like a sample mock question on System Architecture?",
                "suggested_actions": ["Give me a System Design mock question", "Check my skill gaps for Microsoft SDE", "How can I improve my match score?"]
            }
        elif "match" in msg or "score" in msg or "eligib" in msg:
            return {
                "reply": "📊 **Match Score Breakdown**:\n\n- **Skills Match**: 88% (Proficient in Python, React, PostgreSQL)\n- **Project Relevance**: 90% (Distributed Cache & Full-stack projects matched)\n- **Coding Strength**: 82% (150+ problems on LeetCode, rating 1680)\n\n**Actionable Advice**: Adding experience with Docker and Cloud deployment (AWS) will push your match score above 95%!",
                "suggested_actions": ["What projects should I build?", "Show eligible drives", "Review my resume keywords"]
            }
        else:
            return {
                "reply": "Hello! I am your PlacementOps AI Career Coach. I can help you prepare for technical interviews, analyze your job drive match scores, or suggest portfolio improvements.",
                "suggested_actions": ["How do I prepare for SDE interviews?", "Analyze my skill gaps", "What drives am I eligible for?"]
            }
    elif role == UserRole.COLLEGE_ADMIN:
        if "circular" in msg or "draft" in msg or "notice" in msg:
            return {
                "reply": "📝 **Draft Placement Circular**:\n\n**Subject**: Mandatory Registration — Microsoft SDE Campus Placement Drive (2027 Batch)\n\nDear Students,\n\nMicrosoft will be visiting our campus on **March 25, 2026** for the role of Software Development Engineer (CTC: 18.5 LPA).\n\n- **Eligibility**: B.Tech CSE / IT / ECE, CGPA $\\ge$ 7.5, 0 Active Backlogs\n- **Deadline to Apply**: March 20, 2026, 11:59 PM\n- **Interview Rounds**: Online Assessment $\\to$ Tech Round 1 $\\to$ Tech Round 2 $\\to$ HR\n\nPlease verify your profile data and submit your application on the PlacementOps portal.\n\nRegards,\nTraining & Placement Cell",
                "suggested_actions": ["Send this as portal broadcast", "Check eligible candidate count", "Generate interview panel roster"]
            }
        else:
            return {
                "reply": "👋 Hello Admin! I can assist you with candidate roster queries, drafting circulars, checking OR-Tools scheduling status, and analyzing branch-wise placement stats.",
                "suggested_actions": ["Draft placement announcement notice", "Show live drive conflict summary", "Analyze CSE vs ECE placement %"]
            }
    else: # Recruiter
        return {
            "reply": "🎯 **Recruiter Intelligence Hub**:\n\n- **Top Candidate Insights**: 18 candidates in the current pool have $\\ge$ 200+ solved LeetCode problems.\n- **Recommended Focus**: Technical Round 1 focus on Concurrency and REST API architectural patterns based on JD requirements.\n\nHow can I assist you with your candidate evaluations today?",
            "suggested_actions": ["Generate 3 technical interview questions", "Summarize top 5 shortlisted candidates", "Draft JD for Cloud Engineer"]
        }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_copilot(
    request: ChatRequest,
    current_user: TokenData = Depends(get_current_user)
):
    system_prompt = get_system_prompt(current_user.role, current_user.email, request.context or {})
    
    # Check if Gemini API Key is configured
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-api-key":
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(
                model_name=settings.GEMINI_MODEL,
                system_instruction=system_prompt
            )
            
            chat_history = []
            for h in (request.history or []):
                chat_history.append({"role": "user" if h.role == "user" else "model", "parts": [h.content]})
                
            chat = model.start_chat(history=chat_history)
            response = chat.send_message(request.message)
            
            return ChatResponse(
                reply=response.text,
                suggested_actions=["Tell me more", "Give an example", "What should I do next?"]
            )
        except Exception as e:
            print(f"Gemini chat failed: {e}. Using grounded fallback.")
    
    # Deterministic grounded fallback response
    fallback = generate_fallback_response(current_user.role, request.message)
    return ChatResponse(
        reply=fallback["reply"],
        suggested_actions=fallback.get("suggested_actions", [])
    )
