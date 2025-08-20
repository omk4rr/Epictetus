"""
YouTube Transcript Client for MarketSentinel
Fetches YouTube transcripts for a query and dumps to data/raw/.
"""
import logging
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound
from pathlib import Path
from typing import List

logger = logging.getLogger("youtube_client")
RAW_DATA_DIR = Path(__file__).parent.parent / "data" / "raw"
RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)

class YouTubeClient:
    def fetch_transcripts(self, video_ids: List[str]) -> dict:
        """
        Fetches transcripts for a list of YouTube video IDs.
        Dumps results to data/raw/youtube_transcripts.json.
        """
        output_file = RAW_DATA_DIR / "youtube_transcripts.json"
        transcripts = {}
        for vid in video_ids:
            try:
                transcript = YouTubeTranscriptApi.get_transcript(vid)
                transcripts[vid] = transcript
            except NoTranscriptFound:
                logger.warning(f"No transcript found for video {vid}")
            except Exception as e:
                logger.error(f"Error fetching transcript for {vid}: {e}")
        with open(output_file, "w") as f:
            import json
            json.dump(transcripts, f)
        return transcripts
