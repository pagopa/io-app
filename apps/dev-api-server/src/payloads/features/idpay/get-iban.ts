import { IbanDTO } from "@io-app/api-types/generated/definitions/idpay/IbanDTO";
import * as O from "fp-ts/lib/Option";

import { ibanList } from "../../../persistence/idpay";

export const getIbanResponse = (input: string): O.Option<IbanDTO> =>
  O.fromNullable(ibanList.find(({ iban }) => iban === input));
