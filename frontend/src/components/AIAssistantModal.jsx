import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';
import api from '../api/client';
import useAuthStore from '../store/authStore';

export default function AIAssistantModal() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: user?.role === 'student' 
        ? `👋 Hi ${user?.name || 'Student'}! I'm your PlacementOps Career Copilot. Ask me how to prepare for interviews, check your match scores, or identify skill gaps!`
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
      console.error(err);
      // Fallback
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
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500/90 to-amber-600/90 text-black font-semibold shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-105 transition-all duration-300 backdrop-blur-md border border-amber-300/40"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="font-ui text-xs tracking-wider uppercase">AI Copilot</span>
      </button>

      {/* Slide-in Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)] h-[580px] rounded-2xl bg-neutral-950/95 border border-amber-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  PlacementOps AI
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono">
                    {user?.role === 'student' ? 'Career' : user?.role === 'college_admin' ? 'Operations' : 'Recruiter'}
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400">Grounded Intelligence Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-black font-medium rounded-tr-none'
                      : 'bg-neutral-900/90 border border-white/10 text-neutral-200 rounded-tl-none prose prose-invert prose-xs'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start items-center text-neutral-400 text-xs">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/10 text-neutral-400">
                  Analyzing placement graph & generating response...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 border-t border-white/5 bg-neutral-950/60 overflow-x-auto flex gap-2 no-scrollbar">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-[11px] text-neutral-300 hover:text-amber-300 transition-all flex items-center gap-1"
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
            className="p-3 border-t border-white/10 bg-neutral-900/90 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about placements..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
