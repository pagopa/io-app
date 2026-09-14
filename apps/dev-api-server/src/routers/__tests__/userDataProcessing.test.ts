import { ProblemJson } from "@io-app/api-types/generated/definitions/identity/ProblemJson";
import { UserDataProcessing } from "@io-app/api-types/generated/definitions/identity/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "@io-app/api-types/generated/definitions/identity/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "@io-app/api-types/generated/definitions/identity/UserDataProcessingStatus";
import * as E from "fp-ts/lib/Either";
import supertest from "supertest";

import app from "../../server";
import { addApiIdentityV1Prefix } from "../../utils/strings";

const request = supertest(app);
/* eslint-disable */
it("info should return ProblemJson with not found", async () => {
  const response = await request.get(
    addApiIdentityV1Prefix(
      `/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
    )
  );
  expect(response.status).toBe(404);
  const sr = ProblemJson.decode(response.body);
  expect(E.isRight(sr)).toBeTruthy();
});

it("Delete should return conflict error if DELETE status is undefined", async () => {
  const response = await request.delete(
    addApiIdentityV1Prefix(
      `/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
    )
  );
  expect(response.status).toBe(409);
});

it("Post should create a pending operation", async () => {
  const response = await request
    .post(addApiIdentityV1Prefix("/user-data-processing"))
    .send({ choice: UserDataProcessingChoiceEnum.DELETE })
    .set("Content-Type", "application/json");
  expect(response.status).toBe(200);
  const pending: UserDataProcessing = {
    choice: UserDataProcessingChoiceEnum.DELETE,
    status: UserDataProcessingStatusEnum.PENDING,
    version: 1
  };
  const sr = UserDataProcessing.decode(response.body);
  expect(E.isRight(sr)).toBeTruthy();
  if (E.isRight(sr)) expect(sr.right).toEqual(pending);
});

it("Delete should set the request as aborted if the choice is DELETE and status is PENDING", async () => {
  const response = await request.delete(
    addApiIdentityV1Prefix(
      `/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
    )
  );
  expect(response.status).toBe(202);

  const newStatus = await request.get(
    addApiIdentityV1Prefix(
      `/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
    )
  );
  const aborted: UserDataProcessing = {
    choice: UserDataProcessingChoiceEnum.DELETE,
    status: UserDataProcessingStatusEnum.ABORTED,
    version: 1
  };
  const sr = UserDataProcessing.decode(newStatus.body);
  expect(E.isRight(sr)).toBeTruthy();
  if (E.isRight(sr)) expect(sr.right).toEqual(aborted);
});

it("Delete should return conflict error if choice is DOWNLOAD", async () => {
  const response = await request.delete(
    addApiIdentityV1Prefix(
      `/user-data-processing/${UserDataProcessingChoiceEnum.DOWNLOAD}`
    )
  );
  expect(response.status).toBe(409);
});

it("Delete should return conflict error if DELETE status is ABORTED", async () => {
  const response = await request.delete(
    addApiIdentityV1Prefix(
      `/user-data-processing/${UserDataProcessingChoiceEnum.DELETE}`
    )
  );
  expect(response.status).toBe(409);
});
