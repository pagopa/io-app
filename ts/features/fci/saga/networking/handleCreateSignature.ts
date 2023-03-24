import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { fciSigningRequest } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { LollipopConfig } from "../../../lollipop";
import { getCustomSignature, getTosSignature } from "../../utils/signature";
import { fciDocumentsWithUrlSelector } from "../../store/reducers/fciSignatureRequest";
import { fciQtspFilledDocumentUrlSelector } from "../../store/reducers/fciQtspFilledDocument";
import { createFciClientWithLollipop } from "../../api/backendFci";
import { SessionToken } from "../../../../types/SessionToken";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { LollipopMethodEnum } from "../../../../../definitions/fci/LollipopMethod";
import { LollipopOriginalURL } from "../../../../../definitions/fci/LollipopOriginalURL";
import { LollipopSignatureInput } from "../../../../../definitions/fci/LollipopSignatureInput";
import { LollipopSignature } from "../../../../../definitions/fci/LollipopSignature";

/*
 * A saga to post signature data.
 */
export function* handleCreateSignature(
  apiUrl: string,
  bearerToken: SessionToken,
  keyInfo: KeyInfo = {},
  action: ActionType<typeof fciSigningRequest["request"]>
): SagaIterator {
  try {
    const qtspFilledDocumentUrl = yield* select(
      fciQtspFilledDocumentUrlSelector
    );
    const qtspClauses = {
      ...action.payload.qtsp_clauses,
      filled_document_url: qtspFilledDocumentUrl as NonEmptyString
    };

    const tosChallange = yield* call(getTosSignature(qtspClauses));

    if (E.isLeft(tosChallange)) {
      throw Error(`${tosChallange.left}`);
    }

    const tosChallengeHashHex = E.isRight(tosChallange)
      ? tosChallange.right
      : "";

    const documentSignatures = yield* select(
      fciDocumentsWithUrlSelector(action.payload.documents_to_sign)
    );

    const signChallenge = yield* call(getCustomSignature(documentSignatures));
    if (E.isLeft(signChallenge)) {
      throw Error(`${signChallenge.left}`);
    }
    const signChallengeHashHex = E.isRight(signChallenge)
      ? signChallenge.right
      : "";

    const lollipopConfig: LollipopConfig = {
      nonce: action.payload.qtsp_clauses.nonce,
      customContentToSign: {
        "tos-challenge": tosChallengeHashHex,
        "sign-challenge": signChallengeHashHex
      }
    };

    const fciLollipopclient = createFciClientWithLollipop(
      apiUrl,
      keyInfo,
      lollipopConfig
    );

    // To avoid a type error on createSignature TypeCallApi
    // we need to initializa the following values to the correct type
    // and the correct values will be setted by the client
    // using custom fetchApi (lollipopFetch)
    const postSignatureResponse = yield* call(
      fciLollipopclient.createSignature,
      {
        body: action.payload,
        Bearer: bearerToken,
        "x-pagopa-lollipop-original-method": LollipopMethodEnum.POST,
        "x-pagopa-lollipop-original-url": "" as LollipopOriginalURL,
        "signature-input": "" as LollipopSignatureInput,
        signature: "" as LollipopSignature,
        "x-pagopa-lollipop-custom-tos-challenge": "",
        "x-pagopa-lollipop-custom-sign-challenge": ""
      }
    );

    if (E.isLeft(postSignatureResponse)) {
      throw Error(readablePrivacyReport(postSignatureResponse.left));
    }

    if (postSignatureResponse.right.status === 200) {
      yield* put(fciSigningRequest.success(postSignatureResponse.right.value));
      return;
    }

    throw Error(`response status ${postSignatureResponse.right.status}`);
  } catch (e) {
    yield* put(fciSigningRequest.failure(getNetworkError(e)));
  }
}
