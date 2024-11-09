import { For, Show } from "solid-js";
import { Note } from "@/types/note";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";

interface MetadataEditorProps {
  metadata: Note["metadata"];
  onChange: (metadata: Note["metadata"]) => void;
}

export default function MetadataEditor(props: MetadataEditorProps) {
  // Ensure default values for metadata
  const metadata = () => ({
    created: props.metadata?.created || new Date(),
    modified: props.metadata?.modified || new Date(),
    type: props.metadata?.type || "document",
    tags: props.metadata?.tags || [],
    properties: props.metadata?.properties || {},
  });

  // Handler for updating mood (daily-specific property)
  const handleMoodChange = (mood: string) => {
    props.onChange({
      ...metadata(),
      properties: {
        ...metadata().properties,
        mood,
      },
    });
  };

  // Handler for updating tags
  const handleTagsChange = (tags: string[]) => {
    props.onChange({
      ...metadata(),
      tags,
    });
  };

  // Handler for removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    handleTagsChange(metadata().tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div class="space-y-4 border-b border-border p-4">
      {/* Tags Section */}
      <div class="flex flex-col space-y-2">
        <label class="text-sm font-medium">Tags</label>
        <div class="flex flex-wrap gap-2">
          <For each={metadata().tags}>
            {(tag) => (
              <Badge variant="secondary" class="gap-1">
                {tag}
                <Button
                  variant="ghost"
                  size="icon"
                  class="size-3 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <IconPhX class="size-3" />
                  <span class="sr-only">Remove {tag} tag</span>
                </Button>
              </Badge>
            )}
          </For>
          <input
            type="text"
            placeholder="Add tag..."
            class="bg-transparent px-2 text-sm outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = e.currentTarget.value.trim();
                if (value && !metadata().tags.includes(value)) {
                  handleTagsChange([...metadata().tags, value]);
                  e.currentTarget.value = "";
                }
              }
            }}
          />
        </div>
      </div>

      {/* Mood Section (only for daily entries) */}
      <Show when={metadata().type === "daily"}>
        <div class="flex flex-col space-y-2">
          <label class="text-sm font-medium">Mood</label>
          <Select
            value={metadata().properties.mood}
            onChange={handleMoodChange}
            options={["great", "good", "okay", "bad", "awful"]}
            placeholder="Select mood..."
            itemComponent={(props) => (
              <SelectItem item={props.item}>
                {props.item.rawValue.charAt(0).toUpperCase() +
                  props.item.rawValue.slice(1)}
              </SelectItem>
            )}
          >
            <SelectTrigger aria-label="Mood" class="w-32">
              <SelectValue<string>>
                {(state) =>
                  state.selectedOption()
                    ? state.selectedOption().charAt(0).toUpperCase() +
                      state.selectedOption().slice(1)
                    : "Select mood..."
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </div>
      </Show>
    </div>
  );
}
