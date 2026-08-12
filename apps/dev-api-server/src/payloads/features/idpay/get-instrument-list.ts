import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { InstrumentDTO } from "../../../../generated/definitions/idpay/InstrumentDTO";
import { InstrumentListDTO } from "../../../../generated/definitions/idpay/InstrumentListDTO";
import { instruments } from "../../../persistence/idpay";

export const getInstrumentListResponse = (
  initiativeId: string
): O.Option<InstrumentListDTO> =>
  pipe(
    instruments[initiativeId],
    O.fromNullable,
    O.alt(() => O.some([] as ReadonlyArray<InstrumentDTO>)),
    O.map(instrumentList => ({ instrumentList }))
  );
