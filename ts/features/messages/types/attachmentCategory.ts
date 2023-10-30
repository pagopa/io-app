export const ATTACHMENT_CATEGORY = {
  DOCUMENT: "DOCUMENT",
  F24: "F24"
} as const;

export type AttachmentCategory = keyof typeof ATTACHMENT_CATEGORY;
