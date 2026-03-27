from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import WorldState, QueryResponse, SitrepOutput, ProjectionOutput
from world_state import WorldStateManager
from sitrep import generate_sitrep

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
def advance_scenario():
    return state_manager.advance_phase()

@app.post("/scenario/reset", response_model=WorldState)
def reset_scenario():
    return state_manager.reset()

@app.post("/query", response_model=QueryResponse)
def query(request: QueryRequest):
    return QueryResponse(
        answer="[Placeholder] Answer based on current context.",
        supporting_points=["Point 1", "Point 2"],
        confidence=0.8
    )

@app.post("/recommendation/approve")
def approve_recommendation(request: RecommendationApproveRequest):
    new_state = state_manager.approve_action(request.action_id)
    return {
        "state": new_state.model_dump(),
        "projection": ProjectionOutput(
            projected_outcome="[Placeholder] The projected state has improved.",
            expected_changes=["Change 1", "Change 2"],
            new_risks=["New Risk 1"]
        ).model_dump()
    }

@app.get("/sitrep", response_model=SitrepOutput)
async def sitrep():
    return await generate_sitrep(state_manager.get_state())
