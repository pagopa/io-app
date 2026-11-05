import type { SerializedSnapshot } from "../types/messages";
import type { RawSnapshot } from "../utils/snapshot";

import { serializeValue } from "./value";

export const serializeSnapshot = (
  snapshot: RawSnapshot
): SerializedSnapshot | undefined =>
  snapshot === undefined
    ? undefined
    : (serializeValue({
        context: snapshot.context,
        status: snapshot.status,
        value: snapshot.value
      }) as SerializedSnapshot);
