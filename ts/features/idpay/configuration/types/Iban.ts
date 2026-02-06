import { PatternString } from "@pagopa/ts-commons/lib/strings";
import * as t from "io-ts";

export type Iban = t.TypeOf<typeof Iban>;
export const Iban = PatternString("[a-zA-Z]{2}[0-9]{2}[a-zA-Z0-9]{1,30}");
