import React from 'react';

export default function QueryBox() {
    return (
        <div className="bg-[#111827] flex flex-col gap-2 p-3 rounded border border-[#1f2937]">
            <h3 className="text-[#f59e0b] font-bold">COMMANDER QUERY</h3>
            <input type="text" placeholder="> Ask SENTINEL..." className="bg-transparent border border-[#1f2937] p-2 rounded text-white" />
            <button className="bg-[#1f2937] px-3 py-1 rounded">Submit</button>
        </div>
    );
}
