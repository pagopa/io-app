import { Buffer } from "buffer";
import { useEffect, useMemo, useState } from "react";
import sha from "sha.js";

import { fetchTimeout } from "../../../../config";

const SHA256_INTEGRITY_PATTERN = /^sha-256-([a-f\d]{64})$/i;

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
    const expectedHash = integrity?.match(SHA256_INTEGRITY_PATTERN)?.[1];
    if (!uri || !expectedHash) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), fetchTimeout);
    void fetch(uri, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) {
          return;
        }
        const bytes = Buffer.from(await response.arrayBuffer());
        const hash = sha("sha256").update(bytes).digest("hex");
        if (!controller.signal.aborted && hash === expectedHash.toLowerCase()) {
          const contentType =
            response.headers.get("content-type") ?? "application/octet-stream";
          // Display the verified bytes directly, without another download.
          setVerifiedImage({
            source,
            uri: `data:${contentType};base64,${bytes.toString("base64")}`
          });
        }
      })
      .catch(() => undefined)
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [source, uri, integrity]);

  return verifiedImage?.source === source ? verifiedImage.uri : undefined;
};
