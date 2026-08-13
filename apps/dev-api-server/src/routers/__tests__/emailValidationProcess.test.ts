import supertest from "supertest";

import app from "../../server";
import { addApiIdentityV1Prefix } from "../../utils/strings";
const request = supertest(app);

it("email-validation-process should return status 202", async () => {
  const response = await request.post(
    addApiIdentityV1Prefix("/email-validation-process")
  );
  expect(response.status).toBe(202);
});
