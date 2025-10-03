import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { GlobalState } from "../../../../../store/reducers/types";
import { thirdPartyFromIdSelector } from "../../../../messages/store/reducers/thirdPartyById";
import { toPNMessage } from "../../../store/types/transformers";
export const thirdPartySenderDenominationSelector = (
  state: GlobalState,
  ioMessageId: string
) =>
  pipe(
    thirdPartyFromIdSelector(state, ioMessageId),
    pot.toOption,
    O.flatMap(toPNMessage),
    O.map(data => data.senderDenomination),
    O.toUndefined
  );
