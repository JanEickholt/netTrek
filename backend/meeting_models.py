from enum import Enum
from typing import TypedDict


class MeetingStatus(str, Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Analysis(TypedDict):
    summary: str
    action_items: list[str]
    participants: list[str]


class MeetingBase(TypedDict):
    title: str
    content: str
    created_at: str
    status: MeetingStatus


class Meeting(MeetingBase, total=False):
    analysis: Analysis | None
