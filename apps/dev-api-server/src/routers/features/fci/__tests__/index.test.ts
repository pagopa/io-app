import { EnvironmentEnum } from "@io-app/api-types/generated/definitions/fci/Environment";
import supertest from "supertest";
import { ulid } from "ulid";

import { getQtspNonceExpirations } from "../../../../features/fci/qtspNonceStore";
import { createSignatureBody } from "../../../../payloads/features/fci/create-signature-body";
import { createFilledDocumentBody } from "../../../../payloads/features/fci/qtsp-filled-document";
import { SIGNATURE_REQUEST_ID } from "../../../../payloads/features/fci/signature-request";
import app from "../../../../server";
import { addApiSignV1Prefix } from "../../../../utils/strings";

const request = supertest(app);

describe("io-sign API", () => {
  describe("GET signature-request", () => {
    describe("when the signer request a signature-request with a valid signatureRequestId", () => {
      it("should return 200", async () => {
        const response = await request.get(
          addApiSignV1Prefix(`/signature-requests/${SIGNATURE_REQUEST_ID}`)
        );
        expect(response.status).toBe(200);
      });
      it("should return a valid x-io-sign-environment header equal to test", async () => {
        const response = await request.get(
          addApiSignV1Prefix(`/signature-requests/${SIGNATURE_REQUEST_ID}`)
        );
        expect(response.status).toBe(200);
        expect(response.header["x-io-sign-environment"]).toBe(
          EnvironmentEnum.test
        );
      });
    });
    describe("when the signer request a signature-request without a valid signatureRequestId", () => {
      it("should return 404", async () => {
        const response = await request.get(
          addApiSignV1Prefix(`/signature-requests/${ulid()}`)
        );
        expect(response.status).toBe(404);
      });
      it("should return a valid x-io-sign-environment header equal to test", async () => {
        const response = await request.get(
          addApiSignV1Prefix(`/signature-requests/${ulid()}`)
        );
        expect(response.status).toBe(404);
        expect(response.header["x-io-sign-environment"]).toBe(
          EnvironmentEnum.test
        );
      });
    });
  });
  describe("GET qtsp clauses", () => {
    beforeEach(() => {
      getQtspNonceExpirations().clear();
    });

    describe("when the signer request qtsp clauses", () => {
      it("should return 200 and the clauses list", async () => {
        const response = await request.get(addApiSignV1Prefix(`/qtsp/clauses`));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("clauses");
        expect(response.body.nonce).toMatch(/^devnonce-/);
        expect(getQtspNonceExpirations().has(response.body.nonce)).toBe(true);
      });

      it("should store the nonce with an expiration date", async () => {
        const response = await request.get(addApiSignV1Prefix(`/qtsp/clauses`));
        const nonceExpiration = getQtspNonceExpirations().get(
          response.body.nonce
        );

        if (nonceExpiration === undefined) {
          throw new Error("missing nonce expiration");
        }

        expect(nonceExpiration.getTime()).toBeGreaterThan(Date.now());
      });
    });
  });
  describe("POST qtsp filled document", () => {
    describe("when the signer request qtsp filled document", () => {
      it("should return 201 and the filled_document_url", async () => {
        const response = await request
          .post(addApiSignV1Prefix(`/qtsp/clauses/filled_document`))
          .send(createFilledDocumentBody);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("filled_document_url");
      });
    });
  });
  describe("POST create signature", () => {
    const SHOULD_RETURN_400 = "should return 400";

    beforeEach(() => {
      getQtspNonceExpirations().clear();
    });

    describe("when the signer request a signature with a valid body", () => {
      it("should return 200", async () => {
        const qtspClausesResponse = await request.get(
          addApiSignV1Prefix(`/qtsp/clauses`)
        );
        const response = await request
          .post(addApiSignV1Prefix(`/signatures`))
          .send({
            ...createSignatureBody,
            qtsp_clauses: {
              ...createSignatureBody.qtsp_clauses,
              nonce: qtspClausesResponse.body.nonce
            }
          });
        expect(response.status).toBe(200);
      });
    });
    describe("when the signer request a signature with an invalid nonce", () => {
      it(SHOULD_RETURN_400, async () => {
        const response = await request
          .post(addApiSignV1Prefix(`/signatures`))
          .send(createSignatureBody);
        expect(response.status).toBe(400);
      });
    });
    describe("when the signer request a signature with an expired nonce", () => {
      it(SHOULD_RETURN_400, async () => {
        const qtspClausesResponse = await request.get(
          addApiSignV1Prefix(`/qtsp/clauses`)
        );
        const expiredNonce = qtspClausesResponse.body.nonce;
        getQtspNonceExpirations().set(
          expiredNonce,
          new Date(Date.now() - 1000)
        );

        const response = await request
          .post(addApiSignV1Prefix(`/signatures`))
          .send({
            ...createSignatureBody,
            qtsp_clauses: {
              ...createSignatureBody.qtsp_clauses,
              nonce: expiredNonce
            }
          });

        expect(response.status).toBe(400);
      });
    });
    describe("when the signer request signature detail with a not valid body", () => {
      it(SHOULD_RETURN_400, async () => {
        const response = await request.post(addApiSignV1Prefix(`/signatures`));
        expect(response.status).toBe(400);
      });
    });
  });
  describe("GET fci metadata", () => {
    describe("when the signer request metadata", () => {
      it("should return 200 and the fci metadata", async () => {
        const response = await request.get(addApiSignV1Prefix(`/metadata`));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("serviceId");
      });
    });
  });
  describe("GET signature-requests list", () => {
    describe("when the signer-requests called", () => {
      it("should return 200 and the signature requests array", async () => {
        const response = await request.get(
          addApiSignV1Prefix(`/signature-requests`)
        );
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("items");
        expect(response.body.items).toBeInstanceOf(Array);
      });
    });
  });
});
