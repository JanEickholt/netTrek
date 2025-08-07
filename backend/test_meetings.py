import unittest
from unittest.mock import patch, MagicMock
import json
import uuid
from datetime import datetime, timezone

from meetings import app, meetings_data
from meeting_models import MeetingStatus
from gemeni import parse_gemini_analysis, analyse_text


class TestMeetingsAPI(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        meetings_data.clear()

    def test_add_meeting_success(self):
        data = {"title": "Test Meeting", "content": "Test content"}

        response = self.app.post(
            "/meetings", data=json.dumps(data), content_type="application/json"
        )

        self.assertEqual(response.status_code, 201)
        response_data = json.loads(response.data)
        self.assertIn("meeting_uuid", response_data)
        self.assertEqual(response_data["title"], "Test Meeting")
        self.assertEqual(response_data["status"], MeetingStatus.PROCESSING)

    def test_add_meeting_missing_json(self):
        response = self.app.post("/meetings")
        self.assertEqual(response.status_code, 415)

    def test_add_meeting_missing_title(self):
        data = {"content": "Test content"}

        response = self.app.post(
            "/meetings", data=json.dumps(data), content_type="application/json"
        )

        self.assertEqual(response.status_code, 400)

    def test_add_meeting_empty_title(self):
        data = {"title": "", "content": "Test content"}

        response = self.app.post(
            "/meetings", data=json.dumps(data), content_type="application/json"
        )

        self.assertEqual(response.status_code, 400)

    def test_add_meeting_missing_content(self):
        data = {"title": "Test Meeting"}

        response = self.app.post(
            "/meetings", data=json.dumps(data), content_type="application/json"
        )

        self.assertEqual(response.status_code, 400)

    def test_get_meeting_success(self):
        meeting_id = str(uuid.uuid4())
        meetings_data[meeting_id] = {
            "title": "Test Meeting",
            "content": "Test content",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": MeetingStatus.COMPLETED,
            "analysis": {
                "summary": "Test summary",
                "action_items": ["Action 1"],
                "participants": ["Person 1"],
            },
        }

        response = self.app.get(f"/meetings/{meeting_id}")

        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data["title"], "Test Meeting")

    def test_get_meeting_not_found(self):
        response = self.app.get("/meetings/nonexistent-id")
        self.assertEqual(response.status_code, 404)

    def test_list_meetings_empty(self):
        response = self.app.get("/meetings")

        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(response_data["meetings"], [])

    def test_list_meetings_with_data(self):
        meeting_id1 = str(uuid.uuid4())
        meeting_id2 = str(uuid.uuid4())

        meetings_data[meeting_id1] = {
            "title": "Meeting 1",
            "content": "Content 1",
            "created_at": "2024-01-01T10:00:00Z",
            "status": MeetingStatus.COMPLETED,
        }
        meetings_data[meeting_id2] = {
            "title": "Meeting 2",
            "content": "Content 2",
            "created_at": "2024-01-02T10:00:00Z",
            "status": MeetingStatus.PROCESSING,
        }

        response = self.app.get("/meetings")

        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.data)
        self.assertEqual(len(response_data["meetings"]), 2)
        self.assertEqual(response_data["meetings"][0]["title"], "Meeting 2")

    def test_delete_meeting_success(self):
        meeting_id = str(uuid.uuid4())
        meetings_data[meeting_id] = {
            "title": "Test Meeting",
            "content": "Test content",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": MeetingStatus.COMPLETED,
        }

        response = self.app.delete(f"/meetings/{meeting_id}")

        self.assertEqual(response.status_code, 204)
        self.assertNotIn(meeting_id, meetings_data)

    def test_delete_meeting_not_found(self):
        response = self.app.delete("/meetings/nonexistent-id")
        self.assertEqual(response.status_code, 404)


class TestGeminiAnalysis(unittest.TestCase):

    def test_parse_gemini_analysis_complete(self):
        text = """
ZUSAMMENFASSUNG:
Dies ist eine Testzusammenfassung des Meetings.

ACTION ITEMS:
- Erste Aufgabe
- Zweite Aufgabe
- Dritte Aufgabe

TEILNEHMER:
- Alice
- Bob
- Charlie

Meeting-Protokoll:
Hier beginnt das eigentliche Protokoll...
"""

        result = parse_gemini_analysis(text)

        self.assertEqual(
            result["summary"], "Dies ist eine Testzusammenfassung des Meetings."
        )
        self.assertEqual(len(result["action_items"]), 3)
        self.assertIn("Erste Aufgabe", result["action_items"])
        self.assertIn("Zweite Aufgabe", result["action_items"])
        self.assertIn("Dritte Aufgabe", result["action_items"])
        self.assertEqual(len(result["participants"]), 3)
        self.assertIn("Alice", result["participants"])
        self.assertIn("Bob", result["participants"])
        self.assertIn("Charlie", result["participants"])

    def test_parse_gemini_analysis_empty_sections(self):
        text = """
ZUSAMMENFASSUNG:

ACTION ITEMS:

TEILNEHMER:

Meeting-Protokoll:
"""

        result = parse_gemini_analysis(text)

        self.assertEqual(result["summary"], "")
        self.assertEqual(len(result["action_items"]), 0)
        self.assertEqual(len(result["participants"]), 0)

    def test_parse_gemini_analysis_partial(self):
        text = """
ZUSAMMENFASSUNG:
Nur eine Zusammenfassung vorhanden.

Meeting-Protokoll:
Rest des Protokolls...
"""

        result = parse_gemini_analysis(text)

        self.assertEqual(result["summary"], "Nur eine Zusammenfassung vorhanden.")
        self.assertEqual(len(result["action_items"]), 0)
        self.assertEqual(len(result["participants"]), 0)

    @patch("gemeni.client.models.generate_content")
    def test_analyse_text_success(self, mock_generate):
        mock_response = MagicMock()
        mock_response.text = """
ZUSAMMENFASSUNG:
Test summary

ACTION ITEMS:
- Test action

TEILNEHMER:
- Test participant

Meeting-Protokoll:
"""
        mock_generate.return_value = mock_response

        result = analyse_text("Test meeting content")

        self.assertEqual(result["summary"], "Test summary")
        self.assertEqual(len(result["action_items"]), 1)
        self.assertIn("Test action", result["action_items"])
        self.assertEqual(len(result["participants"]), 1)
        self.assertIn("Test participant", result["participants"])

    @patch("gemeni.client.models.generate_content")
    def test_analyse_text_parsing_error(self, mock_generate):
        mock_response = MagicMock()
        mock_response.text = "Invalid response format"
        mock_generate.return_value = mock_response

        with patch(
            "gemeni.parse_gemini_analysis", side_effect=Exception("Parse error")
        ):
            with self.assertRaises(ValueError):
                analyse_text("Test content")


if __name__ == "__main__":
    unittest.main(verbosity=2)
