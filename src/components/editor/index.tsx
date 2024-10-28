import {
	$getRoot,
	$getSelection,
	type EditorState,
	type LexicalEditor,
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
import type { Note } from "@/types/note";
import { readNote, updateNote } from "@/lib/file-system/notes";

interface EditorProps {
	noteId: string;
	onSave?: (note: Note) => void;
}

function Placeholder() {
	return (
		<div class="pointer-events-none absolute left-[10px] top-[15px] select-none">
			What's on your mind?
		</div>
	);
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

export default function Editor(props: EditorProps) {
	const [note, setNote] = createSignal<Note | null>(null);



	onMount(async () => {
		if (props.noteId) {
			try {
				const loadedNote = await readNote(props.noteId);
				setNote(loadedNote);
			} catch (error) {
				console.error("Failed to load note:", error);
			}
		}
	});

function onChange(
	editorState: EditorState,
	tags: Set<string>,
	editor: LexicalEditor,
) {
	editorState.read(async () => {
		const root = $getRoot();
		const content = root.getTextContent();
		
		if (note()) {
			try {
				const updatedNote = await updateNote(props.noteId, content);
				setNote(updatedNote);
				props.onSave?.(updatedNote);
			} catch (error) {
				console.error("Failed to save note:", error);
			}
		}
	});
}



	return (
		<div class="editor-container h-full w-full">
			<LexicalComposer initialConfig={{
				...editorConfig,
				editorState: note()?.content,
			}}>
				<div class="my-5 h-full w-full border-none outline-none">
					{/* <ToolbarPlugin /> */}
					<div class="relative">
						<RichTextPlugin
							contentEditable={
								<ContentEditable class="h-screen w-full resize-none overflow-hidden text-ellipsis   px-2.5 py-[15px] outline-none" />
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
