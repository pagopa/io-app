import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { InitiativeDTO } from "../../../../generated/definitions/idpay/InitiativeDTO";
import { initiatives, instruments } from "../../../persistence/idpay";

export const getWalletDetailResponse = (
  initiativeId: string
): O.Option<InitiativeDTO> =>
  pipe(
    O.fromNullable<InitiativeDTO>(initiatives[initiativeId]),
    O.map(initiative => ({
      ...initiative,
      nInstr: instruments[initiativeId]?.length ?? 0
    }))
  );
