export const mockChatData = {
  chatHistory: [
    {
      id: "chat-1",
      title: "Tech Sector Analysis",
      preview: "Which of my tech stocks have the best prospects for Q4?",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      id: "chat-2", 
      title: "Policy Impact Review",
      preview: "How will the new regulations affect my financial holdings?",
      timestamp: "2024-01-14T15:45:00Z",
    },
    {
      id: "chat-3",
      title: "Earnings Season Preview", 
      preview: "Upcoming earnings that could move my watchlist stocks",
      timestamp: "2024-01-13T09:15:00Z",
    },
  ],

  sampleResponse: {
    chat_id: "response-1",
    generated_at: "2024-01-15T10:35:00Z",
    query: "Which of my 6 tracked stocks are likely to surge tomorrow based on recent Indian Government announcements and politician purchases?",
    summary: "Based on recent policy announcements and verified market activity, RELIANCE.NS shows the strongest bullish signals due to green energy subsidies, while TCS.NS presents moderate upside from digital infrastructure initiatives.",
    disclaimer: "Research-only — not financial advice.",
    recommendations: [
      {
        ticker: "RELIANCE.NS",
        action: "buy" as const,
        score: 0.82,
        confidence: 0.74,
        rationale: "Strong correlation with new renewable energy subsidies announced yesterday. Verified institutional buying from major funds aligns with policy direction.",
        drivers: [
          {
            doc_id: "doc-1",
            type: "policy_declaration",
            summary: "Government announces ₹1.5 lakh crore green energy subsidy package targeting solar and hydrogen sectors",
            source: "GDELT",
            url: "https://example.com/policy-announcement",
            published_at: "2024-01-14T18:30:00Z",
            source_trust: 0.9,
            verified: true,
          },
          {
            doc_id: "doc-2", 
            type: "insider_purchase",
            summary: "Large institutional purchase of 2.3M shares reported via exchange filing",
            source: "SEC",
            url: "https://example.com/filing-123",
            published_at: "2024-01-14T16:45:00Z",
            source_trust: 0.95,
            verified: true,
          },
          {
            doc_id: "doc-3",
            type: "rumor",
            summary: "Social media speculation about additional partnership announcements",
            source: "Twitter",
            url: "https://example.com/tweet-456",
            published_at: "2024-01-14T20:15:00Z",
            source_trust: 0.3,
            verified: false,
          },
        ],
        llm_json: {
          reasoning: "Policy alignment analysis",
          confidence_factors: ["verified_filings", "policy_correlation", "institutional_activity"],
        },
      },
      {
        ticker: "TCS.NS",
        action: "long" as const,
        score: 0.68,
        confidence: 0.61,
        rationale: "Moderate positive signals from digital infrastructure policy announcements, but limited verified activity data.",
        drivers: [
          {
            doc_id: "doc-4",
            type: "policy_declaration", 
            summary: "Digital India 2.0 initiative allocates ₹50,000 crore for IT infrastructure modernization",
            source: "GDELT",
            url: "https://example.com/digital-policy",
            published_at: "2024-01-14T14:20:00Z",
            source_trust: 0.85,
            verified: true,
          },
          {
            doc_id: "doc-5",
            type: "insider_purchase",
            summary: "Unconfirmed reports of executive stock purchases",
            source: "Reddit",
            url: "https://example.com/reddit-post",
            published_at: "2024-01-14T19:30:00Z",
            source_trust: 0.4,
            verified: false,
          },
        ],
        llm_json: {
          reasoning: "Digital transformation opportunity",
          confidence_factors: ["policy_relevance", "sector_alignment"],
        },
      },
      {
        ticker: "HDFC.NS",
        action: "hold" as const,
        score: 0.45,
        confidence: 0.52,
        rationale: "Mixed signals with banking policy uncertainty. No clear directional catalyst identified.",
        drivers: [
          {
            doc_id: "doc-6",
            type: "policy_declaration",
            summary: "RBI announces review of lending guidelines for large banks",
            source: "GDELT", 
            url: "https://example.com/rbi-announcement",
            published_at: "2024-01-14T12:00:00Z",
            source_trust: 0.9,
            verified: true,
          },
        ],
        llm_json: {
          reasoning: "Regulatory uncertainty impact",
          confidence_factors: ["regulatory_review", "unclear_impact"],
        },
      },
    ],
    global_confidence: 0.68,
    explainability: {
      ensemble: {
        finbert: 0.5,
        llm: 0.3,
        lexicon: 0.2,
      },
      top_contributing_sentences: [
        {
          text: "Government announces ₹1.5 lakh crore green energy subsidy package targeting solar and hydrogen sectors",
          score: 0.92,
        },
        {
          text: "Large institutional purchase of 2.3M shares reported via exchange filing", 
          score: 0.87,
        },
        {
          text: "Digital India 2.0 initiative allocates ₹50,000 crore for IT infrastructure modernization",
          score: 0.76,
        },
      ],
      uncertainty_reason: "Limited verification for some politician purchase claims",
    },
    notes: {
      politician_claims_policy: "Only verified filings marked verified. Social claims flagged unverified.",
      data_retention_hint: "This analysis will be stored if user chooses Save.",
    },
  },
};