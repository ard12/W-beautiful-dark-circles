import React from 'react';

export default function SitrepModal() {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4">
            <div className="bg-[#111827] w-full max-w-2xl border border-[#1f2937] rounded p-4">
                <h2 className="text-[#f59e0b] text-xl font-bold border-b border-[#1f2937] pb-2 mb-4">SITUATION REPORT</h2>
                <div className="flex flex-col gap-3 text-sm">
                    <div><strong>Situation:</strong> [Placeholder text]</div>
                    <div><strong>Threats:</strong> [Placeholder text]</div>
                    <div><strong>Friendly Status:</strong> [Placeholder text]</div>
                </div>
                <div className="mt-4 flex justify-end">
                    <button className="bg-[#1f2937] px-4 py-2 rounded">Close</button>
                </div>
            </div>
        </div>
    );
}
