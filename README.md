# Meeting Analysis System

Automatisierte Analyse von Meeting-Protokollen mit KI-gestützter Extraktion von Zusammenfassungen, Action Items und Teilnehmern.

## Tech Stack

**Frontend:** Angular 20, TypeScript, CSS
**Backend:** Python Flask, Google Gemini AI API  

## Quick Start

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   source .venv/bin/activate
   echo "GOOGLE_API_KEY=your_api_key" > .env
   python meetings.py
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Access:** http://localhost:4200

## API Endpoints

- `POST /meetings` - Meeting erstellen
- `GET /meetings` - Alle Meetings auflisten  
- `GET /meetings/{id}` - Spezifisches Meeting abrufen
- `DELETE /meetings/{id}` - Meeting löschen

## Tests

```bash
# Backend Tests
cd backend && python test_meetings.py

# Frontend Tests  
cd frontend && npm test
```
