import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { WatchlistCard } from "@/components/Watchlist/WatchlistCard";
import { QuickSettings } from "@/components/Settings/QuickSettings";
import { FeedCard } from "@/components/Feed/FeedCard";
import { FeedFilters } from "@/components/Feed/FeedFilters";
import { SignalsCard } from "@/components/Signals/SignalsCard";
import { BacktestSnapshot } from "@/components/Backtest/BacktestSnapshot";
import { ExplainSignalModal } from "@/components/Modals/ExplainSignalModal";
import { AddTickerModal } from "@/components/Modals/AddTickerModal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw } from "lucide-react";
import { 
  mockTickers, 
  mockBacktestData, 
  mockSettings 
} from "@/data/mockData";
import { apiFetch } from '../lib/utils';

export default function Dashboard() {
  const [tickers, setTickers] = useState(mockTickers);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [settings, setSettings] = useState(mockSettings);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isAddTickerModalOpen, setIsAddTickerModalOpen] = useState(false);
  const [expandedFeedItem, setExpandedFeedItem] = useState(null);
  const [wsError, setWsError] = useState<string | null>(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL as string
    if (!backendUrl) {
      setWsError('Backend URL is not set.')
      return
    }
    const wsUrl = new URL('/ws/signals', backendUrl)
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:'

    let ws: WebSocket | null = null
    try {
      ws = new WebSocket(wsUrl.toString())
      ws.onmessage = (event) => {
        try {
          setSignals(JSON.parse(event.data))
        } catch (e) {
          setWsError('Failed to parse signals data.')
        }
      }
      ws.onerror = () => setWsError('WebSocket connection error.')
    } catch (e) {
      setWsError('WebSocket initialization failed.')
    }
    return () => { ws && ws.close() }
  }, [])

  // Fetch live feed from backend
  useEffect(() => {
    let isMounted = true
    const loadFeed = async () => {
      try {
        const items = await apiFetch('/v1/feed')
        if (isMounted) setFeedItems(items || [])
      } catch (e) {
        console.error('Failed to load feed', e)
        if (isMounted) setFeedItems([])
      }
    }
    loadFeed()
    const id = setInterval(loadFeed, 20000) // refresh every 20s
    return () => { isMounted = false; clearInterval(id) }
  }, [])

  // Filter feed items based on active filter
  const filteredFeedItems = activeFilter === "all" 
    ? feedItems 
    : feedItems.filter(item => item.source === activeFilter);

  // Calculate item counts for filters
  const itemCounts = {
    all: feedItems.length,
    news: feedItems.filter(item => item.source === "news").length,
    twitter: feedItems.filter(item => item.source === "twitter").length,
    reddit: feedItems.filter(item => item.source === "reddit").length,
    youtube: feedItems.filter(item => item.source === "youtube").length,
  };

  const handleAddTicker = async (newTicker: any) => {
    try {
      const response = await apiFetch('/v1/watchlist/add', 'POST', { ticker: newTicker.symbol });
      if (response.success && response.watchlist) {
        setTickers(prev => {
          // naive merge: append if not exists
          if (prev.find(t => t.symbol === newTicker.symbol)) return prev
          return [...prev, { ...newTicker, price: 0, change: 0, changePercent: 0, sparklineData: [] }]
        })
      } else {
        alert(`Failed to add ticker: ${response.message}`);
      }
    } catch (error) {
      console.error("Error adding ticker:", error);
      alert("Failed to add ticker due to an error.");
    }
  };

  const handleRemoveTicker = async (symbol: string) => {
    try {
      const response = await apiFetch(`/v1/watchlist/remove`, 'POST', { ticker: symbol });
      if (response.success && response.watchlist) {
        setTickers(prev => prev.filter(ticker => ticker.symbol !== symbol));
      } else {
        alert(`Failed to remove ticker: ${response.message}`);
      }
    } catch (error) {
      console.error("Error removing ticker:", error);
      alert("Failed to remove ticker due to an error.");
    }
  };

  const handleExplainSignal = (signal: any) => {
    setSelectedSignal(signal);
    setIsExplainModalOpen(true);
  };

  const handleExpandFeedItem = (item: any) => {
    setExpandedFeedItem(item);
    // In a real app, this would open a drawer or modal with full content
    console.log("Expand feed item:", item);
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Left Sidebar - 20% */}
        <div className="w-1/5 border-r border-card-border p-4 space-y-4">
          <WatchlistCard
            tickers={tickers}
            onAddTicker={() => setIsAddTickerModalOpen(true)}
            onRemoveTicker={handleRemoveTicker}
          />
          <QuickSettings 
            settings={settings}
            onSettingsChange={setSettings}
          />
        </div>

        {/* Center Column - 55% */}
        <div className="flex-1 p-4 space-y-4">
          {/* Feed Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-display font-semibold">Live Market Feed</h1>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Feed Filters */}
          <FeedFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            itemCounts={itemCounts}
          />

          {/* Feed Items */}
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {filteredFeedItems.map((item) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  onExpand={handleExpandFeedItem}
                />
              ))}
              
              {filteredFeedItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No items found for the selected filter.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar - 25% */}
        <div className="w-1/4 border-l border-card-border p-4 space-y-4">
          <SignalsCard
            signals={signals}
            onExplainSignal={handleExplainSignal}
          />
          <BacktestSnapshot
            data={mockBacktestData}
            onViewDetails={() => console.log("View backtest details")}
          />
        </div>
      </div>

      {/* Modals */}
      <ExplainSignalModal
        signal={selectedSignal}
        isOpen={isExplainModalOpen}
        onClose={() => {
          setIsExplainModalOpen(false);
          setSelectedSignal(null);
        }}
      />

      <AddTickerModal
        isOpen={isAddTickerModalOpen}
        onClose={() => setIsAddTickerModalOpen(false)}
        onAddTicker={handleAddTicker}
        maxTickers={6}
        currentCount={tickers.length}
      />
    </DashboardLayout>
  );
}