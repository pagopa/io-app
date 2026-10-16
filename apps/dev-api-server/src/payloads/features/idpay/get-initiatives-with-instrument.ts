import {
  InitiativesStatusDTO,
  StatusEnum as InitiativeStatusEnum
} from "@io-app/api-types/generated/definitions/idpay/InitiativesStatusDTO";
import { InitiativesWithInstrumentDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativesWithInstrumentDTO";
import { EnableableFunctionsEnum } from "@io-app/api-types/generated/definitions/pagopa/EnableableFunctions";
import { WalletV2 } from "@io-app/api-types/generated/definitions/pagopa/WalletV2";
import { CardInfo } from "@io-app/api-types/generated/definitions/pagopa/walletv2/CardInfo";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { initiatives, instruments } from "../../../persistence/idpay";
import { getWalletV2 } from "../../../routers/walletsV2";

const initiativesStatusByWalletId = (
  idWallet: string
): ReadonlyArray<InitiativesStatusDTO> =>
  Object.entries(initiatives).reduce((acc, [id]) => {
    const initiativeInstruments = instruments[id] || [];

    const instrument = initiativeInstruments.find(
      instrument => instrument.idWallet === idWallet
    );

    const status: InitiativesStatusDTO = {
      initiativeId: id,
      initiativeName: initiatives[id].initiativeName || "",
      status: instrument?.status || InitiativeStatusEnum.INACTIVE,
      idInstrument: instrument?.instrumentId
    };

    return [...acc, status];
  }, [] as ReadonlyArray<InitiativesStatusDTO>);

const getWalletById = (id: number): O.Option<WalletV2> =>
  O.fromNullable(
    getWalletV2().find(
      w =>
        w.idWallet === id &&
        w.enableableFunctions?.includes(EnableableFunctionsEnum.BPD)
    )
  );

export const getInitiativeWithInstrumentResponse = (
  idWallet: string
): O.Option<InitiativesWithInstrumentDTO> =>
  pipe(
    idWallet,
    O.some,
    O.map(parseInt),
    O.chain(getWalletById),
    O.chain(wallet =>
      pipe(
        idWallet,
        O.some,
        O.map(initiativesStatusByWalletId),
        O.map(initiativeList => {
          const info = wallet.info as CardInfo;
          return {
            idWallet,
            maskedPan: info.blurredNumber || "",
            brand: info.brand || "",
            initiativeList
          };
        })
      )
    )
  );
