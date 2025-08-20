# Dockerfile for MarketSentinel Backend
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./backend/app

EXPOSE 8000

CMD ["uvicorn", "backend.app.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
