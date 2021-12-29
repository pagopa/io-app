// TODO: add additional content-type

export type ContentTypeEnum =
  | "image/png"
  | "image/svg"
  | "application/pdf"
  | "application/octet-stream";

// Ensure the Type for ContentTypeValues without losing the inferred types
function asContentTypeEnum<T extends { [key: string]: ContentTypeEnum }>(
  arg: T
): T {
  return arg;
}

export const ContentTypeValues = asContentTypeEnum({
  imagePng: "image/png",
  imageSvg: "image/svg",
  applicationPdf: "application/pdf",
  applicationOctetStream: "application/octet-stream"
});

export type ContentType = keyof typeof ContentTypeValues;
