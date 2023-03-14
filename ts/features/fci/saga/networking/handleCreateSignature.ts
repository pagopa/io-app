import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BackendFciClient } from "../../api/backendFci";
import { fciSigningRequest } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { LollipopConfig } from "../../../lollipop";
import { getCustomSignature, getTosSignature } from "../../utils/signature";
import { fciDocumentsWithUrlSelector } from "../../store/reducers/fciSignatureRequest";
import { fciQtspFilledDocumentUrlSelector } from "../../store/reducers/fciQtspFilledDocument";

/*
 * A saga to post signature data.
 */
export function* handleCreateSignature(
  postSignature: ReturnType<typeof BackendFciClient>["postSignature"],
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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore TODO: https://pagopa.atlassian.net/browse/SFEQS-1509?atlOrigin=eyJpIjoiMTQ3NWY3OTdjOTU5NDNkN2E2YzE1NzA0ZjZmM2Y1ZGYiLCJwIjoiaiJ9
    const postSignatureResponse = yield* call(postSignature(lollipopConfig), {
      signatureToCreate: action.payload
    });

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
