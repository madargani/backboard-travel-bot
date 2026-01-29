## ADDED Requirements

### Requirement: Session Rename User Interface
The system SHALL provide an inline editing interface within the SessionList component that allows users to rename sessions.

#### Scenario: Display rename trigger
- **WHEN** the SessionList component renders a session item
- **THEN** an edit button (pencil icon or similar) is displayed next to or within the session title
- **THEN** the edit button is not visible by default but appears on hover (desktop) or is always visible for accessibility (mobile)

#### Scenario: Initiate rename mode
- **WHEN** the user clicks the edit button for a session
- **THEN** the session title is replaced with an input field containing the current title value
- **THEN** the input field is auto-focused
- **THEN** the session list enters "editing" state for that specific session
- **THEN** other session items remain in their normal display state

#### Scenario: Save rename on Enter key
- **WHEN** the user is editing a session title and presses the Enter key
- **THEN** the input field value is validated
- **THEN** if valid, a PATCH request is sent to `/api/sessions/[id]` with the new title
- **THEN** if successful, the input field is replaced with the new title text
- **THEN** the session list updates to show the new title
- **THEN** the editing state is exited

#### Scenario: Cancel rename on Escape key
- **WHEN** the user is editing a session title and presses the Escape key
- **THEN** the input field is replaced with the original title text
- **THEN** no API request is made
- **THEN** the editing state is exited

#### Scenario: Save rename on blur
- **WHEN** the user is editing a session title and clicks outside the input field or presses Tab
- **THEN** the input field value is validated
- **THEN** if valid, a PATCH request is sent to `/api/sessions/[id]` with the new title
- **THEN** if successful, the input field is replaced with the new title text
- **THEN** the session list updates to show the new title
- **THEN** the editing state is exited

#### Scenario: Display loading state during rename
- **WHEN** a PATCH request is in progress after the user submits a new title
- **THEN** the input field is disabled or shows a loading indicator
- **THEN** the user cannot make further edits until the request completes
- **THEN** the edit button is disabled

#### Scenario: Handle rename errors
- **WHEN** the PATCH request fails (validation error, network error, server error)
- **THEN** an error message is displayed to the user (e.g., "Failed to rename session", "Title is required")
- **THEN** the input field remains visible with the user's entered value
- **THEN** the user can correct the input and retry or cancel

#### Scenario: Update session list after successful rename
- **WHEN** a session is successfully renamed via the API
- **THEN** the session title is updated in the local session list state
- **THEN** the parent component's session data is updated to reflect the change
- **THEN** the mobile dropdown (if applicable) shows the new title

### Requirement: Title Input Validation
The frontend SHALL implement client-side validation for session title input.

#### Scenario: Validate empty title on submission
- **WHEN** the user attempts to save a session title that is empty
- **THEN** a validation error message is displayed ("Title is required")
- **THEN** no API request is sent

#### Scenario: Validate overly long title on submission
- **WHEN** the user attempts to save a session title exceeding 100 characters
- **THEN** a validation error message is displayed ("Title must be less than 100 characters")
- **THEN** no API request is sent

#### Scenario: Real-time validation feedback
- **WHEN** the user types a session title
- **THEN** character count display shows remaining characters (e.g., "47/100")
- **THEN** validation errors appear as the user types when limits are exceeded (optional enhancement)

### Requirement: Keyboard Accessibility for Rename
The rename interface SHALL be fully keyboard-accessible.

#### Scenario: Tab to edit button
- **WHEN** the user navigates with the Tab key
- **THEN** the edit button can receive focus
- **THEN** a visible focus indicator is displayed

#### Scenario: Enter to activate edit mode
- **WHEN** the edit button has focus and the user presses Enter
- **THEN** the rename mode is activated
- **THEN** focus moves to the input field

#### Scenario: Focus management during rename
- **WHEN** the rename mode is activated
- **THEN** focus moves to the input field
- **WHEN** the rename mode is cancelled or completed
- **THEN** focus returns to the session item or edit button

### Requirement: Mobile Responsive Rename UI
The rename interface SHALL work correctly on mobile devices.

#### Scenario: Mobile edit button visibility
- **WHEN** SessionList is viewed on a mobile viewport
- **THEN** the edit button is always visible (not hover-dependent)
- **THEN** the button is sized appropriately for touch interaction (minimum 44x44px)

#### Scenario: Touch editing on mobile
- **WHEN** the user taps the edit button on a mobile device
- **THEN** the input field appears with an on-screen keyboard
- **THEN** the UX remains functional without hover states

### Requirement: Session List State Management
The system SHALL manage editing state for sessions without affecting other sessions.

#### Scenario: Single session editing
- **WHEN** a user is editing one session title
- **THEN** only that specific session enters editing state
- **THEN** other session items remain unaffected
- **THEN** clicking the edit button on another session switches editing to that session

#### Scenario: Prevent concurrent edits
- **WHEN** a user is editing a session title
- **THEN** the edit buttons for other sessions are disabled or not clickable
- **THEN** the user can cancel or complete the current edit before editing another

### Requirement: Visual Feedback During Edit
The system SHALL provide clear visual feedback for the editing state.

#### Scenario: Editing state visual indicators
- **WHEN** a session is in editing mode
- **THEN** the input field is visually distinct from the title text
- **THEN** the session item has a different border or background color to indicate active state
- **THEN** buttons for save/cancel (if visible) are clearly labeled or use recognizable icons

#### Scenario: Transition animations (optional enhancement)
- **WHEN** switching between display and edit modes
- **THEN** smooth transitions are applied
- **THEN** the change is visually polished and feels responsive