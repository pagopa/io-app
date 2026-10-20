import { IbanPutDTO } from "@io-app/api-types/generated/definitions/idpay/IbanPutDTO";
import { StatusEnum as InitiativeStatusEnum } from "@io-app/api-types/generated/definitions/idpay/InitiativeDTO";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { getIdPayError } from "../../../payloads/features/idpay/error";
import { getInitiativeBeneficiaryDetailResponse } from "../../../payloads/features/idpay/get-initiative-beneficiary-detail";
import { getInitiativeWithInstrumentResponse } from "../../../payloads/features/idpay/get-initiatives-with-instrument";
import { getInstrumentListResponse } from "../../../payloads/features/idpay/get-instrument-list";
import { getWalletResponse } from "../../../payloads/features/idpay/get-wallet";
import { getWalletDetailResponse } from "../../../payloads/features/idpay/get-wallet-detail";
import { getWalletStatusResponse } from "../../../payloads/features/idpay/get-wallet-status";
import {
  deleteInstrumentFromInitiative,
  enrollCodeToInitiative,
  enrollInstrumentToInitiative,
  generateIdPayCode,
  idPayCode,
  initiatives,
  storeIban,
  updateInitiative
} from "../../../persistence/idpay";
import { getWalletV2 } from "../../walletsV2";
import { addIdPayHandler } from "./router";

const getWalletInstrument = (id: string) =>
  pipe(
    id,
    O.some,
    O.map(id => parseInt(id, 10)),
    O.chain(id => O.fromNullable(getWalletV2().find(w => w.idWallet === id)))
  );

/** Returns the list of active initiatives of a citizen */
addIdPayHandler("get", "/wallet/", (req, res) =>
  res.status(200).json(getWalletResponse())
);

/** Get code onboarding status */
addIdPayHandler("get", "/wallet/code/status", (req, res) =>
  res.status(200).json({ isIdPayCodeEnabled: idPayCode !== undefined })
);

/** Generates a new IdPay code and (optionially) enrolls it to an initiative */
addIdPayHandler("post", "/wallet/code/generate", (req, res) => {
  if (req.body.initiativeId) {
    return pipe(
      req.body.initiativeId,
      O.fromNullable,
      O.chain(getWalletDetailResponse),
      O.fold(
        () => res.status(404).json(getIdPayError(404)),
        ({ initiativeId }) => {
          generateIdPayCode();
          const result = enrollCodeToInitiative(initiativeId);
          return res
            .status(result ? 200 : 403)
            .json(result ? { idpayCode: idPayCode } : undefined);
        }
      )
    );
  }

  generateIdPayCode();

  return res.status(200).json({ idpayCode: idPayCode });
});

/** Returns the initiatives list associated to a payment instrument */
addIdPayHandler("get", "/wallet/instrument/:walletId/initiatives", (req, res) =>
  pipe(
    req.params.walletId,
    O.fromNullable,
    O.chain(getInitiativeWithInstrumentResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      data => res.status(200).json(data)
    )
  )
);

/** Returns the detail of an active initiative of a citizen */
addIdPayHandler("get", "/wallet/:initiativeId", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(getWalletDetailResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiative => res.status(200).json(initiative)
    )
  )
);

/** Returns the detail of an initiative */
addIdPayHandler("get", "/wallet/:initiativeId/detail", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(getInitiativeBeneficiaryDetailResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      initiative => res.status(200).json(initiative)
    )
  )
);

/** Returns the actual wallet status */
addIdPayHandler("get", "/wallet/:initiativeId/status", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(getWalletStatusResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      status => res.status(200).json(status)
    )
  )
);

/** Unsubscribe to an initiative */
addIdPayHandler("delete", "/wallet/:initiativeId/unsubscribe", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(getWalletDetailResponse),
    O.map(({ initiativeId }) => initiatives[initiativeId]),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      flow(
        O.of,
        O.filter(
          initiative => initiative.status !== InitiativeStatusEnum.UNSUBSCRIBED
        ),
        O.fold(
          () => res.status(403).json(getIdPayError(403)),
          initiative => {
            updateInitiative({
              ...initiative,
              status: InitiativeStatusEnum.UNSUBSCRIBED
            });
            return res.sendStatus(204);
          }
        )
      )
    )
  )
);

/** Association of an IBAN to an initiative */
addIdPayHandler("put", "/wallet/:initiativeId/iban", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(getWalletDetailResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      ({ initiativeId }) =>
        pipe(
          IbanPutDTO.decode(req.body),
          O.fromEither,
          O.fold(
            () => res.status(400).json(getIdPayError(400)),
            ({ iban, description }) => {
              updateInitiative({ ...initiatives[initiativeId], iban });
              storeIban(iban, description);
              return res.sendStatus(200);
            }
          )
        )
    )
  )
);

/**
 * Returns the list of payment instruments associated to the initiative by the
 * citizen
 */
addIdPayHandler("get", "/wallet/:initiativeId/instruments", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(getWalletDetailResponse),
    O.map(({ initiativeId }) => initiativeId),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      flow(
        getInstrumentListResponse,
        O.fold(
          () => res.status(200).json({ instrumentList: [] }),
          data => res.status(200).json(data)
        )
      )
    )
  )
);

/** Enroll code to an initiative */
addIdPayHandler("put", "/wallet/:initiativeId/code/instruments", (req, res) =>
  pipe(
    req.params.initiativeId,
    O.fromNullable,
    O.chain(getWalletDetailResponse),
    O.fold(
      () => res.status(404).json(getIdPayError(404)),
      ({ initiativeId }) => {
        const result = enrollCodeToInitiative(initiativeId);
        return res.sendStatus(result ? 200 : 403);
      }
    )
  )
);

/** Association of a payment instrument to an initiative */
addIdPayHandler(
  "put",
  "/wallet/:initiativeId/instruments/by-wallet/:walletId",
  (req, res) =>
    pipe(
      req.params.initiativeId,
      O.fromNullable,
      O.chain(getWalletDetailResponse),
      O.fold(
        () => res.status(404).json(getIdPayError(404)),
        ({ initiativeId }) =>
          pipe(
            req.params.walletId,
            O.fromNullable,
            O.chain(getWalletInstrument),
            O.fold(
              () => res.status(404).json(getIdPayError(404)),
              wallet => {
                const result = enrollInstrumentToInitiative(
                  initiativeId,
                  wallet
                );
                return res.sendStatus(result ? 200 : 403);
              }
            )
          )
      )
    )
);

/** Delete a payment instrument from an initiative */
addIdPayHandler(
  "delete",
  "/wallet/:initiativeId/instruments/:instrumentId",
  (req, res) =>
    pipe(
      req.params.initiativeId,
      O.fromNullable,
      O.chain(getWalletDetailResponse),
      O.fold(
        () => res.status(404).json(getIdPayError(404)),
        ({ initiativeId }) =>
          pipe(
            req.params.instrumentId,
            O.fromNullable,
            O.fold(
              () => res.status(400).json(getIdPayError(400)),
              instrumentId => {
                const result = deleteInstrumentFromInitiative(
                  initiativeId,
                  instrumentId
                );
                return res.sendStatus(result ? 200 : 403);
              }
            )
          )
      )
    )
);
