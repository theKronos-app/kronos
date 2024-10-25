import { $getRoot, $getSelection, EditorState, LexicalEditor } from "lexical";
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

function Placeholder() {
  return (
    <div class="pointer-events-none absolute left-[10px] top-[15px] select-none">
      Enter some plain text...
    </div>
  );
}

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(
  editorState: EditorState,
  tags: Set<string>,
  editor: LexicalEditor,
) {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();
  });
}

const editorConfig = {
  // The editor theme
  theme: lexicalTheme,
  namespace: "",
  // Handling of errors during update
  onError(error: any) {
    throw error;
  },
  // Any custom nodes go here
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

export default function Editor() {
  return (
    <div class="editor-container h-full w-full">
      <LexicalComposer initialConfig={editorConfig}>
        <div class="my-5 h-full w-full border-none outline-none">
          {/* <ToolbarPlugin /> */}
          <div class="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable class="h-screen w-full resize-none overflow-hidden text-ellipsis  border-2 border-black px-2.5 py-[15px] outline-none" />
              }
              placeholder={<Placeholder />}
              errorBoundary={LexicalErrorBoundary}
            />
            <LinkPlugin />
            <AutoFocusPlugin />
            <OnChangePlugin onChange={onChange} />
            {/* <HistoryPlugin /> */}
            {/* <TreeViewPlugin /> */}
            <AutoFocusPlugin />
            {/* <CodeHighlightPlugin /> */}
            <LexicalMarkdownShortcutPlugin
              transformers={DEFAULT_TRANSFORMERS}
            />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
