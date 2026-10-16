import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { getIdPayError } from "../../../payloads/features/idpay/error";
import { getIDPayStaticCode } from "../../../persistence/idpay";
import { addIdPayHandler } from "./router";

addIdPayHandler(
  "get",
  "/payment/initiatives/:initiativeId/bar-code",
  (req, res) =>
    pipe(
      O.fromNullable(req.params.initiativeId),
      O.chain(getIDPayStaticCode),
      O.fold(
        () => res.status(404).json(getIdPayError(404)),
        staticCode => res.status(200).json(staticCode)
      )
    )
);
