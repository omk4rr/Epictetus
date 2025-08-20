// Mock data for demonstration purposes

export const mockTickers = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 185.42,
    change: 2.13,
    changePercent: 1.16,
    sparklineData: [180, 182, 181, 183, 185, 184, 186, 185],
    lastSignal: {
      type: "bullish" as const,
      confidence: 0.82,
      timestamp: "2024-01-15T14:30:00Z"
    }
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 238.85,
    change: -4.22,
    changePercent: -1.74,
    sparklineData: [245, 243, 241, 240, 238, 237, 239, 238],
    lastSignal: {
      type: "bearish" as const,
      confidence: 0.65,
      timestamp: "2024-01-15T14:25:00Z"
    }
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 412.33,
    change: 1.85,
    changePercent: 0.45,
    sparklineData: [408, 410, 409, 411, 412, 413, 412, 412],
    lastSignal: {
      type: "neutral" as const,
      confidence: 0.71,
      timestamp: "2024-01-15T14:20:00Z"
    }
  },
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries",
    price: 2845.75,
    change: 12.40,
    changePercent: 0.44,
    sparklineData: [2830, 2835, 2840, 2838, 2842, 2845, 2847, 2845],
    lastSignal: {
      type: "bullish" as const,
      confidence: 0.78,
      timestamp: "2024-01-15T14:15:00Z"
    }
  }
];

export const mockFeedItems = [
  {
    id: "1",
    source: "news" as const,
    title: "Apple Reports Strong Q4 iPhone Sales Despite Supply Chain Headwinds",
    summary: "Apple Inc. exceeded analyst expectations with robust iPhone sales in Q4, driven by strong demand for the iPhone 15 series and improved supply chain efficiency.",
    sentiment: "positive" as const,
    confidence: 0.85,
    timestamp: "2024-01-15T14:30:00Z",
    url: "https://example.com/apple-q4",
    engagement: {
      views: 25800,
      likes: 342
    },
    entities: ["AAPL", "iPhone", "Q4 Earnings"],
    trustScore: "high" as const
  },
  {
    id: "2", 
    source: "twitter" as const,
    title: "Breaking: Tesla announces major Gigafactory expansion in Austin",
    summary: "Elon Musk confirms Tesla will double production capacity at Austin Gigafactory, potentially impacting Q1 delivery targets and long-term growth projections.",
    sentiment: "positive" as const,
    confidence: 0.72,
    timestamp: "2024-01-15T14:25:00Z",
    url: "https://twitter.com/elonmusk/status/123",
    engagement: {
      likes: 15600,
      retweets: 4800,
      comments: 2100
    },
    entities: ["TSLA", "Gigafactory", "Austin"],
    trustScore: "high" as const
  },
  {
    id: "3",
    source: "reddit" as const,
    title: "Microsoft's AI division sees massive growth in enterprise adoption",
    summary: "Discussion thread analyzing Microsoft's Azure AI services growth, with multiple enterprise customers reporting successful ChatGPT integration and productivity gains.",
    sentiment: "positive" as const,
    confidence: 0.68,
    timestamp: "2024-01-15T14:20:00Z",
    url: "https://reddit.com/r/investing/post/123",
    engagement: {
      likes: 890,
      comments: 145
    },
    entities: ["MSFT", "Azure", "AI"],
    trustScore: "medium" as const
  },
  {
    id: "4",
    source: "youtube" as const,
    title: "Indian Government Announces New Digital Infrastructure Investment",
    summary: "Finance Minister reveals ₹2 trillion digital infrastructure plan including 5G expansion and fintech support, potentially benefiting major Indian technology companies.",
    sentiment: "positive" as const,
    confidence: 0.79,
    timestamp: "2024-01-15T14:15:00Z",
    url: "https://youtube.com/watch?v=example",
    engagement: {
      views: 124000,
      likes: 3400
    },
    entities: ["RELIANCE.NS", "Digital India", "5G"],
    trustScore: "high" as const
  },
  {
    id: "5",
    source: "news" as const,
    title: "Market Volatility Concerns as Tech Stocks Face Pressure",
    summary: "Analysts warn of potential correction in tech sector amid rising interest rates and regulatory scrutiny, with major players showing signs of weakness.",
    sentiment: "negative" as const,
    confidence: 0.73,
    timestamp: "2024-01-15T14:10:00Z",
    url: "https://example.com/tech-pressure",
    engagement: {
      views: 18200
    },
    entities: ["Tech Sector", "Market Volatility"],
    trustScore: "high" as const
  }
];

export const mockSignals = [
  {
    id: "1",
    ticker: "AAPL",
    type: "bullish" as const,
    score: 8.7,
    confidence: 0.85,
    action: "Strong buy signal based on earnings momentum and positive sentiment",
    timestamp: "2024-01-15T14:30:00Z",
    evidenceCount: 12
  },
  {
    id: "2",
    ticker: "RELIANCE.NS", 
    type: "bullish" as const,
    score: 7.9,
    confidence: 0.78,
    action: "Moderate buy signal from government infrastructure announcements",
    timestamp: "2024-01-15T14:15:00Z",
    evidenceCount: 8
  },
  {
    id: "3",
    ticker: "MSFT",
    type: "neutral" as const,
    score: 6.2,
    confidence: 0.71,
    action: "Hold position - mixed signals from AI growth vs market concerns",
    timestamp: "2024-01-15T14:20:00Z",
    evidenceCount: 6
  },
  {
    id: "4",
    ticker: "TSLA",
    type: "bearish" as const,
    score: 4.8,
    confidence: 0.65,
    action: "Caution advised - positive expansion news offset by sector concerns",
    timestamp: "2024-01-15T14:25:00Z",
    evidenceCount: 5
  }
];

export const mockBacktestData = {
  equityCurve: [
    { date: "2024-01-01", value: 100000 },
    { date: "2024-01-02", value: 101250 },
    { date: "2024-01-03", value: 102100 },
    { date: "2024-01-04", value: 101800 },
    { date: "2024-01-05", value: 103500 },
    { date: "2024-01-08", value: 104200 },
    { date: "2024-01-09", value: 105800 },
    { date: "2024-01-10", value: 104900 },
    { date: "2024-01-11", value: 106700 },
    { date: "2024-01-12", value: 108200 },
    { date: "2024-01-15", value: 109500 }
  ],
  metrics: {
    totalReturn: 9.5,
    sharpeRatio: 1.42,
    maxDrawdown: -2.1,
    winRate: 68.5,
    profitFactor: 1.35
  }
};

export const mockSettings = {
  finbertWeight: 0.5,
  llmWeight: 0.3,
  lexiconWeight: 0.2,
  zScoreThreshold: 2.0,
  timeWindow: "6h",
  alertsEnabled: true
};