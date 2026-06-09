import * as t from "io-ts";

import { PatternString } from "@pagopa/ts-commons/lib/strings";

/**
 * A string that represents a municipality codice catastale
 * https://it.wikipedia.org/wiki/Codice_catastale
 */

const CODICE_CATASTALE_REGEX = `^[A-Z]\\d{3}$`;

export const CodiceCatastale = PatternString(CODICE_CATASTALE_REGEX);
export type CodiceCatastale = t.TypeOf<typeof CodiceCatastale>;
