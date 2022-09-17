// TODO: Remove this when ts-commons is updated because it's already defined there

import * as t from "io-ts";

/**
 * Create a decoder that parses a string containing a list of comma-separated elements into an array of typed items, using the provided decoder
 *
 * @param decoder a io-ts decoder
 *
 * @returns either a decode error or the array of decoded items
 */
export const CommaSeparatedListOf = (decoder: t.Mixed) =>
  new t.Type<ReadonlyArray<t.TypeOf<typeof decoder>>, string, unknown>(
    `CommaSeparatedListOf<${decoder.name}>`,
    (value: unknown): value is ReadonlyArray<t.TypeOf<typeof decoder>> =>
      Array.isArray(value) && value.every(e => decoder.is(e)),
    input =>
      t.readonlyArray(decoder).decode(
        typeof input === "string"
          ? input
              .split(",")
              .map(e => e.trim())
              .filter(Boolean)
          : input // it should not happen, but in case we let the decoder fail
      ),
    String
  );