# Meeting Analysis Backend

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Update `.env` file:
```py
GOOGLE_API_KEY=your_google_api_key_here
```

If you don't have a Google API key, you can create one [here](https://aistudio.google.com/u/1/apikey)


## Run

```bash
python meetings.py
```

Server läuft auf `http://localhost:5000`

## API Endpoints

- `POST /meetings` - Create meeting
- `GET /meetings` - List all meetings  
- `GET /meetings/{id}` - Get specific meeting
- `DELETE /meetings/{id}` - Delete meeting

## Tests

```bash
python test_meetings.py
```
