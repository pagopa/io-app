import supertest from "supertest";

import { getIbanListResponse } from "../../../../payloads/features/idpay/get-iban-list";
import { ibanList } from "../../../../persistence/idpay";
import app from "../../../../server";
import { addIdPayPrefix } from "../router";

const request = supertest(app);

describe("IDPay IBAN API", () => {
  describe("GET getIbanList", () => {
    it("should return 200 with IBAN list", async () => {
      const response = await request.get(addIdPayPrefix("/iban"));
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(getIbanListResponse());
    });
  });
  describe("GET getIban", () => {
    it("should return 200 with the requested IBAN if IBAN exists", async () => {
      const iban = ibanList[0];

      const response = await request.get(addIdPayPrefix(`/iban/${iban?.iban}`));
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(iban);
    });
    it("should return 404 if IBAN does not exist", async () => {
      const response = await request.get(addIdPayPrefix(`/iban/ABC123`));
      expect(response.status).toBe(404);
    });
  });
});
