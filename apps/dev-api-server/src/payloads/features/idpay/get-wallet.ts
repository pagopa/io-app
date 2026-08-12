import { WalletDTO } from "../../../../generated/definitions/idpay/WalletDTO";
import { initiatives } from "../../../persistence/idpay";

export const getWalletResponse = (): WalletDTO => ({
  initiativeList: Object.values(initiatives)
});
