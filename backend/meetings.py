import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from queue import Queue, Empty
from threading import Thread
from time import sleep
from typing import Any
from datetime import datetime, timezone
import logging

from meeting_models import Analysis, Meeting, MeetingStatus
from gemeni import analyse_text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
cors = CORS(app)

# global dict as a way to store meetings
meetings_data: dict[str, Meeting] = {}

# qyeye to handle meeting analysis in the background
analyse_meeting_queue: Queue[str] = Queue()


def analyse_meeting_loop():
    """Background loop that processes meetings."""
    while True:
        try:
            meeting_uuid: str = analyse_meeting_queue.get_nowait()
            logger.info(f"Processing meeting {meeting_uuid}...")

            # check if meeting exists before and after processing (it might have been deleted)
            if meeting_uuid in meetings_data:
                meeting = meetings_data[meeting_uuid]

                try:
                    analysed_context: Analysis = analyse_text(meeting["content"])
                except Exception as e:
                    logger.error(f"Error analysing meeting {meeting_uuid}: {e}")
                    meeting["status"] = MeetingStatus.FAILED
                    continue

                if meeting_uuid not in meetings_data:
                    logger.warning(
                        f"Meeting {meeting_uuid} was deleted while processing."
                    )
                    continue

                meeting["analysis"] = analysed_context
                meeting["status"] = MeetingStatus.COMPLETED

                logger.info(f"Meeting {meeting_uuid} analysis completed.")
            else:
                logger.warning(f"Meeting {meeting_uuid} was deleted before processing.")
        except Empty:
            pass
        sleep(5)


Thread(target=analyse_meeting_loop, daemon=True).start()


@app.route("/meetings", methods=["POST"])
def add_meeting():
    if request.get_json() is None:
        return "Missing JSON body", 400
    data: dict[str, Any] = request.get_json()

    title = data.get("title")
    if not isinstance(title, str) or title.strip() == "":
        return "Missing or invalid title in provided JSON", 400

    content = data.get("content")
    if not isinstance(content, str) or content.strip() == "":
        return "Missing or invalid content in provided JSON", 400

    meeting_uuid: str = str(uuid.uuid4())
    current_time: str = datetime.now(timezone.utc).isoformat()

    meetings_data[meeting_uuid] = {
        "title": data["title"],
        "content": data["content"],
        "created_at": current_time,
        "status": MeetingStatus.PROCESSING,
    }

    analyse_meeting_queue.put_nowait(meeting_uuid)

    logger.info(f"Meeting {meeting_uuid} added for analysis.")

    return {
        "meeting_uuid": meeting_uuid,
        "title": data["title"],
        "status": MeetingStatus.PROCESSING,
    }, 201


@app.route("/meetings/<meeting_uuid>", methods=["GET"])
def get_meeting(meeting_uuid: str):
    """get specific meeting analysis"""
    try:
        if meeting_uuid not in meetings_data:
            return jsonify({"error": "Meeting not found"}), 404

        meeting: Meeting = meetings_data[meeting_uuid]

        return jsonify(meeting), 200

    except Exception as e:
        logger.error(f"Error retrieving meeting {meeting_uuid}: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/meetings", methods=["GET"])
def list_meetings():
    """list all meetings"""
    try:
        meetings_list = []

        for meeting_uuid, meeting in meetings_data.items():
            meeting_summary = {
                "id": meeting_uuid,
                "title": meeting["title"],
                "created_at": meeting["created_at"],
                "status": meeting["status"],
            }
            meetings_list.append(meeting_summary)

        # sort by timestamp
        meetings_list.sort(key=lambda x: x["created_at"], reverse=True)

        return jsonify({"meetings": meetings_list}), 200

    except Exception as e:
        logger.error(f"Error listing meetings: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/meetings/<meeting_uuid>", methods=["DELETE"])
def delete_meeting(meeting_uuid: str):
    """delete specific meeting"""
    try:
        if meeting_uuid not in meetings_data:
            return jsonify({"error": "Meeting not found"}), 404

        del meetings_data[meeting_uuid]

        return "", 204

    except Exception as e:
        logger.error(f"Error deleting meeting {meeting_uuid}: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
