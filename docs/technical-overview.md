
# Technical Overview

## Core Principles (Reiterated)

- **Zero Friction**: The journal should be effortless to use for capturing thoughts.
- **Local First**: User data remains on their device, ensuring privacy and control.
- **Simple > Complex**: Focus on essential features for the MVP, adding complexity thoughtfully.
- **Opinionated by Nature**: Guiding users towards a consistent and effective workflow.

### Architecture

Kronos is built with SolidStart and Tauri. The core of the application's data management is a local SQLite database.

### Database Schema

The SQLite database is structured with the following tables:

- **Notes**:
  - `id` (TEXT, PRIMARY KEY): A unique identifier for each note.
  - `content` (TEXT): The content of the note.
  - `created_at` (INTEGER): Timestamp of when the note was created.
  - `modified_at` (INTEGER): Timestamp of when the note was last modified.
  - `type` (TEXT): The type of note (e.g., "daily", "weekly", "document").
  - `tags` (TEXT): A comma-separated list of tags associated with the note.
  - `properties` (JSON): A JSON object containing additional properties, such as mood (for daily notes) or status (for documents).

- **Tasks** (Future):
  - id (TEXT, PRIMARY KEY)
  - title (TEXT, NOT NULL):  The description of the task.
  - notes (TEXT):  Additional details or context for the task.
  - is_done (INTEGER, NULLABLE)  Indicates if the task is completed (Timestap if done, otherwise null).
  - created_at (INTEGER): Timestamp of when the task was created.
  - done_at (INTEGER, NULLABLE): Timestamp of when the task was completed (only set if `is_done` is 1).
  - journal_date (TEXT, NOT NULL): The date (YYYY-MM-DD) of the journal entry this task is primarily associated with. This is KEY for your integration.
  - tags (TEXT): Comma-separated list of tags for categorizing tasks.
  - priority (INTEGER, DEFAULT 0):  A numerical value representing the priority of the task (e.g., 0 for low, 1 for medium, 2 for high). This enforces an opinionated way to prioritize.


- **Clear Separation**: Journal entries are for daily flow; notes are for focused content within a day.
- **Automatic Linking**: Notes are always linked to the day they are created or updated, providing inherent context.
- **AI as Guide, Not Autopilot**: The AI offers suggestions and insights, but doesn't make decisions or alter your content without your explicit action.
- **Centralized Journal**: The journal is the primary hub, with tasks and notes integrated for context.

## Future Vision (Beyond MVP)

- **Advanced Project Management**: Structuring and tracking larger projects, potentially linked to journal entries and tasks.
- **Calendar Integration**: Connecting with external calendars to provide the AI with a complete picture of your schedule.
- **Natural Language Linking**: Developing more sophisticated methods for automatically linking notes based on content, moving beyond just date-based connections.
- **Deeper AI Analysis**: More complex insights into personality, habits, and potential for growth.

