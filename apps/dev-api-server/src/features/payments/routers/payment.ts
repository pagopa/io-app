import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { CalculateFeeRequest } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/CalculateFeeRequest";
import { FaultCategoryEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/FaultCategory";
import { GuestMethodLastUsageTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/GuestMethodLastUsageType";
import { NewTransactionRequest } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/NewTransactionRequest";
import { RedirectUrlResponse } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/RedirectUrlResponse";
import { RequestAuthorizationRequest } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/RequestAuthorizationRequest";
import { RequestAuthorizationResponse } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/RequestAuthorizationResponse";
import { RptId } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/RptId";
import { WalletDetailTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/WalletDetailType";
import { WalletLastUsageTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/WalletLastUsageType";
import { sequenceS } from "fp-ts/lib/Apply";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ulid } from "ulid";

import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { PaymentsDatabase } from "../../../persistence/payments";
import { fold } from "../../../types/PaymentStatus";
import { serverUrl } from "../../../utils/server";
import { getPaymentRequestsGetResponse } from "../payloads/payments";
import {
  getCalculateFeeResponsePayload,
  getNewTransactionResponsePayload,
  getTransactionInfoPayload
} from "../payloads/transactions";
import NoticesDB from "../persistence/notices";
import WalletDB from "../persistence/userWallet";
import {
  getStatusCodeForWalletFailure,
  httpStatusCodeFromDetailV2Enum,
  payloadFromDetailV2Enum,
  WalletPaymentFailure
} from "../types/failure";
import {
  generateOnboardablePaymentMethods,
  generateOnboardingWalletData
} from "../utils/onboarding";
import { WALLET_PAYMENT_PATH } from "../utils/payment";
import { addPaymentHandler } from "./router";

// eslint-disable-next-line functional/no-let
let latestPaymentRequestId: string | undefined;

// Verify single payment notices
addPaymentHandler("get", "/payment-requests/:rpt_id", (req, res) =>
  pipe(
    RptId.decode(req.params.rpt_id),
    O.fromEither,
    O.fold(
      () => res.sendStatus(400),
      rptId =>
        pipe(
          ioDevServerConfig.features.wallet?.verificationFailure,
          WalletPaymentFailure.decode,
          O.fromEither,
          O.fold(
            () =>
              pipe(
                rptId,
                PaymentsDatabase.getPaymentStatus,
                O.fold(
                  () =>
                    pipe(
                      rptId,
                      getPaymentRequestsGetResponse,
                      O.fold(
                        () =>
                          res.status(404).json({
                            faultCodeCategory:
                              FaultCategoryEnum.PAYMENT_UNKNOWN,
                            faultCodeDetail: ""
                          }),
                        response => res.status(200).json(response)
                      )
                    ),
                  fold(
                    processedPayment =>
                      res
                        .status(
                          httpStatusCodeFromDetailV2Enum(
                            processedPayment.status.detail_v2
                          )
                        )
                        .json(
                          payloadFromDetailV2Enum(
                            processedPayment.status.detail_v2
                          )
                        ),
                    ({ data }) => {
                      latestPaymentRequestId = rptId;
                      return res.status(200).send(data);
                    }
                  )
                )
              ),
            failure =>
              res.status(getStatusCodeForWalletFailure(failure)).json(failure)
          )
        )
    )
  )
);

// Create new transaction
addPaymentHandler("post", "/transactions", (req, res) =>
  pipe(
    NewTransactionRequest.decode(req.body),
    O.fromEither,
    O.fold(
      () => res.sendStatus(400),
      ({ paymentNotices }) =>
        pipe(
          ioDevServerConfig.features.wallet?.activationFailure,
          WalletPaymentFailure.decode,
          O.fromEither,
          O.fold(
            () =>
              pipe(
                paymentNotices,
                getNewTransactionResponsePayload,
                O.fold(
                  () => res.sendStatus(404),
                  transaction => res.status(200).json(transaction)
                )
              ),
            failure =>
              res.status(getStatusCodeForWalletFailure(failure)).json(failure)
          )
        )
    )
  )
);

// Get transaction information
addPaymentHandler("get", "/transactions/:transactionId", (req, res) =>
  pipe(
    req.params.transactionId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(400),
      flow(
        getTransactionInfoPayload,
        O.fold(
          () => res.sendStatus(404),
          transaction => res.status(200).json(transaction)
        )
      )
    )
  )
);

// Performs the transaction cancellation
addPaymentHandler("delete", "/transactions/:transactionId", (req, res) =>
  pipe(
    req.params.transactionId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(400),
      () => res.sendStatus(200)
    )
  )
);

// Calculatefees for given wallet id and amount
addPaymentHandler("post", "/payment-methods/:paymentId/fees", (req, res) =>
  pipe(
    sequenceS(O.Monad)({
      calculateFeeRequest: pipe(
        CalculateFeeRequest.decode(req.body),
        O.fromEither
      ),
      paymentId: O.fromNullable(req.params.paymentId)
    }),
    O.fold(
      () => res.sendStatus(400),
      ({ calculateFeeRequest }) =>
        pipe(
          getCalculateFeeResponsePayload(
            calculateFeeRequest.walletId,
            calculateFeeRequest.paymentAmount,
            calculateFeeRequest.idPspList
          ),
          O.fold(
            () => res.sendStatus(404),
            fees => res.status(200).json(fees)
          )
        )
    )
  )
);

// Create a new request authorization given a transaction
addPaymentHandler(
  "post",
  "/transactions/:transactionId/auth-requests",
  (req, res) =>
    pipe(
      sequenceS(O.Monad)({
        requestAuthorization: pipe(
          RequestAuthorizationRequest.decode(req.body),
          O.fromEither
        ),
        transactionId: O.fromNullable(req.params.transactionId)
      }),
      O.fold(
        () => res.sendStatus(403),
        ({ transactionId, requestAuthorization }) =>
          pipe(
            getTransactionInfoPayload(transactionId),
            O.fold(
              () => res.sendStatus(404),
              () => {
                const usedPaymentMethodType =
                  requestAuthorization.details.detailType ===
                  WalletDetailTypeEnum.wallet
                    ? WalletLastUsageTypeEnum.wallet
                    : GuestMethodLastUsageTypeEnum.guest;
                const usedPaymentMethodId =
                  requestAuthorization.details.detailType ===
                  WalletDetailTypeEnum.wallet
                    ? requestAuthorization.details.walletId
                    : requestAuthorization.details.paymentMethodId;
                WalletDB.setRecentUsedPaymentMethod(
                  usedPaymentMethodId,
                  usedPaymentMethodType
                );
                return res.status(200).json({
                  authorizationUrl: `${serverUrl}${WALLET_PAYMENT_PATH}?transactionId=${transactionId}`,
                  authorizationRequestId: ulid()
                } as RequestAuthorizationResponse);
              }
            )
          )
      )
    )
);

// This API is used to create a mock transaction when the outcome selected is SUCCESS (0)
addPaymentHandler("post", "/mock-transaction", (req, res) =>
  pipe(
    req.body.transactionId,
    O.fromNullable,
    O.fold(
      () => res.sendStatus(403),
      transactionId =>
        pipe(
          getTransactionInfoPayload(transactionId),
          O.fold(
            () => res.sendStatus(404),
            () => {
              NoticesDB.generateUserNotice(transactionId, 0);
              return res.status(200).json({ status: "ok" });
            }
          )
        )
    )
  )
);

addPaymentHandler("get", "/wallets", (req, res) => {
  res.json({
    wallets: WalletDB.getUserWallets()
  });
});

addPaymentHandler("get", "/user/lastPaymentMethodUsed", (req, res) => {
  res.json({
    ...WalletDB.getRecentusedPaymentMethod()
  });
});

/** This API is used to retrieve a list of payment methods available */
addPaymentHandler("get", "/payment-methods", (req, res) => {
  res.json(generateOnboardablePaymentMethods());
});

/**
 * API to retrieve the redirect URL to open in the app browser for the given
 * payment method id
 */
addPaymentHandler("get", "/payment-methods/:id/redirectUrl", (req, res) => {
  const { id } = req.params;
  pipe(
    id,
    O.fromNullable,
    O.map(paymentMethodId =>
      res.json({
        redirectUrl: generateOnboardingWalletData({
          paymentMethodId,
          contextualOnboarding: true
        })?.redirectUrl
      } as RedirectUrlResponse)
    ),
    O.getOrElse(() => res.sendStatus(400))
  );
});

addPaymentHandler("post", "/private/finalizePayment", (req, res) => {
  if (latestPaymentRequestId != null) {
    const outcomeString = req.query.outcome;
    const outcomeNumber = Number(outcomeString);
    if (!Number.isSafeInteger(outcomeNumber)) {
      res
        .status(400)
        .json(getProblemJson(400, "Missing or invalid 'outcome' parameter"));
      return;
    }
    const outcomeDetailV2Enum = mapOutcomeCodeToDetailsV2Enum(outcomeNumber);
    PaymentsDatabase.createProcessedPayment(
      latestPaymentRequestId,
      outcomeDetailV2Enum
    );
    latestPaymentRequestId = undefined;
  }
  res.sendStatus(200);
});

const mapOutcomeCodeToDetailsV2Enum = (outcome: number): PaymentFaultV2Enum => {
  switch (outcome) {
    case 0:
      return PaymentFaultV2Enum.PAA_PAGAMENTO_DUPLICATO;
    case 2:
      return PaymentFaultV2Enum.PPT_AUTENTICAZIONE;
    case 3:
      return PaymentFaultV2Enum.PPT_ERRORE_EMESSO_DA_PAA;
    case 8:
      return PaymentFaultV2Enum.PAA_PAGAMENTO_ANNULLATO;
    case 11:
      return PaymentFaultV2Enum.PAA_PAGAMENTO_SCONOSCIUTO;
    case 13:
      return PaymentFaultV2Enum.PAA_PAGAMENTO_IN_CORSO;
    case 18:
      return PaymentFaultV2Enum.PAA_PAGAMENTO_SCADUTO;
  }
  return PaymentFaultV2Enum.GENERIC_ERROR;
};
