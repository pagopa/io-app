import { call, put } from "typed-redux-saga/macro";
import * as E from "fp-ts/lib/Either";
import { SagaCallReturnType } from "../../../../types/utils";
import { IDPayWalletClient } from "../api/client";
import { idPayWalletGet } from "../store/actions";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { WalletDTO } from "../../../../../definitions/idpay/wallet/WalletDTO";
import { StatusEnum } from "../../../../../definitions/idpay/wallet/InitiativeDTO";

const mockedData: WalletDTO = {
  initiativeList: [
    {
      initiativeId: "63492bace71cdb164d377853",
      initiativeName: "ANTONIO",
      status: StatusEnum.NOT_REFUNDABLE,
      endDate: new Date("2022-10-31T00:00:00"),
      available: 100,
      accrued: 0.0,
      refunded: 0.0,
      nInstr: "0"
    },
    {
      initiativeId: "6349320ba1bbcf7cb9d98f6c",
      initiativeName: "LUCE",
      status: StatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT,
      endDate: new Date("2022-10-29T00:00:00"),
      available: 10.0,
      accrued: 0.0,
      refunded: 0.0,
      nInstr: "1"
    },
    {
      initiativeId: "63495094a1bbcf7cb9d98f6d",
      initiativeName: "Stefano",
      status: StatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT,
      endDate: new Date("2022-10-31T00:00:00"),
      available: 10,
      accrued: 0.0,
      refunded: 0.0,
      nInstr: "2"
    },
    {
      initiativeId: "6364fce370fc881452fdaa2c",
      initiativeName: "BonusIO Test Criteri manuali",
      status: StatusEnum.NOT_REFUNDABLE,
      endDate: new Date("2022-12-31T00:00:00"),
      available: 10.0,
      accrued: 0.0,
      refunded: 0.0,
      nInstr: "0"
    }
  ]
};

/**
 * Handle the remote call to retrieve the IDPay wallet
 * @param getWallet
 * @param action
 */
export function* handleGetIDPayWallet(
  getWallet: IDPayWalletClient["getWallet"]
) {
  yield* put(idPayWalletGet.success(mockedData));
  return;

  try {
    const getWalletResult: SagaCallReturnType<typeof getWallet> = yield* call(
      getWallet,
      {}
    );

    if (E.isRight(getWalletResult)) {
      if (getWalletResult.right.status === 200) {
        // handled success
        yield* put(idPayWalletGet.success(getWalletResult.right.value));
        return;
      }
      // not handled error codes
      yield* put(
        idPayWalletGet.failure({
          ...getGenericError(
            new Error(`response status code ${getWalletResult.right.status}`)
          )
        })
      );
    } else {
      // cannot decode response
      yield* put(
        idPayWalletGet.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getWalletResult.left))
          )
        })
      );
    }
  } catch (e) {
    yield* put(idPayWalletGet.failure({ ...getNetworkError(e) }));
  }
}
