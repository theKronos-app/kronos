import { createSignal, For, Show } from "solid-js";
import { format } from "date-fns";
import { Note } from "@/types/note";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MetadataEditorProps {
	metadata: Note["metadata"];
	onChange: (metadata: Note["metadata"]) => void;
	aiInsights?: string;
	type?: Note["type"];  // Optional type prop
}

export default function MetadataEditor(props: MetadataEditorProps) {
	const [tags, setTags] = createSignal(props.metadata?.properties?.tags || []);
	const [newTag, setNewTag] = createSignal("");
	const [properties, setProperties] = createSignal(
		props.metadata?.properties || {},
	);
	const [newPropertyKey, setNewPropertyKey] = createSignal("");
	const [newPropertyValue, setNewPropertyValue] = createSignal("");
	const [isAddingProperty, setIsAddingProperty] = createSignal(false);

	const addTag = () => {
		const tagValue = newTag().trim();
		if (tagValue && !tags().includes(tagValue)) {
			const updatedTags = [...tags(), tagValue];
			setTags(updatedTags);
			props.onChange({
				...props.metadata,
				properties: {
					...props.metadata.properties,
					tags: updatedTags,
				},
			});
			setNewTag("");
		}
	};

	const removeTag = (tagToRemove: string) => {
		const updatedTags = tags().filter((tag) => tag !== tagToRemove);
		setTags(updatedTags);
		props.onChange({
			...props.metadata,
			properties: {
				...props.metadata.properties,
				tags: updatedTags,
			},
		});
	};

	const addProperty = () => {
		const key = newPropertyKey().trim();
		const value = newPropertyValue().trim();
		if (key && value) {
			const updatedProperties = { ...properties(), [key]: value };
			setProperties(updatedProperties);
			props.onChange({
				...props.metadata,
				properties: updatedProperties,
			});
			setNewPropertyKey("");
			setNewPropertyValue("");
			setIsAddingProperty(false);
		}
	};

	const removeProperty = (key: string) => {
		const { [key]: _, ...rest } = properties();
		setProperties(rest);
		props.onChange({
			...props.metadata,
			properties: rest,
		});
	};

	return (
		<div class="space-y-4 text-sm">
			<Card class="bg-muted">
				<CardHeader class="p-3">
					<CardTitle class="text-sm font-medium flex items-center">
						<IconPhCalendar class="h-4 w-4 mr-2 text-muted-foreground" />
						Creation Date
					</CardTitle>
				</CardHeader>
				<CardContent class="p-3 pt-0">
					<span class="text-muted-foreground">
						{format(props.metadata?.created || new Date(), "PPP")}
					</span>
				</CardContent>
			</Card>

			<Card class="bg-muted">
				<CardHeader class="p-3">
					<CardTitle class="text-sm font-medium flex items-center">
						<IconPhTag class="h-4 w-4 mr-2 text-muted-foreground" />
						Tags
					</CardTitle>
				</CardHeader>
				<CardContent class="p-3 pt-0 space-y-2">
					<div class="flex flex-wrap gap-1">
						<For each={tags()}>
							{(tag) => (
								<Badge variant="secondary" class="text-xs px-2 py-0 h-6">
									{tag}
									<Button
										variant="ghost"
										size="sm"
										class="h-4 w-4 p-0 ml-1"
										onClick={() => removeTag(tag)}
									>
										<IconPhX class="h-3 w-3" />
									</Button>
								</Badge>
							)}
						</For>
					</div>
					<div class="flex">
						<Input
							placeholder="Add tag"
							value={newTag()}
							onInput={(e) => setNewTag(e.currentTarget.value)}
							onKeyDown={(e) => e.key === "Enter" && addTag()}
							class="h-7 text-xs mr-1"
						/>
						<Button
							size="sm"
							variant="outline"
							onClick={addTag}
							class="h-7 px-2"
						>
							<IconPhPlus class="h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card class="bg-muted">
				<CardHeader class="p-3">
					<CardTitle class="text-sm font-medium flex items-center justify-between">
						Properties
						<Button
							size="sm"
							variant="outline"
							onClick={() => setIsAddingProperty(true)}
							class="h-6 px-2"
						>
							<IconPhPlus class="h-3 w-3 mr-1" />
							Add
						</Button>
					</CardTitle>
				</CardHeader>
				<CardContent class="p-3 pt-0 space-y-2">
					<For each={Object.entries(properties())}>
						{([key, value]) => (
							<div class="flex justify-between items-center bg-background rounded-md p-2">
								<div>
									<span class="font-medium text-xs">{key}</span>
									<p class="text-xs text-muted-foreground">{value}</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									class="h-6 w-6 p-0"
									onClick={() => removeProperty(key)}
								>
									<IconPhX class="h-3 w-3" />
								</Button>
							</div>
						)}
					</For>
					<Show when={isAddingProperty()}>
						<div class="space-y-2">
							<Input
								placeholder="Key"
								value={newPropertyKey()}
								onInput={(e) => setNewPropertyKey(e.currentTarget.value)}
								class="h-7 text-xs"
							/>
							<Input
								placeholder="Value"
								value={newPropertyValue()}
								onInput={(e) => setNewPropertyValue(e.currentTarget.value)}
								class="h-7 text-xs"
							/>
							<div class="flex justify-end space-x-2">
								<Button
									size="sm"
									variant="ghost"
									onClick={() => setIsAddingProperty(false)}
									class="h-7 px-2"
								>
									Cancel
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={addProperty}
									class="h-7 px-2"
								>
									Add
								</Button>
							</div>
						</div>
					</Show>
				</CardContent>
			</Card>

			<Show when={props.aiInsights}>
				<Card class="bg-muted">
					<CardHeader class="p-3">
						<CardTitle class="text-sm font-medium flex items-center">
							<IconPhBrain class="h-4 w-4 mr-2 text-muted-foreground" />
							AI Insights
						</CardTitle>
					</CardHeader>
					<CardContent class="p-3 pt-0">
						<p class="text-xs text-muted-foreground">{props.aiInsights}</p>
					</CardContent>
				</Card>
			</Show>
		</div>
	);
}
