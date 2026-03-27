import React from 'react';

export default function Header({ state }) {
    if (!state) return null;
    return (
        <header className="flex justify-between items-center p-4 border-b border-[#1f2937] bg-[#111827]">
            <h1 className="text-2xl font-bold text-[#f59e0b]">SENTINEL</h1>
            <div className="flex items-center gap-4">
                <span>{state.theater_name}</span>
                <span>Phase: {state.phase_title}</span>
                <button className="bg-[#1f2937] px-4 py-2 rounded">Reset</button>
            </div>
        </header>
    );
}
