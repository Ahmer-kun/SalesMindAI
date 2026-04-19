import React, { useState } from "react";
import { useAI } from "../hooks/useAI";
import LeadSelector from "../components/LeadSelector";
import GeneratedMessage from "../components/GeneratedMessage";
import ScoreDisplay from "../components/ScoreDisplay";
import { Button, Alert } from "../components/ui";

const TABS = [
  {
    id: "outreach",
    label: "Outreach",
    icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
    description: "Generate a personalized first-touch sales email for any lead.",
  },
  {
    id: "followup",
    label: "Follow-up",
    icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>),
    description: "Write a smart follow-up based on your previous conversation.",
  },
  {
    id: "score",
    label: "Score lead",
    icon: (<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
    description: "Let AI analyze your lead and give them a score from 0 to 100.",
  },
];

const OutreachPanel = () => {
  const { loading, error, result, generateOutreach, reset } = useAI();
  const [leadId, setLeadId] = useState("");
  const [productDesc, setProductDesc] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leadId || !productDesc.trim()) return;
    reset();
    await generateOutreach(leadId, productDesc);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LeadSelector value={leadId} onChange={setLeadId} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">What are you offering?</label>
        <textarea value={productDesc} onChange={(e) => setProductDesc(e.target.value)}
          placeholder="e.g. SalesMind AI — an AI-powered CRM that helps SMEs automate outreach and close more deals faster..."
          rows={3} className="input-base resize-none" />
        <p className="text-xs text-gray-400">Be specific — the more context you give, the more personalized the message.</p>
      </div>
      <Alert message={error} />
      <Button type="submit" loading={loading} disabled={!leadId || !productDesc.trim()} fullWidth>
        {loading ? "Writing message..." : "Generate outreach email"}
      </Button>
      {result?.type === "outreach" && <GeneratedMessage message={result.message} type="outreach" />}
    </form>
  );
};

const FollowUpPanel = () => {
  const { loading, error, result, generateFollowUp, reset } = useAI();
  const [leadId, setLeadId] = useState("");
  const [previousMsg, setPreviousMsg] = useState("");
  const [goal, setGoal] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leadId || !previousMsg.trim()) return;
    reset();
    await generateFollowUp(leadId, previousMsg, goal);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LeadSelector value={leadId} onChange={setLeadId} />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Previous conversation or context</label>
        <textarea value={previousMsg} onChange={(e) => setPreviousMsg(e.target.value)}
          placeholder="e.g. I sent an outreach email last week about our AI CRM. They opened it but didn't reply..."
          rows={4} className="input-base resize-none" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Goal of this follow-up <span className="text-gray-400 font-normal">(optional)</span></label>
        <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Book a 15-minute discovery call" className="input-base" />
      </div>
      <Alert message={error} />
      <Button type="submit" loading={loading} disabled={!leadId || !previousMsg.trim()} fullWidth>
        {loading ? "Writing follow-up..." : "Generate follow-up"}
      </Button>
      {result?.type === "followup" && <GeneratedMessage message={result.message} type="followup" />}
    </form>
  );
};

const ScorePanel = () => {
  const { loading, error, result, scoreLead, reset } = useAI();
  const [leadId, setLeadId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leadId) return;
    reset();
    await scoreLead(leadId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LeadSelector value={leadId} onChange={setLeadId} />
      <div className="rounded-xl bg-surface-50 border border-surface-200 px-4 py-3">
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-medium text-gray-700">How scoring works:</span> AI analyzes
          the lead's notes, conversation history, company context, and current status to
          produce a score from 0–100. The lead's status will be automatically updated based on the result.
        </p>
      </div>
      <Alert message={error} />
      <Button type="submit" loading={loading} disabled={!leadId} fullWidth>
        {loading ? "Analyzing lead..." : "Score this lead"}
      </Button>
      {result?.type === "score" && (
        <ScoreDisplay score={result.score} label={result.label}
          reasoning={result.reasoning} strengths={result.strengths} concerns={result.concerns} />
      )}
    </form>
  );
};

const AIToolsPage = () => {
  const [activeTab, setActiveTab] = useState("outreach");
  const activeTabData = TABS.find((t) => t.id === activeTab);
  const panels = { outreach: <OutreachPanel />, followup: <FollowUpPanel />, score: <ScorePanel /> };

  return (
    <div className="p-6 max-w-3xl mx-auto page-enter">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">AI Tools</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate personalized messages and score leads with AI.</p>
      </div>

      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl mb-6">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id ? "bg-white text-gray-900 shadow-card" : "text-gray-500 hover:text-gray-700"
            }`}>
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-5 -mt-2">{activeTabData?.description}</p>

      <div className="card p-5">{panels[activeTab]}</div>

      <div className="mt-5 rounded-xl bg-surface-50 border border-surface-200 px-4 py-3">
        <p className="text-xs font-medium text-gray-600 mb-1.5">💡 Tips for better results</p>
        <ul className="space-y-1 text-xs text-gray-500">
          <li>• Add detailed notes to your leads before generating messages</li>
          <li>• Include specific pain points in your product description</li>
          <li>• Score leads regularly to keep your pipeline up to date</li>
        </ul>
      </div>
    </div>
  );
};

export default AIToolsPage;