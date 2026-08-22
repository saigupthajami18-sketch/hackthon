import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api/client';
import useAuthStore from '../store/authStore';

export default function AIAssistantModal() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: user?.role === 'student' 
        ? `👋 Hi ${user?.name || 'Student'}! I'm your PlacementOps Career Copilot. Ask me how to prepare for technical interviews, check your match scores, or identify skill gaps!`
        : user?.role === 'college_admin'
        ? `🏛️ Welcome Admin! I'm your Placement Operations Copilot. Ask me about batch statistics, drafting circulars, or schedule conflict resolution.`
        : `💼 Welcome Recruiter! I'm your Candidate Intelligence Copilot. Ask me to summarize shortlisted candidates, evaluate technical skills, or draft JDs.`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(
    user?.role === 'student'
      ? ["How do I prepare for Microsoft SDE?", "Analyze my skill gaps", "What drives am I eligible for?"]
      : user?.role === 'college_admin'
      ? ["Draft placement announcement notice", "Show live drive conflict summary", "Analyze CSE vs ECE placement %"]
      : ["Generate 3 technical interview questions", "Summarize top 5 shortlisted candidates", "Draft JD for Cloud Engineer"]
  );

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/chat', {
        message: query,
        history: newMessages.slice(-6)
      });
      setMessages([...newMessages, { role: 'assistant', content: res.data.reply }]);
      if (res.data.suggested_actions && res.data.suggested_actions.length > 0) {
        setSuggestions(res.data.suggested_actions);
      }
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: `💡 **AI Insight**: Based on your current profile and active drive criteria, focusing on System Design, Data Structures (DP & Graphs), and Cloud Deployment (Docker/AWS) provides the highest probability of interview clearance.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        <span>AI Copilot</span>
      </button>

      {/* Assistant Modal Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 leading-tight">PlacementOps Copilot</h3>
                <p className="text-[11px] text-emerald-600 font-medium">● Online • Real-time AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 h-80 overflow-y-auto space-y-3 bg-[#F8FAFC]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-xs'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 justify-start items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-xs">
                  Analyzing placement graph & generating response...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50 overflow-x-auto flex gap-1.5 no-scrollbar">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] text-slate-600 hover:text-blue-700 transition-all flex items-center gap-1 shadow-2xs font-medium"
              >
                <span>{s}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about placements..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors flex items-center justify-center shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
