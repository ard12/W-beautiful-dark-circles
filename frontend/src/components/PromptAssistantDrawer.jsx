import React, { useMemo, useState } from "react";

const ATTACK_TYPE_OPTIONS = [
  "Missile strike",
  "Drone attack",
  "Militant raid",
  "Cyber disruption",
  "Bombing",
  "Artillery exchange",
];

function buildPromptPreview(incident, selectedPath) {
  const values = {
    incident_title: incident.title || "{{incident_title}}",
    location: incident.location || "{{location}}",
    owner_country: incident.ownerCountry || "{{owner_country}}",
    actor: incident.actor || "{{actor}}",
    attack_type: incident.attackType || "{{attack_type}}",
    severity: incident.severity || "{{severity}}",
    description: incident.description || "{{description}}",
    selected_response_path: selectedPath?.title || "{{selected_response_path}}",
  };

  return `SYSTEM ROLE:
You are SENTINEL, a strategic response simulator for escalation forecasting.

INCIDENT INPUT:
- Incident title: ${values.incident_title}
- Location: ${values.location}
- Owner country: ${values.owner_country}
- Actor involved: ${values.actor}
- Attack mode: ${values.attack_type}
- Severity: ${values.severity}
- Incident description: ${values.description}

RESPONSE PATH:
- Selected path: ${values.selected_response_path}

TASKS:
1. Infer likely adversarial intent.
2. Explain why the selected site is strategically attractive.
3. Compare response-path implications.
4. Break down trust, assumptions, and weak evidence areas.
5. Draft an executive briefing.
`;
}

export default function PromptAssistantDrawer({
  open,
  incident,
  setIncident,
  responsePaths,
  selectedResponsePath,
  setSelectedResponsePath,
  onClose,
}) {
  const [draft, setDraft] = useState("");

  const steps = useMemo(
    () => [
      {
        key: "title",
        label: "Incident title",
        question: "What should I call this incident?",
        placeholder: "Attack on Northern Command Relay",
      },
      {
        key: "location",
        label: "Location",
        question: "Where did the incident occur?",
        placeholder: "Kashmir border sector",
      },
      {
        key: "ownerCountry",
        label: "Owner country",
        question: "Which country owns or controls the affected site?",
        placeholder: "India",
      },
      {
        key: "actor",
        label: "Actor",
        question: "Who is the suspected actor or adversary?",
        placeholder: "Pakistan-backed proxy",
      },
      {
        key: "attackType",
        label: "Attack mode",
        question: "What was the mode of attack?",
        placeholder: "Missile strike",
        options: ATTACK_TYPE_OPTIONS,
      },
      {
        key: "severity",
        label: "Severity",
        question: "How severe was it on a 0-100 scale?",
        placeholder: "72",
      },
      {
        key: "description",
        label: "Description",
        question: "Give me a short operational description.",
        placeholder: "Radar relay disabled, no mass casualty event, high signaling value.",
      },
    ],
    [],
  );

  const nextStep = steps.find((step) => {
    const value = incident[step.key];
    return value === undefined || value === null || String(value).trim() === "";
  });

  const promptPreview = useMemo(
    () => buildPromptPreview(incident, selectedResponsePath),
    [incident, selectedResponsePath],
  );

  const messages = useMemo(() => {
    const transcript = [
      {
        role: "assistant",
        text: "I can collect the incident details and show you the backend prompt with placeholders resolved before the real prompt service is connected.",
      },
    ];

    steps.forEach((step) => {
      const value = incident[step.key];
      if (value === undefined || value === null || String(value).trim() === "") return;

      transcript.push({ role: "assistant", text: step.question });
      transcript.push({ role: "user", text: String(value) });
    });

    if (selectedResponsePath) {
      transcript.push({
        role: "assistant",
        text: "Which strategic response path should I prepare?",
      });
      transcript.push({ role: "user", text: selectedResponsePath.title });
    }

    if (!nextStep && !selectedResponsePath) {
      transcript.push({
        role: "assistant",
        text: "Choose a response path and I will compile the prompt for backend orchestration.",
      });
    } else if (nextStep) {
      transcript.push({ role: "assistant", text: nextStep.question });
    } else {
      transcript.push({
        role: "assistant",
        text: "All placeholders are filled. The backend prompt can now be rendered from this state.",
      });
    }

    return transcript;
  }, [incident, nextStep, selectedResponsePath, steps]);

  function updateIncidentField(key, value) {
    setIncident((current) => ({
      ...current,
      [key]: key === "severity" ? Number(value) || "" : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!nextStep || !draft.trim()) return;
    updateIncidentField(nextStep.key, draft.trim());
    setDraft("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[440px] border-l border-white/10 bg-slate-950/92 shadow-[0_0_80px_rgba(2,6,23,0.78)] backdrop-blur-xl">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-300/80">
              Prompt Console
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">Sentinel Assistant</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Frontend-only chat flow that fills the future backend prompt placeholders.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-300/40 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "assistant"
                  ? "border border-cyan-400/15 bg-slate-900/80 text-slate-200"
                  : "ml-auto border border-orange-400/25 bg-orange-400/10 text-orange-100"
              }`}
            >
              {message.text}
            </div>
          ))}

          {nextStep?.options ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{nextStep.label}</p>
              <div className="flex flex-wrap gap-2">
                {nextStep.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateIncidentField(nextStep.key, option)}
                    className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-300/35 hover:bg-cyan-400/10 hover:text-white"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!nextStep ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Response path</p>
              <div className="grid gap-2">
                {responsePaths.map((path) => (
                  <button
                    key={path.id}
                    type="button"
                    onClick={() => setSelectedResponsePath(path)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      selectedResponsePath?.id === path.id
                        ? "border-cyan-300/60 bg-cyan-400/10 text-white"
                        : "border-white/10 bg-slate-950/70 text-slate-300 hover:border-cyan-300/30 hover:bg-cyan-400/6"
                    }`}
                  >
                    <div className="text-sm font-medium">{path.title}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-400">{path.summary}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Prompt preview</p>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-200">
              {promptPreview}
            </pre>
          </div>
        </div>

        {nextStep ? (
          <form onSubmit={handleSubmit} className="border-t border-white/10 px-5 py-4">
            <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-slate-400">
              {nextStep.label}
            </label>
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={nextStep.placeholder}
                className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:bg-slate-900"
              />
              <button
                type="submit"
                className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Add
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
