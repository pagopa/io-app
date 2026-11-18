export type IncomingShare = {
  kind: "image" | "pdf";
  mimeType: string;
  uri: string;
};

type SharedPayload = {
  mimeType?: string;
  shareType: string;
  value: string;
};

const isSupportedUri = (uri: string): boolean =>
  /^(?:file|content):\/\//i.test(uri);

export const parseIncomingShare = (
  payloads: ReadonlyArray<SharedPayload>
): IncomingShare | undefined => {
  if (payloads.length !== 1) {
    return undefined;
  }

  const [payload] = payloads;
  const mimeType = payload.mimeType?.toLowerCase();
  if (!mimeType || !isSupportedUri(payload.value)) {
    return undefined;
  }

  if (payload.shareType === "file" && mimeType === "application/pdf") {
    return { kind: "pdf", mimeType, uri: payload.value };
  }

  if (payload.shareType === "image" && mimeType.startsWith("image/")) {
    return { kind: "image", mimeType, uri: payload.value };
  }

  return undefined;
};

export const isIncomingShareUrl = (url: string): boolean =>
  /^(?:ioit|it\.pagopa\.app\.io(?:\.canary)?):\/\/expo-sharing(?:[/?#]|$)/i.test(
    url
  );
