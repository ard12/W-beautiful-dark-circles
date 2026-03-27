import React from 'react';

export default function PlanCard({ state }) {
    if (!state || !state.reasoning || !state.reasoning.recommendations) return null;
    return (
        <div className="bg-[#111827] flex flex-col gap-2 p-3 rounded border border-[#1f2937]">
            <h3 className="text-[#f59e0b] font-bold">RECOMMENDATION</h3>
            {state.reasoning.recommendations.map(rec => (
                <div key={rec.action_id} className="text-sm border-l-2 border-[#f59e0b] pl-2">
                    <p>{rec.action}</p>
                    <button className="bg-green-700 mt-2 px-3 py-1 rounded text-white">Approve {rec.action_id}</button>
                </div>
            ))}
        </div>
    );
}
