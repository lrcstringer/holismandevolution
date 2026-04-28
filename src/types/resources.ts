export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  key: string;
  type: "pdf" | "doc" | "image" | "other";
  uploadedAt: string;
}

export interface Section {
  id: string;
  heading: string;
  resources: ResourceItem[];
}

export interface Manifest {
  sections: Section[];
}
