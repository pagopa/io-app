import { IbanListDTO } from "@io-app/api-types/generated/definitions/idpay/IbanListDTO";

import { ibanList } from "../../../persistence/idpay";

export const getIbanListResponse = (): IbanListDTO => ({
  ibanList
});
