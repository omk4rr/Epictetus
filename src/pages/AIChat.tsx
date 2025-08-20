import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { ChatHistory } from "@/components/Chat/ChatHistory";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import { ChatSidebar } from "@/components/Chat/ChatSidebar";
import { EvidenceModal } from "@/components/Chat/EvidenceModal";
import { mockChatData } from "@/data/mockChatData";
import { v4 as uuidv4 } from "uuid";
import { apiFetch } from '../lib/utils';


export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  response?: ChatResponse;
}

export interface ChatResponse {
  chat_id: string;
  generated_at: string;
  query: string;
  summary: string;
  disclaimer: string;
  recommendations: Recommendation[];
  global_confidence: number;
  explainability: Explainability;
  notes: {
    politician_claims_policy: string;
    data_retention_hint: string;
  };
}

export interface Recommendation {
  ticker: string;
  action: "buy" | "long" | "short" | "hold";
  score: number;
  confidence: number;
  rationale: string;
  drivers: Evidence[];
  llm_json: any;
}

export interface Evidence {
  doc_id: string;
  type: string;
  summary: string;
  source: string;
  url: string;
  published_at: string;
  source_trust: number;
  verified: boolean;
}

export interface Explainability {
  ensemble: {
    finbert: number;
    llm: number;
    lexicon: number;
  };
  top_contributing_sentences: {
    text: string;
    score: number;
  }[];
  uncertainty_reason?: string;
}

// Web search integration
async function fetchWebSearch(query: string, maxResults = 5) {
  return apiFetch(`/v1/web_search?query=${encodeURIComponent(query)}&max_results=${maxResults}`);
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState(mockChatData.chatHistory);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence[] | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [webResults, setWebResults] = useState<any[]>([]);
  const [webLoading, setWebLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL as string
    if (!backendUrl) {
      setWsError('Backend URL is not set.')
      return
    }
    const wsUrl = new URL('/ws/insights', backendUrl)
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:'

    let ws: WebSocket | null = null
    try {
      ws = new WebSocket(wsUrl.toString())
      ws.onmessage = (event) => {
        try {
          setInsights(JSON.parse(event.data))
        } catch (e) {
          setWsError('Failed to parse insights data.')
        }
      }
      ws.onerror = () => setWsError('WebSocket connection error.')
    } catch (e) {
      setWsError('WebSocket initialization failed.')
    }
    return () => ws && ws.close()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string, watchlistId?: string, webSearch?: boolean) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      type: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const payload = { query: content, web_search: Boolean(webSearch) };
      const resp: ChatResponse = await apiFetch('/v1/rag_chat', 'POST', payload);

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        type: "assistant",
        content: resp.summary,
        timestamp: new Date().toISOString(),
        response: resp,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const chatId = uuidv4();
    setCurrentChat(chatId);
    setMessages([]);
    
    // Add to chat history
    const newChat = {
      id: chatId,
      title: "New Chat",
      preview: "Start a conversation...",
      timestamp: new Date().toISOString(),
    };
    setChatHistory(prev => [newChat, ...prev]);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId);
    // In a real app, load messages for this chat
    setMessages([]);
  };

  const handleViewEvidence = (drivers: Evidence[]) => {
    setSelectedEvidence(drivers);
    setIsEvidenceModalOpen(true);
  };

  // Example: trigger web search on button click or when query contains 'search:'
  async function handleWebSearch(query: string) {
    setWebLoading(true);
    try {
      const res = await fetchWebSearch(query);
      setWebResults(res.results || []);
    } catch (e) {
      setWebResults([]);
    }
    setWebLoading(false);
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Left Sidebar - Chat History */}
        <div className="w-1/4 border-r border-card-border">
          <ChatHistory
            chatHistory={chatHistory}
            currentChat={currentChat}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Center - Chat Window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onViewEvidence={handleViewEvidence}
            messagesEndRef={messagesEndRef}
          />
          {/* Add a button to trigger web search for the current input */}
          {/* This button is currently not connected to a specific input field */}
          <button onClick={() => handleWebSearch("example query")} disabled={webLoading}>
            {webLoading ? 'Searching...' : 'Web Search'}
          </button>
          {/* Display web search results if present */}
          {webResults.length > 0 && (
            <div className="web-search-results">
              <h4>Web Results</h4>
              <ul>
                {webResults.map((r, i) => (
                  <li key={i}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
                    <p>{r.snippet}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {wsError && (
            <div className="p-2 text-sm text-red-500">{wsError}</div>
          )}
          {!wsError && !insights && (
            <div className="p-2 text-sm text-muted-foreground">Loading insights...</div>
          )}
          {insights && (
            <div className="insights-block">
              <h4>LLM Market Insights</h4>
              <p>{insights.summary}</p>
              <ul>
                {insights.top_sentiments.map((item: any, i: number) => (
                  <li key={i}>
                    {item.ticker}: {typeof item.score === 'number' ? item.score.toFixed(2) : String(item.score)} ({item.type})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quick Summary */}
        <div className="w-1/4 border-l border-card-border">
          <ChatSidebar />
        </div>
      </div>

      {/* Evidence Modal */}
      <EvidenceModal
        evidence={selectedEvidence}
        isOpen={isEvidenceModalOpen}
        onClose={() => {
          setIsEvidenceModalOpen(false);
          setSelectedEvidence(null);
        }}
      />
    </DashboardLayout>
  );
}