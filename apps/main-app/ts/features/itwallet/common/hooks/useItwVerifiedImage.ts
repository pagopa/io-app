import { Buffer } from "buffer";
import { useEffect, useMemo, useState } from "react";
import sha from "sha.js";

import { fetchTimeout } from "../../../../config";

const SHA256_INTEGRITY_PATTERN = /^sha-256-([a-f\d]{64})$/i;

const fetchVerifiedImage = async (
  uri: string,
  expectedHash: string,
  signal: AbortSignal
): Promise<string | undefined> => {
  const response = await fetch(uri, { signal });
  if (!response.ok) {
    return;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const hash = sha("sha256").update(bytes).digest("hex");
  if (hash !== expectedHash.toLowerCase()) {
    return;
  }

  const contentType =
    response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ||
    "application/octet-stream";
  // Display the verified bytes directly, without another download.
  return `data:${contentType};base64,${bytes.toString("base64")}`;
};

export const useItwVerifiedImage = (
  uri: string | undefined,
  integrity: string | undefined
): string | undefined => {
  const source = useMemo(() => ({ uri, integrity }), [uri, integrity]);
  const [verifiedImage, setVerifiedImage] = useState<{
    source: typeof source;
    uri: string;
  }>();

  useEffect(() => {
    const expectedHash = source.integrity?.match(SHA256_INTEGRITY_PATTERN)?.[1];
    if (!source.uri || !expectedHash) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), fetchTimeout);
    void fetchVerifiedImage(source.uri, expectedHash, controller.signal)
      .then(verifiedUri => {
        if (!controller.signal.aborted && verifiedUri) {
          setVerifiedImage({ source, uri: verifiedUri });
        }
      })
      .catch(() => undefined)
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [source]);

  return verifiedImage?.source === source ? verifiedImage.uri : undefined;
};
