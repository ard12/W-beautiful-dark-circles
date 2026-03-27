import React from 'react';

export default function UnitCard({ unit }) {
    return (
        <div className="bg-[#111827] p-3 rounded border border-[#1f2937]">
            <div className="flex justify-between items-center">
                <span className="font-bold">{unit.name}</span>
                <span className="text-xs">{unit.status}</span>
            </div>
            <div className="text-sm text-[#9ca3af]">{unit.role}</div>
            <div className="flex gap-2 mt-2">
                <div className="w-1/3 bg-gray-700 h-2 rounded"><div className="bg-green-500 h-2 rounded" style={{width: `${unit.resources.fuel}%`}}></div></div>
                <div className="w-1/3 bg-gray-700 h-2 rounded"><div className="bg-blue-500 h-2 rounded" style={{width: `${unit.resources.ammo}%`}}></div></div>
                <div className="w-1/3 bg-gray-700 h-2 rounded"><div className="bg-red-500 h-2 rounded" style={{width: `${unit.resources.medical}%`}}></div></div>
            </div>
        </div>
    );
}
