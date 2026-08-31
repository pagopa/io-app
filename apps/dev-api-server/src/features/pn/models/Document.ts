export interface Document {
  availableFrom?: Date;
  availableUntil?: Date;
  category: DocumentCategory;
  contentLength: number; // byte
  contentType: string;
  filename: string;
  index: number;
  relativePath: string;
  sha256: string;
}

export type DocumentCategory = "DOCUMENT" | "F24" | "PAGOPA";
