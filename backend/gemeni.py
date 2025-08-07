from google import genai
import os
from dotenv import load_dotenv
from google.genai.client import Client

from meeting_models import Analysis

resolve = load_dotenv()
if not resolve:
    raise ValueError(
        "Failed to load .env file. Ensure it exists and is correctly formatted."
    )

api_key: str | None = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY is not set in .env")

client: Client = genai.Client(api_key=api_key)


def parse_gemini_analysis(text: str) -> Analysis:
    section = None
    summary_lines: list[str] = []
    action_items: list[str] = []
    participants: list[str] = []

    for line in text.splitlines():
        line = line.strip()

        if line.startswith("ZUSAMMENFASSUNG:"):
            section = "summary"
            continue
        elif line.startswith("ACTION ITEMS:"):
            section = "action_items"
            continue
        elif line.startswith("TEILNEHMER:"):
            section = "participants"
            continue
        elif line.startswith("Meeting-Protokoll:"):
            break

        if section == "summary" and line:
            summary_lines.append(line)
        elif section == "action_items" and line.startswith("- "):
            action_items.append(line[2:].strip())
        elif section == "participants" and line.startswith("- "):
            participants.append(line[2:].strip())

    return {
        "summary": " ".join(summary_lines).strip(),
        "action_items": action_items,
        "participants": participants,
    }


def analyse_text(meeting_content: str) -> Analysis:
    prompt: str = f"""
Analysiere das folgende Meeting-Protokoll und strukturiere die Antwort wie folgt:

ZUSAMMENFASSUNG:
[Kurze Zusammenfassung der wichtigsten Punkte]

ACTION ITEMS:
- [Aufgabe 1]
- [Aufgabe 2]

TEILNEHMER:
- [Person 1]
- [Person 2]

Meeting-Protokoll:
{meeting_content}
"""

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
    )

    response_text: str = str(response.text).strip()

    try:
        parsed_response: Analysis = parse_gemini_analysis(response_text)
    except Exception as e:
        raise ValueError(f"Error parsing response: {e}")

    return parsed_response
