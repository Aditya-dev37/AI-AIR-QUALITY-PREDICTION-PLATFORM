import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, MessageCircleCode } from 'lucide-react';
import api from '../api/client';
import { getExactCityAQI } from '../App';

const QUICK_QUESTIONS = [
  "AQI in Delhi right now?",
  "72-hour forecast for Mumbai",
  "Is it safe to jog in Bengaluru?",
  "Health tips for Kolkata pollution"
];

function generateClientFallback(userText) {
  const queryLower = userText.toLowerCase().strip ? userText.toLowerCase().strip() : userText.toLowerCase();

  const isGreeting = ["hello", "hi", "hey", "greetings", "good morning", "good evening", "help"].some(g => queryLower.includes(g));
  if (isGreeting && !queryLower.includes("aqi") && !queryLower.includes("pollution")) {
    return {
      answer: "Hello! 👋 Welcome to VayuDrishti AI! How can I assist you with live air quality reports, 72-hour forecasts, or health safety tips today?",
      source: "VayuDrishti Assistant"
    };
  }

  let city = "Delhi";
  for (let c of ["mumbai", "bengaluru", "kolkata", "chennai", "hyderabad", "ahmedabad", "pune", "patna", "jaipur", "lucknow"]) {
    if (queryLower.includes(c)) {
      city = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  const info = getExactCityAQI(city);

  if (queryLower.includes("forecast") || queryLower.includes("tomorrow") || queryLower.includes("future")) {
    return {
      answer: `The 72-hour AI forecast for ${city} predicts an average baseline of ${info.current_aqi} AQI (${info.current_status}). Air quality will fluctuate slightly with diurnal traffic peaks.`,
      source: "VayuDrishti Predictive Engine"
    };
  }

  if (queryLower.includes("safe") || queryLower.includes("jog") || queryLower.includes("exercise") || queryLower.includes("health") || queryLower.includes("tip")) {
    const isClean = info.current_status === 'Good' || info.current_status === 'Satisfactory';
    return {
      answer: isClean 
        ? `Air quality in ${city} is currently ${info.current_aqi} AQI (${info.current_status}) — it is safe for outdoor jogging and physical exercises!`
        : `Air quality in ${city} is currently ${info.current_aqi} AQI (${info.current_status}). Sensitive individuals should limit prolonged outdoor exertion and consider an N95 mask near heavy traffic.`,
      source: "VayuDrishti Health Advice"
    };
  }

  const isRelevant = ["aqi", "air", "pollution", "quality", "weather", "forecast", "pm2.5", "pm10", "sky", "temperature"].some(k => queryLower.includes(k));
  if (!isRelevant) {
    return {
      answer: "Data out of context",
      source: "Out of Context Guardrail"
    };
  }

  return {
    answer: `The current Air Quality Index (AQI) in ${city} is ${info.current_aqi} (${info.current_status}).`,
    source: "VayuDrishti Live Engine"
  };
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! 👋 I am VayuDrishti AI. Ask me about live AQI, 72-hour forecasts, or health advice for any Indian city.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const sendQuery = async (queryText) => {
    if (!queryText.trim() || loading) return;

    const userText = queryText.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/chatbot/query', { query: userText });
      const botAns = res.data?.answer || "Data out of context";
      
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: botAns,
        source: res.data?.source || 'Google Gemini 3.6 Flash AI'
      }]);
    } catch (err) {
      const fallback = generateClientFallback(userText);
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: fallback.answer,
        source: fallback.source
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 p-4 rounded-full shadow-2xl transition duration-300 transform hover:scale-105 flex items-center gap-2 font-black text-xs border border-teal-400/40 cursor-pointer"
        >
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="hidden sm:inline">Ask VayuDrishti AI</span>
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-80 sm:w-96 shadow-2xl flex flex-col overflow-hidden h-[520px]">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-500 text-slate-950 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                  VayuDrishti AI <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                </h4>
                <p className="text-[10px] text-slate-400">Google Gemini 3.6 Flash AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Questions Prompts Bar */}
          <div className="bg-slate-950/90 p-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendQuery(q)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 border border-slate-800 rounded-lg text-[10px] font-semibold shrink-0 transition cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-[10px] font-bold shrink-0 border border-teal-500/30">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-teal-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 text-slate-200 border border-slate-800'
                }`}>
                  <p className="whitespace-pre-line">{m.text}</p>
                  {m.source && (
                    <span className="text-[9px] text-teal-400 block mt-1 font-mono">
                      • {m.source}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold italic p-2">
                <Bot className="w-4 h-4 animate-spin" /> Gemini AI generating response...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => { e.preventDefault(); sendQuery(input); }} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything (e.g. hello, AQI in Delhi, weather...)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-slate-950 rounded-xl transition font-bold cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// Embedded Grounded AI Chatbot Section (Bottom of Web Page)
export function EmbeddedChatbotSection() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! 👋 Welcome to VayuDrishti AI! Ask me about AQI predictions, weather reports, or health safety guidelines for any Indian city.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendQuery = async (queryText) => {
    if (!queryText.trim() || loading) return;

    const userText = queryText.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/chatbot/query', { query: userText });
      const botAns = res.data?.answer || "Data out of context";

      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: botAns,
        source: res.data?.source || 'Google Gemini 3.6 Flash AI'
      }]);
    } catch (err) {
      const fallback = generateClientFallback(userText);
      setMessages((prev) => [...prev, { 
        sender: 'bot', 
        text: fallback.answer,
        source: fallback.source
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 my-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500 text-slate-950 rounded-2xl shadow-lg shadow-teal-500/20 font-black">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              Conversational AI Air Quality Assistant <Sparkles className="w-5 h-5 text-teal-400" />
            </h3>
            <p className="text-xs text-slate-400">Powered by Google Gemini 3.6 Flash Conversational AI</p>
          </div>
        </div>
      </div>

      {/* Quick Questions Suggestions Chips Bar */}
      <div className="mb-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-teal-400 font-bold shrink-0 flex items-center gap-1">
          <MessageCircleCode className="w-4 h-4" /> Quick Prompts:
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendQuery(q)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-teal-500/20 hover:text-teal-300 text-slate-200 border border-slate-800 rounded-xl font-semibold shrink-0 transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 h-64 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center text-xs font-bold shrink-0 border border-teal-500/30 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-200 border border-slate-800'
            }`}>
              <p className="whitespace-pre-line">{m.text}</p>
              {m.source && (
                <span className="text-[10px] text-teal-400 block mt-1.5 font-mono font-semibold">
                  • {m.source}
                </span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold italic p-2">
            <Bot className="w-4 h-4 animate-spin" /> Gemini AI generating response...
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendQuery(input); }} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask anything (e.g. 'AQI in Delhi tomorrow?' or 'Is it safe to exercise in Mumbai?')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-slate-950 font-black px-6 py-3 rounded-xl transition text-xs flex items-center gap-2 shadow-lg shrink-0 cursor-pointer"
        >
          <span>Send Query</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
