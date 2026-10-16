import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { IDPayInitiativeID, IDPayServiceID } from "./types";

const NUMBER_PATTERN = /\d+/;

const TEST_SERVICE_PREFIX = "TESTSRV";
const TEST_INITIATIVE_PREFIX = "TESTINIT";

export const serviceIdToString = (id: number): string =>
  `${TEST_SERVICE_PREFIX}${String(id).padStart(2, "0")}`;

export const initiativeIdToString = (id: number): string =>
  `${TEST_INITIATIVE_PREFIX}${String(id).padStart(2, "0")}`;

export const serviceIdFromString = (input: string): O.Option<IDPayServiceID> =>
  pipe(
    input.match(
      new RegExp(`^${TEST_SERVICE_PREFIX}(${NUMBER_PATTERN.source})$`)
    ),
    O.fromNullable,
    O.map(match => parseInt(match[1], 10))
  );

export const initiativeIdFromString = (
  input: string
): O.Option<IDPayInitiativeID> =>
  pipe(
    input.match(
      new RegExp(`^${TEST_INITIATIVE_PREFIX}(${NUMBER_PATTERN.source})$`)
    ),
    O.fromNullable,
    O.map(match => parseInt(match[1], 10))
  );
