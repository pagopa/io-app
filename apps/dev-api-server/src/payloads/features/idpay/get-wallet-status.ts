import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { WalletStatusDTO } from "../../../../generated/definitions/idpay/WalletStatusDTO";
import { initiatives } from "../../../persistence/idpay";

export const getWalletStatusResponse = (
  initiativeId: string
): O.Option<WalletStatusDTO> =>
  pipe(
    initiatives[initiativeId],
    O.fromNullable,
    O.map(({ status }) => ({ status }))
  );
