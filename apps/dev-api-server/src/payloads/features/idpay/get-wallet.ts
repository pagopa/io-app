import { WalletDTO } from "@io-app/api-types/generated/definitions/idpay/WalletDTO";

import { initiatives } from "../../../persistence/idpay";

export const getWalletResponse = (): WalletDTO => ({
  initiativeList: Object.values(initiatives)
});
