"""
Streamlit Dashboard for MarketSentinel (optional demo UI)
Displays signals, watchlist, feed, backtest, explainability, and settings.
"""
import streamlit as st

def main():
    st.title("MarketSentinel Dashboard")
    st.markdown(
        "> **Disclaimer:** This is a research prototype — not financial advice.\n"
    )
    st.sidebar.header("Navigation")
    page = st.sidebar.selectbox("Go to", [
        "Portfolio / Watchlist", "Live Feed", "Signals & Alerts", "Backtest & Performance", "Explainability", "Settings"
    ])
    st.write(f"## {page}")
    st.info("This is a placeholder UI. Connect to backend for live data.")

if __name__ == "__main__":
    main()
