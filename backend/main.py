from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import WorldState, QueryResponse, SitrepOutput, ProjectionOutput
from world_state import WorldStateManager
from sitrep import generate_sitrep
from ai_reasoning import answer_query, project_future, load_doctrine, load_area_briefing

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state_manager = WorldStateManager()
state_manager.initialize()

# Pre-load context files at startup
_doctrine = load_doctrine()
_area_briefing = load_area_briefing()

class QueryRequest(BaseModel):
    question: str

class RecommendationApproveRequest(BaseModel):
    action_id: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/state", response_model=WorldState)
def get_state():
    return state_manager.get_state()

@app.post("/scenario/advance", response_model=WorldState)
async def advance_scenario():
    return await state_manager.advance_phase()

@app.post("/scenario/reset", response_model=WorldState)
def reset_scenario():
    return state_manager.reset()

@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    current_state = state_manager.get_state()
    return await answer_query(
        state=current_state,
        question=request.question,
        doctrine=_doctrine,
        area_briefing=_area_briefing,
    )

@app.post("/recommendation/approve")
async def approve_recommendation(request: RecommendationApproveRequest):
    new_state = state_manager.approve_action(request.action_id)
    # Find the action description from reasoning recommendations
    action_desc = request.action_id
    if new_state.reasoning:
        for rec in new_state.reasoning.recommendations:
            if rec.action_id == request.action_id:
                action_desc = rec.action
                break
    projection = await project_future(
        state=new_state,
        action_description=action_desc,
        doctrine=_doctrine,
    )
    return {
        "state": new_state.model_dump(),
        "projection": projection.model_dump(),
    }

@app.get("/sitrep", response_model=SitrepOutput)
async def sitrep():
    return await generate_sitrep(
        state_manager.get_state(),
        doctrine=_doctrine,
        area_briefing=_area_briefing,
    )
