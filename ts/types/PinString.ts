import * as t from "io-ts";

import { PatternString } from "italia-ts-commons/lib/strings";
import { PIN_LENGTH } from "../utils/constants";

/**
 * A string that represents a PIN for locking/unlocking the app
 */

export const PIN_REGEX = `^[0-9]{${PIN_LENGTH}}$`;

export const PinString = PatternString(PIN_REGEX);
export type PinString = t.TypeOf<typeof PinString>;
