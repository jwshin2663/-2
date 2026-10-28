# Stock Lens

Yahoo Finance 데이터를 조회해 종목의 기간별 종가, 수익률, 연환산 변동성을 보여주는 FastAPI 웹 앱입니다.

## 설치

Python 3.10 이상을 준비한 뒤 프로젝트 디렉터리에서 실행합니다.

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
```

## 모델 준비

이 프로젝트는 로컬 AI 모델이나 별도 모델 파일을 사용하지 않습니다. 실행 시 `yfinance`가 Yahoo Finance에서 시장 데이터를 조회합니다. 인터넷 연결이 필요합니다.

## 실행

```bash
uvicorn main:app --reload
```

브라우저에서 `http://127.0.0.1:8000`을 열고 티커(예: `AAPL`, `005930.KS`)와 기간을 선택합니다. 상태 확인은 `http://127.0.0.1:8000/api/health`에서 할 수 있습니다.

표시되는 시장 데이터는 투자 조언이 아니며, Yahoo Finance에서 조회 가능한 시점의 데이터에 따라 달라질 수 있습니다.
