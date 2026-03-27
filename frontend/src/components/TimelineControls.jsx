import React from 'react';

export default function TimelineControls() {
    return (
        <div className="bg-[#111827] p-4 rounded border border-[#1f2937] flex justify-between items-center mt-2">
            <span>Phase Controls</span>
            <button className="bg-blue-600 px-4 py-2 rounded text-white font-bold">Advance Phase</button>
        </div>
    );
}
