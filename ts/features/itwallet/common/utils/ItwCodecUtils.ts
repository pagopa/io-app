/**
 * Copied from https://github.com/gcanti/io-ts-types/blob/master/src/JsonFromString.ts
 */

/**
 * @since 0.5.14
 */
import * as t from "io-ts";

/**
 * Copied from `fp-ts/Either` module.
 *
 * @since 0.5.14
 */
export type Json = boolean | number | string | null | JsonArray | JsonRecord;

/**
 * @since 0.5.14
 */
export interface JsonRecord {
  readonly [key: string]: Json;
}

/**
 * @since 0.5.14
 */
export type JsonArray = ReadonlyArray<Json>;

/**
 * @since 0.5.15
 */
export const JsonArray: t.Type<JsonArray> = t.recursion("JsonArray", () =>
  t.readonlyArray(Json)
);

/**
 * @since 0.5.15
 */
export const JsonRecord: t.Type<JsonRecord> = t.recursion("JsonRecord", () =>
  t.record(t.string, Json)
);

/**
 * @since 0.5.15
 */
export const Json: t.Type<Json> = t.union(
  [t.boolean, t.number, t.string, t.null, JsonArray, JsonRecord],
  "Json"
);

/**
 * @since 0.5.14
 */
export const JsonFromString = new t.Type<Json, string, string>(
  "JsonFromString",
  Json.is,
  (s, c) => {
    try {
      return t.success(JSON.parse(s));
    } catch (e) {
      return t.failure(s, c);
    }
  },
  json => JSON.stringify(json)
);
