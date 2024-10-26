export interface Note {
  id: string;
  content: string;
  metadata: {
    created: Date;
    modified: Date;
    type: "daily" | "document";
    tags: string[];
    properties: {
      // Daily-specific
      mood?: string;
      // Document-specific
      status?: "active" | "archived";
    };
  };
  path: string;
}
