
# Overview 

The editor is the most important feature in kronos, while I wish to focus on more shiny features, ignoring the editor will lead to a subpar experience. To me building a good app means providing value to the user, building an amazing experience means focusing on the little details all the time.


## Principles of a Great Editor Experience

1. **Predictable Behavior:**
   - Users should always know what will happen when they press a key or perform an action
   - Example: Tab should always indent, Shift+Tab should always outdent
   - Consistent behavior across all formatting operations

2. **Immediate Feedback:**
   - Changes should be visible instantly with no perceptible delay
   - Visual feedback for actions (e.g., highlighting when a link is active)
   - Smooth animations for transitions

3. **Contextual Intelligence:**
   - The editor should understand the context of what the user is doing
   - Example: Auto-complete should suggest relevant tags based on document content
   - Smart formatting based on content type (e.g., code blocks vs prose)

4. **Minimal Cognitive Load:**
   - Common actions should require minimal effort
   - Keyboard shortcuts for frequent operations
   - Intuitive defaults that match user expectations

5. **Seamless Integration:**
   - Features should work together harmoniously
   - Example: Tags should integrate with search and filtering
   - Drawings should be embeddable and linkable

## Current State of the Editor 

### Core Setup:

- Uses Lexical as the base editor framework.
- Has a lexicalTheme (imported but not shown in the code)
- Uses a SQLite database for persistence

### Current Plugins:

- LinkPlugin: Handles link creation and management
- AutoFocusPlugin: Automatically focuses the editor on load
- HistoryPlugin: Provides undo/redo functionality with 300ms delay
- LexicalMarkdownShortcutPlugin: Enables markdown shortcuts with default transformers
- OnChangePlugin: Handles editor state changes with debounced saving

### Node Types Supported:

- Basic text nodes
- Headings (HeadingNode)
- Lists (ListNode, ListItemNode)
- Quotes (QuoteNode)
- Code blocks (CodeNode, CodeHighlightNode)
- Tables (TableNode, TableRowNode, TableCellNode)
- Links (AutoLinkNode, LinkNode)
- Horizontal rules (HorizontalRuleNode)

### Current Features:

- Markdown support (import/export)
- Auto-saving with 300ms debounce
- Basic text editing capabilities
- Placeholder text


## Editor Road Map 

### Core Plugins

- [x] **RichTextPlugin**: The main plugin that enables rich text editing capabilities. It provides a content editable area where users can input and format text.
- [ ] **PlainTextPlugin**: An alternative to RichTextPlugin for plain text editing, without rich text formatting options.
- [x] **HistoryPlugin**: Manages undo/redo functionality, allowing users to revert or reapply changes.
- [x] **AutoFocusPlugin**: Automatically focuses the editor when it loads, so users can start typing immediately.
- [ ] **ClearEditorPlugin**: Provides functionality to clear the editor's content.

### Formatting and Styling

- [x] **MarkdownShortcutPlugin**: Converts Markdown syntax into rich text formatting (e.g., typing **bold** converts to bold text).
- [ ] **CodeHighlightPlugin**: Adds syntax highlighting for code blocks.
- [x] **ListPlugin**: Enables bulleted and numbered lists.
- [ ] **CheckListPlugin**: Adds support for checklists (to-do lists).
- [x] **HorizontalRulePlugin**: Allows users to insert horizontal lines.
- [ ] **TabIndentationPlugin**: Enables indentation using the Tab key.
- [ ] **FloatingTextFormatToolbarPlugin**: Displays a floating toolbar for text formatting options (e.g., bold, italic, underline).

### Collaboration and Real-Time Editing

13. **CollaborationPlugin**: Enables real-time collaborative editing using WebSocket-based communication.
14. **CommentPlugin**: Allows users to add comments to the document, which can be useful for collaborative editing.

### Media and Embeds

15. **ImagesPlugin**: Enables users to insert and manage images in the editor.
16. **InlineImagePlugin**: Allows images to be inserted inline with text.
17. **AutoEmbedPlugin**: Automatically embeds content from supported URLs (e.g., YouTube videos, tweets).
18. **TwitterPlugin**: Specifically handles embedding tweets.
19. **YouTubePlugin**: Specifically handles embedding YouTube videos.
20. **FigmaPlugin**: Allows embedding Figma designs.

### Advanced Features

21. **TablePlugin**: Adds support for creating and editing tables.
22. **TableCellResizer**: Allows resizing table cells.
23. **TableCellActionMenuPlugin**: Provides actions for table cells (e.g., merge, split).
24. **TableHoverActionsPlugin**: Displays hover actions for tables (e.g., add row, add column).
25. **DraggableBlockPlugin**: Allows blocks of content (e.g., paragraphs, images) to be dragged and rearranged.
26. **CollapsiblePlugin**: Adds collapsible sections to the document.
27. **PageBreakPlugin**: Inserts page breaks into the document.
28. **LayoutPlugin**: Manages layout-related features (e.g., columns, grids).

### User Interaction and Accessibility

29. **ClickableLinkPlugin**: Makes links clickable within the editor.
30. **TabFocusPlugin**: Ensures that the Tab key navigates through focusable elements in the editor.
31. **ContextMenuPlugin**: Adds a context menu for additional actions (e.g., copy, paste).
32. **SpecialTextPlugin**: Enables special text highlighting (e.g., with brackets).

### Autocomplete and Suggestions

33. **AutocompletePlugin**: Provides autocomplete suggestions as users type.
34. **MentionsPlugin**: Allows users to mention other users (e.g., @username).
35. **HashtagPlugin**: Enables hashtag functionality (e.g., #topic).
36. **KeywordsPlugin**: Highlights specific keywords in the document.

### Speech and Input

37. **SpeechToTextPlugin**: Converts speech to text, allowing users to dictate content.

### Debugging and Development

38. **TreeViewPlugin**: Displays the editor's internal state as a tree structure, useful for debugging.
39. **TestRecorderPlugin**: Records user interactions for testing purposes.
40. **TypingPerfPlugin**: Measures typing performance.

### Customization and Extensibility

41. **ComponentPickerPlugin**: Allows users to pick and insert custom components.
42. **EmojiPickerPlugin**: Provides an emoji picker for inserting emojis.
43. **EmojisPlugin**: Automatically converts text into emojis (e.g., :) to 😊).
44. **ActionsPlugin**: Manages custom actions and behaviors (e.g., preserving new lines in Markdown).

## Implementation Plan

### Phase 1: Core Editing Experience

1. **Tab Indentation**
   - Implement TabIndentationPlugin
   - Handle both bullet lists and numbered lists
   - Support nested indentation levels

2. **Hashtag Integration**
   - Create HashtagPlugin
   - Sync tags with database
   - Add tag validation and normalization

3. **Autocomplete**
   - Build AutocompletePlugin
   - Integrate with HashtagPlugin
   - Suggest existing tags and common phrases

### Phase 2: Advanced Formatting

4. **Rich Text Formatting**
   - Add FloatingTextFormatToolbarPlugin
   - Support common formats (bold, italic, underline)
   - Implement keyboard shortcuts

5. **Code Blocks**
   - Enhance CodeHighlightPlugin
   - Add syntax highlighting for multiple languages
   - Implement code block formatting shortcuts

### Phase 3: Media and Embeds

6. **Images**
   - Build ImagesPlugin
   - Support drag-and-drop image upload
   - Add image resizing and alignment

7. **Drawings**
   - Create ExcalidrawPlugin
   - Integrate with link system
   - Support embedding in documents

### Phase 4: Collaboration Features

8. **Comments**
   - Implement CommentPlugin
   - Add thread management
   - Support @mentions

9. **Version History**
   - Build HistoryPlugin
   - Add version comparison
   - Support rollback to previous versions
