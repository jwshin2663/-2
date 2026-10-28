from datetime import date, datetime, timedelta
from pathlib import Path

import pandas as pd
import yfinance as yf
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

BASE = Path(__file__).parent
PERIODS = {"1mo": 30, "3mo": 90, "6mo": 180, "1y": 365, "2y": 730, "5y": 1825}
app = FastAPI(title="Stock Lens", version="1.0.0")
app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")

@app.get("/")
def index():
    return FileResponse(BASE / "static" / "index.html")

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "stock-lens"}

@app.get("/api/stock")
def stock(ticker: str = Query(..., min_length=1, max_length=20), period: str = Query("1y")):
    ticker = ticker.strip().upper()
    if period not in PERIODS:
        raise HTTPException(400, "Unsupported date range.")
    if not ticker.replace(".", "").replace("-", "").isalnum():
        raise HTTPException(400, "Ticker may contain letters, numbers, dots, and hyphens only.")
    try:
        end = date.today() + timedelta(days=1)
        start = date.today() - timedelta(days=PERIODS[period])
        frame = yf.download(ticker, start=start.isoformat(), end=end.isoformat(), auto_adjust=False,
                            progress=False, threads=False, timeout=15)
        if frame.empty:
            raise HTTPException(404, f"No data found for '{ticker}'. Check the ticker symbol.")
        close = frame["Close"]
        if isinstance(close, pd.DataFrame):
            close = close.iloc[:, 0]
        close = close.dropna()
        if len(close) < 2:
            raise HTTPException(422, "Not enough price observations to analyze.")
        values = [round(float(value), 4) for value in close.tolist()]
        returns = close.pct_change().dropna()
        try:
            currency = yf.Ticker(ticker).fast_info.get("currency", "")
        except Exception:
            currency = ""
        return {
            "ticker": ticker, "period": period, "currency": currency,
            "as_of": datetime.now().astimezone().isoformat(),
            "data": [{"date": index.strftime("%Y-%m-%d"), "close": value}
                     for index, value in zip(close.index, values)],
            "stats": {
                "latest": values[-1],
                "change_pct": round((values[-1] / values[0] - 1) * 100, 2),
                "volatility_pct": round(float(returns.std() * (252 ** 0.5) * 100), 2),
                "high": max(values), "low": min(values), "observations": len(values),
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(502, f"Market data request failed ({type(exc).__name__}).") from exc
