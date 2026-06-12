import { decode as decodeJwt } from "@pagopa/io-react-native-jwt";
import {
  StatusListPayloadSchema,
  validatePayloadSub,
  type StatusListPayload
} from "./schemas";
import * as repository from "./repository";

/** Timeout for individual Status List Token fetches (ms). */
const FETCH_TIMEOUT_MS = 15_000;

/**
 * Fetches, decodes, validates, and persists a Status List Token for the given URI.
 * The URI serves both as cache identity and fetch endpoint (matches the JWT `sub` claim).
 *
 * Best-effort: returns `true` on success, `false` on any failure.
 * A failed refresh never evicts an existing cached entry.
 */
export const refreshStatusListToken = async (uri: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(uri, { signal: controller.signal }).finally(
      () => clearTimeout(timeout)
    );

    if (!response.ok) {
      return false;
    }

    const jwtText = await response.text();
    const { payload: rawPayload } = decodeJwt(jwtText);

    const parseResult = StatusListPayloadSchema.safeParse(rawPayload);
    if (!parseResult.success) {
      return false;
    }

    const payload: StatusListPayload = parseResult.data;

    if (!validatePayloadSub(payload, uri)) {
      return false;
    }

    await repository.upsert(uri, payload, Date.now());
    return true;
  } catch {
    return false;
  }
};
