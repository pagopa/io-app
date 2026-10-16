import { BackendStatus } from "@io-app/api-types/generated/definitions/content/BackendStatus";
import { Zendesk } from "@io-app/api-types/generated/definitions/content/Zendesk";
import * as E from "fp-ts/lib/Either";
import supertest from "supertest";

import { staticContentRootPath } from "../../config";
import app from "../../server";

const request = supertest(app);

it("info should return a valid backendStatus object", async () => {
  const response = await request.get(
    `${staticContentRootPath}/status/backend.json`
  );
  expect(response.status).toBe(200);
  const bs = BackendStatus.decode(response.body);
  expect(E.isRight(bs)).toBeTruthy();
});

it("info should return a valid zendesk config object", async () => {
  const response = await request.get(
    `${staticContentRootPath}/assistanceTools/zendesk.json`
  );
  expect(response.status).toBe(200);
  const bs = Zendesk.decode(response.body);
  expect(E.isRight(bs)).toBeTruthy();
});
