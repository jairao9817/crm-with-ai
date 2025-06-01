# Communication Notes Feature

## Overview

The Communication Notes feature allows users to add notes for user replies and other important information related to communications. This feature helps track follow-ups, important details, and context around customer interactions.

## Features

### Note Types

- **User Reply**: Notes about user responses to communications
- **Follow Up**: Notes about follow-up actions needed
- **General Note**: General notes about the communication
- **Important**: Important or urgent notes that need attention

### Functionality

- **Add Notes**: Create new notes for any communication
- **Edit Notes**: Update existing note content and type
- **Delete Notes**: Remove notes that are no longer needed
- **View Notes**: All notes are displayed chronologically under each communication

## Usage

### Adding a Note

1. Navigate to a communication detail page
2. Scroll down to the "Communication Notes" section
3. Click the "Add Note" button
4. Select the note type (defaults to "User Reply")
5. Enter your note content
6. Click "Add Note" to save

### Managing Notes

- **Edit**: Click the three-dot menu on any note and select "Edit Note"
- **Delete**: Click the three-dot menu on any note and select "Delete Note"
- **View**: All notes are automatically displayed with timestamps and type indicators

## Installation

1. Run the migration script in your Supabase SQL editor:

   ```bash
   # Copy and run the contents of scripts/migrate-communication-notes.sql
   ```

2. The feature will be automatically available in the communication detail pages.

## Database Schema

The feature adds a new `communication_notes` table with the following structure:

- `id`: Unique identifier
- `communication_id`: Reference to the communication
- `note_content`: The note text content
- `note_type`: Type of note (reply, follow_up, general, important)
- `created_by`: User who created the note
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Security

- Row Level Security (RLS) is enabled
- Users can only view, create, edit, and delete their own notes
- Notes are automatically associated with the authenticated user

## UI/UX

- Notes are displayed in a dedicated card below the communication content
- Each note shows note type with colored chip and icon, content, and timestamp
- Empty state encourages users to add their first note
- Intuitive modals for adding and editing notes
