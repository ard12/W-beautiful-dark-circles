import React from 'react';
import UnitCard from './UnitCard';

export default function OrbatPanel({ state }) {
    if (!state) return null;
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-[#f59e0b]">ORBAT</h2>
            <p className="text-sm text-[#9ca3af]">{state.objective}</p>
            <div className="flex flex-col gap-2 mt-4">
                {state.units.map(u => <UnitCard key={u.unit_id} unit={u} />)}
            </div>
        </div>
    );
}
