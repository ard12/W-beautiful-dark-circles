import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import OrbatPanel from "./components/OrbatPanel";
import MapView from "./components/MapView";
import TimelineControls from "./components/TimelineControls";
import AiPanel from "./components/AiPanel";
import PlanCard from "./components/PlanCard";
import QueryBox from "./components/QueryBox";
import SitrepModal from "./components/SitrepModal";
import { getState, advancePhase, resetScenario } from "./api/client";

function App() {
  const [worldState, setWorldState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getState().then(data => {
      setWorldState(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-white">Loading SENTINEL...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#0a0e1a] text-[#e5e7eb] font-sans">
      <Header state={worldState} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/5 border-r border-[#1f2937] p-4 flex flex-col gap-4">
          <OrbatPanel state={worldState} />
        </div>
        <div className="w-2/4 border-r border-[#1f2937] p-4 flex flex-col gap-4">
          <MapView state={worldState} />
          <TimelineControls />
        </div>
        <div className="w-[30%] p-4 flex flex-col gap-4 overflow-y-auto">
          <AiPanel state={worldState} />
          <PlanCard state={worldState} />
          <QueryBox />
        </div>
      </div>
    </div>
  );
}

export default App;
