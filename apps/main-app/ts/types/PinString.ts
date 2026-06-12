import * as t from "io-ts";

import { PatternString } from "@pagopa/ts-commons/lib/strings";
import { PIN_LENGTH, PIN_LENGTH_SIX } from "../utils/constants";

/**
 * A string that represents a unlock code for locking/unlocking the app
 */

const PIN_REGEX = `^[0-9]{${PIN_LENGTH},${PIN_LENGTH_SIX}}$`;

export const PinString = PatternString(PIN_REGEX);
export type PinString = t.TypeOf<typeof PinString>;
