import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

function genSession() {
  const existing = localStorage.getItem("hf-chat-session");
  if (existing) return existing;
  const id = "hf-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  localStorage.setItem("hf-chat-session", id);
  return id;
}

const OPENING = {
  role: "assistant",
  text:
    "Hi! I'm the Hetal Finserv assistant. Ask me about SIPs, insurance, loans, taxes, our founders — anything. I'll also arrange a call with Sandeep if you'd like.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([OPENING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [session] = useState(() => genSession());
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await axios.post(`${API}/api/chat`, { session_id: session, text });
      setMessages((m) => [...m, { role: "assistant", text: res.data.reply }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text:
            "I'm having trouble reaching the server. Please try again in a moment, or call +91 87670 95307.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid="chat-widget-toggle"
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed z-[60] bottom-6 right-6 md:bottom-8 md:right-8 h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105"
        style={{
          background: open ? "var(--hf-obsidian)" : "var(--hf-coral)",
          color: "#fff",
          boxShadow:
            "0 12px 32px -8px rgba(242,122,84,0.45), 0 4px 10px rgba(14,15,12,0.25)",
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            data-testid="chat-widget-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[60] bottom-24 right-4 md:right-8 w-[calc(100vw-2rem)] max-w-[400px] h-[560px] max-h-[80vh] flex flex-col"
            style={{
              background: "var(--hf-obsidian)",
              color: "var(--hf-on-dark-primary)",
              border: "1px solid rgba(244,239,230,0.14)",
              boxShadow: "0 30px 60px -20px rgba(14,15,12,0.6)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between border-b border-hair-light"
              style={{ background: "var(--hf-obsidian)" }}
            >
              <div>
                <p
                  className="font-mono-label"
                  style={{ color: "var(--hf-gold-soft)", fontSize: "0.66rem" }}
                >
                  — HETAL FINSERV ASSISTANT
                </p>
                <p
                  className="font-display mt-1"
                  style={{ fontSize: "1rem", color: "#f4efe6", lineHeight: 1 }}
                >
                  How can we help?
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1.5 font-mono-label"
                style={{ color: "#8fd48f", fontSize: "0.62rem" }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#8fd48f" }} />
                Online
              </span>
            </div>

            {/* Body */}
            <div
              ref={bodyRef}
              className="flex-1 overflow-y-auto px-5 py-6 space-y-4 no-scrollbar"
              data-testid="chat-messages"
            >
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[85%] px-4 py-3 text-[0.9rem] leading-[1.55] whitespace-pre-wrap"
                    style={{
                      background:
                        m.role === "user" ? "var(--hf-coral)" : "rgba(244,239,230,0.06)",
                      color: m.role === "user" ? "#fff" : "var(--hf-on-dark-primary)",
                      border:
                        m.role === "user"
                          ? "none"
                          : "1px solid rgba(244,239,230,0.14)",
                      borderRadius: 4,
                    }}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex items-center gap-2 font-mono-label text-on-dark-mute text-[0.7rem]">
                  <Loader2 size={12} className="animate-spin" />
                  Assistant is typing…
                </div>
              )}
            </div>

            {/* Input */}
            <form
              className="px-4 pb-4 pt-3 border-t border-hair-light flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type your question…"
                data-testid="chat-input"
                className="flex-1 bg-transparent resize-none outline-none text-[0.9rem] leading-[1.5] py-2 px-3"
                style={{
                  color: "var(--hf-on-dark-primary)",
                  border: "1px solid rgba(244,239,230,0.18)",
                  minHeight: 42,
                  maxHeight: 120,
                }}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                data-testid="chat-send"
                aria-label="Send message"
                className="h-[42px] w-[42px] flex items-center justify-center transition-opacity disabled:opacity-40"
                style={{ background: "var(--hf-gold)", color: "var(--hf-obsidian)" }}
              >
                <Send size={16} strokeWidth={1.8} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
