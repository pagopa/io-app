import { VersionPerPlatform } from "@io-app/api-types/generated/definitions/content/VersionPerPlatform";
import * as E from "fp-ts/lib/Either";
import { string, type } from "io-ts";
import supertest from "supertest";

import app from "../../server";

// this type has since been removed
const ServerInfo = type({
  version: string,

  min_app_version: VersionPerPlatform,

  min_app_version_pagopa: VersionPerPlatform
});
const request = supertest(app);

it("info should return a valid ServerInfo object", async () => {
  const response = await request.get(`/info`);
  expect(response.status).toBe(200);
  const sr = ServerInfo.decode(response.body);
  expect(E.isRight(sr)).toBeTruthy();
});
