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

export const getPromptPlaceholders = async () => {
    const res = await fetch(`${BASE_URL}/prompts/placeholders`);
    return res.json();
};

export const executePrompt = async (incidentData) => {
    const res = await fetch(`${BASE_URL}/prompts/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incidentData),
    });
    return res.json();
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginUser = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Login failed");
    }
    return res.json();
};

export const logoutUser = async (token) => {
    await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
};

export const getCurrentUser = async (token) => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
};
