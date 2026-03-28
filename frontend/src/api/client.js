const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const getState = async () => {
    const res = await fetch(`${BASE_URL}/state`);
    return res.json();
};

export const advancePhase = async () => {
    const res = await fetch(`${BASE_URL}/scenario/advance`, { method: "POST" });
    return res.json();
};

export const resetScenario = async () => {
    const res = await fetch(`${BASE_URL}/scenario/reset`, { method: "POST" });
    return res.json();
};

export const submitQuery = async (question) => {
    const res = await fetch(`${BASE_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
    });
    return res.json();
};

export const approveAction = async (actionId) => {
    const res = await fetch(`${BASE_URL}/recommendation/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_id: actionId })
    });
    return res.json();
};

export const getSitrep = async () => {
    const res = await fetch(`${BASE_URL}/sitrep`);
    return res.json();
};

export const getHeadlines = async () => {
    const res = await fetch(`${BASE_URL}/feed/headlines`);
    if (!res.ok) throw new Error("API error");
    return res.json();
};

export const getMarketSnapshot = async () => {
    const res = await fetch(`${BASE_URL}/feed/market-snapshot`);
    if (!res.ok) throw new Error("API error");
    return res.json();
};
