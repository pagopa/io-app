export const withBase64Uri = (
  imageBase64: string,
  format: "png" | "jpg" = "png"
) => `data:image/${format};base64,${imageBase64}`;
