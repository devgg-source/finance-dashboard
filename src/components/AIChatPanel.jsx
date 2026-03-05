import { CopilotChat } from "@copilotkit/react-ui";
import { useSidebar } from "../context/SidebarContext";
import { X, Sparkles } from "lucide-react";
import { useEffect, useCallback, useState } from "react";

const TABLET_BREAKPOINT = 1024;

/**
 * AIChatPanel - A right-side slide-in panel containing the CopilotKit chat.
 * Triggered from the sidebar "AI Assistant" button.
 */
export default function AIChatPanel() {
  const { isAiPanelOpen, setIsAiPanelOpen, isMobile } = useSidebar();
  const [isTablet, setIsTablet] = useState(() => window.innerWidth < TABLET_BREAKPOINT && window.innerWidth >= 768);

  // Track tablet breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth < TABLET_BREAKPOINT && window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show overlay (backdrop) on mobile & tablet, push on desktop
  const isOverlay = isMobile || isTablet;

  // Keyboard shortcut: Cmd+/ or Ctrl+/
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setIsAiPanelOpen((prev) => !prev);
      }
      // Escape to close
      if (e.key === "Escape" && isAiPanelOpen) {
        setIsAiPanelOpen(false);
      }
    },
    [isAiPanelOpen, setIsAiPanelOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {/* Backdrop on mobile & tablet (overlay mode) */}
      {isAiPanelOpen && isOverlay && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsAiPanelOpen(false)}
        />
      )}

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-screen z-50 flex flex-col transition-transform duration-300 ease-in-out
          ${isMobile ? 'w-full' : isTablet ? 'w-[380px]' : 'w-[400px]'}
          ${isAiPanelOpen ? "translate-x-0" : "translate-x-full"}
        `}
        style={{
          backgroundColor: "#0d0d14",
          borderLeft: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Xpensio AI</h3>
              <p className="text-[11px] text-indigo-200/60">Ask anything about your finances</p>
            </div>
          </div>
          <button
            onClick={() => setIsAiPanelOpen(false)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CopilotChat fills the rest */}
        <div className="flex-1 overflow-hidden ai-chat-panel">
          <CopilotChat
            instructions={`You are Xpensio AI — a helpful financial assistant for the Xpensio personal finance dashboard.

Your role:
- Help users understand their spending patterns, income, and savings
- Answer questions about their financial data using the context provided
- Provide actionable financial advice and budget recommendations
- You can add or delete transactions when users ask (always confirm before doing so)
- Search through transactions to find specific entries
- Analyze spending by category and identify trends

Guidelines:
- Currency is Indian Rupees (₹ / INR)
- Be concise but insightful — users want quick answers, not essays
- When discussing amounts, always format them with ₹ symbol (e.g., ₹12,500)
- If you spot concerning spending patterns, proactively mention them
- When the user asks to add a transaction, confirm the details before executing
- Use the available actions/tools to fetch and manipulate data rather than guessing
- If you don't have enough data to answer accurately, say so honestly`}
            labels={{
              initial:
                "Hi! I'm your Xpensio AI assistant. Ask me anything about your finances — spending analysis, budget tips, transaction search, or let me add entries for you.",
              placeholder: "Ask about your finances...",
            }}
          />
        </div>
      </aside>
    </>
  );
}
