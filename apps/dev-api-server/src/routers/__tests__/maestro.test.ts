import express from "express";
import { once } from "node:events";
import supertest from "supertest";

import app from "../../server";
import { addApiIdentityV1Prefix } from "../../utils/strings";
import { maestroRouter } from "../maestro";

const profile = addApiIdentityV1Prefix("/profile");

it("does not expose fixture controls on the default server", async () => {
  await supertest(app).post("/maestro/profile-outage").expect(404);
});

it("restores profile access if the runner exits without cleanup", async () => {
  const fixtureApp = express().use(maestroRouter);
  fixtureApp.get(profile, (_, res) => res.sendStatus(200));
  const server = fixtureApp.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const request = supertest(server);
    await request.post("/maestro/profile-outage").expect(204);
    await request.get(profile).expect(503);
    jest.spyOn(Date, "now").mockReturnValue(Date.now() + 3 * 60 * 1000);
    await request.get(profile).expect(200);
  } finally {
    jest.restoreAllMocks();
    server.close();
  }
});
