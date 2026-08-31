import { EnvironmentEnum } from "@io-app/api-types/generated/definitions/fci/Environment";
import { SignatureRequestStatusEnum } from "@io-app/api-types/generated/definitions/fci/SignatureRequestStatus";
import { Router } from "express";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { isEqual } from "lodash";

import { ioDevServerConfig, staticContentRootPath } from "../../../config";
import {
  generateAndStoreQtspNonce,
  validateQtspNonce
} from "../../../features/fci/qtspNonceStore";
import { getProblemJson } from "../../../payloads/error";
import { mockFciMetadata } from "../../../payloads/features/fci/metadata";
import { qtspClauses } from "../../../payloads/features/fci/qtsp-clauses";
import { qtspFilledDocument } from "../../../payloads/features/fci/qtsp-filled-document";
import { mockSignatureDetailView } from "../../../payloads/features/fci/signature-detail-request";
import {
  CANCELED_SIGNATURE_REQUEST_ID,
  EXPIRED_SIGNATURE_REQUEST_ID,
  NO_FIELDS_SIGNATURE_REQUEST_ID,
  signatureRequestDetailViewDoc as originalSignatureRequestDetailViewDoc,
  REJECTED_SIGNATURE_REQUEST_ID,
  SIGNATURE_REQUEST_ID,
  SIGNED_EXPIRED_SIGNATURE_REQUEST_ID,
  SIGNED_SIGNATURE_REQUEST_ID,
  WAIT_QTSP_SIGNATURE_REQUEST_ID
} from "../../../payloads/features/fci/signature-request";
import { signatureRequestList } from "../../../payloads/features/fci/signature-requests";
import { addHandler } from "../../../payloads/response";
import { sendFileFromRootPath } from "../../../utils/file";
import { addApiSignV1Prefix } from "../../../utils/strings";
import { RouteHandler } from "../../../utils/types";

export const fciRouter = Router();
const configResponse = ioDevServerConfig.messages.fci.response;

const handleGetSignatureRequest: RouteHandler = (req, res) => {
  const signatureRequestId = "signatureRequestId";
  const now = new Date();
  const signatureRequestDetailViewDoc = {
    ...originalSignatureRequestDetailViewDoc,
    documents: originalSignatureRequestDetailViewDoc.documents.map(d => ({
      ...d,
      url:
        d.url +
        `?expiration=${
          now.getTime() +
          ioDevServerConfig.messages.fci.response
            .documentExpirationDurationSeconds *
            1000
        }`
    }))
  };
  const environment = EnvironmentEnum.test;
  res.header("x-io-sign-environment", environment);
  pipe(
    O.fromNullable(req.params[signatureRequestId]),
    O.chain(signatureReqId =>
      (signatureReqId === SIGNATURE_REQUEST_ID ||
        signatureReqId === EXPIRED_SIGNATURE_REQUEST_ID ||
        signatureReqId === WAIT_QTSP_SIGNATURE_REQUEST_ID ||
        signatureReqId === SIGNED_SIGNATURE_REQUEST_ID ||
        signatureReqId === SIGNED_EXPIRED_SIGNATURE_REQUEST_ID ||
        signatureReqId === REJECTED_SIGNATURE_REQUEST_ID ||
        signatureReqId === NO_FIELDS_SIGNATURE_REQUEST_ID ||
        signatureReqId === CANCELED_SIGNATURE_REQUEST_ID) &&
      configResponse.getFciResponseCode === 200
        ? O.some(signatureReqId)
        : O.none
    ),
    O.fold(
      // No signatureRequestId was found return an error based on response code
      () =>
        pipe(
          configResponse.getFciResponseCode,
          O.of,
          O.filter(responseCode => responseCode !== 200),
          O.map(responseCode =>
            res.status(responseCode).json(getProblemJson(responseCode))
          ),
          O.getOrElse(() => res.sendStatus(404)) // No response code was found return 404 as default
        ),
      signatureReqId => {
        switch (signatureReqId) {
          case CANCELED_SIGNATURE_REQUEST_ID:
            return res.status(200).json({
              ...signatureRequestDetailViewDoc,
              id: CANCELED_SIGNATURE_REQUEST_ID,
              updated_at: new Date(now.setDate(now.getDate() - 91)),
              status: SignatureRequestStatusEnum.CANCELLED
            });
          case EXPIRED_SIGNATURE_REQUEST_ID:
            return res.status(200).json({
              ...signatureRequestDetailViewDoc,
              id: EXPIRED_SIGNATURE_REQUEST_ID,
              expires_at: new Date(now.setDate(now.getDate() - 30)),
              status: SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE
            });
          case NO_FIELDS_SIGNATURE_REQUEST_ID:
            return res.status(200).json({
              ...signatureRequestDetailViewDoc,
              status: SignatureRequestStatusEnum.WAIT_FOR_SIGNATURE,
              documents: signatureRequestDetailViewDoc.documents.map(d => ({
                ...d,
                metadata: { ...d.metadata, signature_fields: [] }
              }))
            });
          case REJECTED_SIGNATURE_REQUEST_ID:
            return res.status(200).json({
              ...signatureRequestDetailViewDoc,
              id: REJECTED_SIGNATURE_REQUEST_ID,
              updated_at: new Date(now.setDate(now.getDate() - 91)),
              status: SignatureRequestStatusEnum.REJECTED
            });
          case SIGNATURE_REQUEST_ID:
            return res.status(200).json(signatureRequestDetailViewDoc);
          case SIGNED_EXPIRED_SIGNATURE_REQUEST_ID:
            return res.status(200).json({
              ...signatureRequestDetailViewDoc,
              id: SIGNED_EXPIRED_SIGNATURE_REQUEST_ID,
              updated_at: new Date(now.setDate(now.getDate() - 91)),
              status: SignatureRequestStatusEnum.SIGNED
            });
          case WAIT_QTSP_SIGNATURE_REQUEST_ID:
            return res.status(200).json({
              ...signatureRequestDetailViewDoc,
              id: WAIT_QTSP_SIGNATURE_REQUEST_ID,
              status: SignatureRequestStatusEnum.WAIT_FOR_QTSP
            });
          default:
            return res.status(200).json({
              ...signatureRequestDetailViewDoc,
              id: SIGNED_SIGNATURE_REQUEST_ID,
              status: SignatureRequestStatusEnum.SIGNED
            });
        }
      }
    )
  );
};

const handleGetQtspClauses: RouteHandler = (_, res) => {
  res.status(200).json({ ...qtspClauses, nonce: generateAndStoreQtspNonce() });
};

const handlePostQtspClausesFilledDocument: RouteHandler = (req, res) => {
  pipe(
    O.fromNullable(req.body),
    O.chain(cb => (isEqual(cb, {}) ? O.none : O.some(cb))),
    O.fold(
      () => res.sendStatus(400),
      _ => res.status(201).json(qtspFilledDocument)
    )
  );
};

const handlePostSignatures: RouteHandler = (req, res) => {
  pipe(
    O.fromNullable(req.body),
    O.chain(cb => (isEqual(cb, {}) ? O.none : O.some(cb))),
    O.chain(cb =>
      pipe(
        O.fromNullable(cb.qtsp_clauses?.nonce),
        O.map(nonce => validateQtspNonce(nonce))
      )
    ),
    O.fold(
      () => res.sendStatus(400),
      nonceValidationResult => {
        if (nonceValidationResult) {
          return res.status(200).json(mockSignatureDetailView);
        }
        return res.status(400).json({
          detail:
            "An error occurred while validating the request body | undefined",
          status: 400,
          title: "Invalid request"
        });
      }
    )
  );
};

const handleGetFciDocument: RouteHandler = (req, res) => {
  if (typeof req.query.expiration === "string") {
    const now = Date.now();
    const expirationTimestamp = parseInt(req.query.expiration, 10);
    if (isNaN(expirationTimestamp) || now > expirationTimestamp) {
      const start = new Date(
        expirationTimestamp -
          ioDevServerConfig.messages.fci.response
            .documentExpirationDurationSeconds *
            1000
      ).toJSON();
      const expiry = new Date(expirationTimestamp).toJSON();
      const current = new Date(now).toJSON();
      // this case reproduces the expiration mechanic when getting files from
      // https://iopsignst.blob.core.windows.net/validated-documents/XXXXXXXXXXXXXXXXXXXXXXXXXX?sv=2023-08-03&spr=https%2Chttp&st=2026-03-16T15%3A28%3A20Z&se=2026-03-16T15%3A33%3A20Z&sr=b&sp=r&sig=kwZji8ZTRAQCf%2F2GDQPjOet8bxUTYIiJkZkFVUIjSOQ%3D&rsct=application%2Fpdf
      res.status(403);
      res.set("Content-Type", "application/xml");
      res.send(`<?xml version="1.0" encoding="utf-8"?>
<Error>
  <Code>AuthenticationFailed</Code>
  <Message>Server failed to authenticate the request. Make sure the value of Authorization header is formed correctly including the signature.
RequestId:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Time:${new Date(now).toJSON()}</Message>
  <AuthenticationErrorDetail>Signature not valid in the specified time frame: Start [${start}] - Expiry [${expiry}] - Current [${current}]</AuthenticationErrorDetail>
</Error>`);
      return;
    }
  }
  sendFileFromRootPath(`assets/fci/pdf/${req.params.filename}.pdf`, res);
};

const handleGetFciMetadata: RouteHandler = (_, res) => {
  res.status(200).json(mockFciMetadata);
};

const handleGetSignatureRequests: RouteHandler = (_, res) => {
  res.status(200).json(signatureRequestList);
};

// --- Route registrations ---

addHandler(
  fciRouter,
  "get",
  addApiSignV1Prefix("/signature-requests/:signatureRequestId"),
  handleGetSignatureRequest
);
addHandler(
  fciRouter,
  "get",
  addApiSignV1Prefix("/qtsp/clauses"),
  handleGetQtspClauses
);

addHandler(
  fciRouter,
  "post",
  addApiSignV1Prefix("/qtsp/clauses/filled_document"),
  handlePostQtspClausesFilledDocument
);

addHandler(
  fciRouter,
  "post",
  addApiSignV1Prefix("/signatures"),
  handlePostSignatures
);

addHandler(
  fciRouter,
  "get",
  `${staticContentRootPath}/fci/:filename`,
  handleGetFciDocument
);

addHandler(
  fciRouter,
  "get",
  addApiSignV1Prefix("/metadata"),
  handleGetFciMetadata
);

addHandler(
  fciRouter,
  "get",
  addApiSignV1Prefix("/signature-requests"),
  handleGetSignatureRequests
);
