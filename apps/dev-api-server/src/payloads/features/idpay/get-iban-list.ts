import { IbanListDTO } from "../../../../generated/definitions/idpay/IbanListDTO";
import { ibanList } from "../../../persistence/idpay";

export const getIbanListResponse = (): IbanListDTO => ({
  ibanList
});
