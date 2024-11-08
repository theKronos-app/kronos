import {
  $createTextNode,
  $getRoot,
  $getSelection,
  type EditorState,
  type LexicalEditor,
  $createParagraphNode,
} from "lexical";
import { LinkNode } from "@lexical/link";
import { AutoLinkNode } from "@lexical/link";
import { LinkPlugin } from "lexical-solid/LexicalLinkPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { HorizontalRuleNode } from "lexical-solid/LexicalHorizontalRuleNode";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { OnChangePlugin } from "lexical-solid/LexicalOnChangePlugin";
import { AutoFocusPlugin } from "lexical-solid/LexicalAutoFocusPlugin";
import { LexicalComposer } from "lexical-solid/LexicalComposer";
import { RichTextPlugin } from "lexical-solid/LexicalRichTextPlugin";
import { ContentEditable } from "lexical-solid/LexicalContentEditable";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import {
  LexicalMarkdownShortcutPlugin,
  DEFAULT_TRANSFORMERS,
} from "lexical-solid/LexicalMarkdownShortcutPlugin";
import { HistoryPlugin } from "lexical-solid/LexicalHistoryPlugin";
// import TreeViewPlugin from "../plugins/TreeViewPlugin";
// import CodeHighlightPlugin from "~/plugins/CodeHighlightPlugin";
// import ToolbarPlugin from "~/plugins/ToolbarPlugin";
// import RichTextTheme from "./RichTextTheme";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { LexicalErrorBoundary } from "lexical-solid/LexicalErrorBoundary";
import lexicalTheme from "./theme";
//import { EmojiNode } from "./nodes/EmojiNode";
//import EmoticonPlugin from "./plugins/EmoticonPlugin";

import { createSignal, onMount } from "solid-js";
import type { Note, NoteType } from "@/types/note";
import { readNote, updateNote } from "@/lib/file-system/notes";
import { toastService } from "../toast";

interface EditorProps {
  noteId: string;
  onSave?: (note: Note) => void;
  type?: NoteType;
}

function Placeholder() {
  return (
    <div class="pointer-events-none absolute left-[10px] top-[15px] select-none">
      What's on your mind?
    </div>
  );
}

const editorConfig = {
  theme: lexicalTheme,
  namespace: "",
  onError(error: any) {
    throw error;
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    HorizontalRuleNode,
  ] as any,
};

export default function Editor(props: EditorProps) {
  const [note, setNote] = createSignal<Note | null>(null);
  const [editor, setEditor] = createSignal<LexicalEditor | null>(null);

  // Create an initializer function
  const initializeEditor = (editorInstance: LexicalEditor, content: string) => {
    editorInstance.update(() => {
      const root = $getRoot();
      root.clear();
      if (content.trim()) {
        $convertFromMarkdownString(content, DEFAULT_TRANSFORMERS);
      } else {
        const paragraph = $createParagraphNode();
        const text = $createTextNode("");
        paragraph.append(text);
        root.append(paragraph);
      }
    });
  };

  function onChange(
    editorState: EditorState,
    _tags: Set<string>,
    editorInstance: LexicalEditor,
  ) {
    // Set editor instance on first change
    if (!editor()) {
      setEditor(editorInstance);
      // If we have content waiting to be initialized, do it now
      if (note()?.content) {
        initializeEditor(editorInstance, note()!.content);
      }
    }
    debouncedSave(editorState);
  }

  // Load initial content
  onMount(async () => {
    if (props.noteId) {
      try {
        const loadedNote = await readNote(props.noteId, props.type);
        setNote(loadedNote);
        
        // If editor is already available, initialize it
        const editorInstance = editor();
        if (editorInstance && loadedNote.content) {
          initializeEditor(editorInstance, loadedNote.content);
        }
      } catch (error) {
        console.error("Failed to load note:", error);
      }
    }
  });

  // Debounced save function
  const debouncedSave = debounce(async (editorState: EditorState) => {
    if (props.noteId) {
      try {
        let markdown = "";
        editorState.read(() => {
          markdown = $convertToMarkdownString(DEFAULT_TRANSFORMERS);
        });

        const updatedNote = await updateNote(props.noteId, markdown, props.type);
        setNote(updatedNote);
        props.onSave?.(updatedNote);
      } catch (error) {
        console.error("Failed to save note:", error);
      }
    }
  }, 300);

  return (
    // <div class="editor-container h-full w-full dark:bg-background dark:text-foreground">

    <div class="editor-container h-full w-full">
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          onError(error: any) {
            console.error("Lexical error:", error);
          },
        }}
      >
        <div class="my-5 h-full w-full border-none outline-none">
          <RichTextPlugin
            contentEditable={
              <ContentEditable class="h-screen w-full resize-none overflow-hidden text-ellipsis px-2.5 py-[15px] outline-none" />
            }
            placeholder={<Placeholder />}
            errorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={onChange} />
          <AutoFocusPlugin />
          <LinkPlugin />
          <HistoryPlugin delay={300} />
          <LexicalMarkdownShortcutPlugin transformers={DEFAULT_TRANSFORMERS} />
        </div>
      </LexicalComposer>
    </div>
  );
}

// Debounce utility function
function debounce(func: Function, wait: number) {
  let timeout: number | undefined;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
