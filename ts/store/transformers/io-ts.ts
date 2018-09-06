import { isLeft } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { createTransform, PersistConfig } from "redux-persist";

/**
 * Returns a redux-persist transformer for serializing/deserializing
 * an io-ts type.
 *
 * @see https://github.com/rt2zz/redux-persist#transforms
 */
export function createIoTsTransform<A, O = A, I = t.mixed>(
  type: t.Type<A, O, I>,
  config?: Pick<PersistConfig, "whitelist" | "blacklist">
) {
  return createTransform<A, I>(
    (state, _) => type.encode(state) as any,
    (raw, _) => {
      const decoded = type.decode(raw);
      if (isLeft(decoded)) {
        throw new Error(JSON.stringify(decoded.value));
      }
      return decoded.value;
    },
    config
  );
}
