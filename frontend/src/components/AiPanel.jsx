import React from 'react';

export default function AiPanel({ state }) {
    if (!state || !state.scorecard) return null;
    return (
        <div className="bg-[#111827] flex flex-col gap-2 p-3 rounded border border-[#1f2937]">
            <h3 className="text-[#f59e0b] font-bold">AI ASSESSMENT</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Threat: {state.scorecard.threat_score}</div>
                <div>Readiness: {state.scorecard.readiness_score}</div>
                <div>Escalation: {state.scorecard.escalation_risk}</div>
                <div>Confidence: {state.scorecard.confidence_score}</div>
            </div>
            {state.reasoning && (
                <div className="mt-2 text-sm text-[#9ca3af]">
                    <p>{state.reasoning.assessment_summary}</p>
                </div>
            )}
        </div>
    );
}
