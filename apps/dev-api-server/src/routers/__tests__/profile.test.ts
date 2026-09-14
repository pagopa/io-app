import { Municipality } from "@io-app/api-types/generated/definitions/content/Municipality";
import { EmailAddress } from "@io-app/api-types/generated/definitions/identity/EmailAddress";
import { InitializedProfile } from "@io-app/api-types/generated/definitions/identity/InitializedProfile";
import { Profile } from "@io-app/api-types/generated/definitions/identity/Profile";
import * as E from "fp-ts/lib/Either";
import supertest from "supertest";

import { ioDevServerConfig } from "../../config";
import app from "../../server";
import { addApiIdentityV1Prefix } from "../../utils/strings";

const request = supertest(app);

it("profile should return a valid profile", async () => {
  const response = await request.get(addApiIdentityV1Prefix("/profile"));
  expect(response.status).toBe(200);
  const profile = InitializedProfile.decode(response.body);
  expect(E.isRight(profile)).toBeTruthy();
  if (E.isRight(profile)) {
    expect(profile.right.fiscal_code).toBe(
      ioDevServerConfig.profile.attrs.fiscal_code
    );
  }
});

it("profile should return a valid updated profile (version increased)", async () => {
  const profile: Profile = {
    is_inbox_enabled: true,
    is_email_enabled: true,
    is_webhook_enabled: true,
    email: "new_email@email.it" as EmailAddress,
    version: 1
  };
  const response = await request
    .post(addApiIdentityV1Prefix("/profile"))
    .send(profile)
    .set("Content-Type", "application/json");

  expect(response.status).toBe(200);
  const updatedProfile = InitializedProfile.decode(response.body);
  if (E.isRight(updatedProfile)) {
    expect(updatedProfile.right.version).toBe(profile.version + 1);
  }
});

it("get municipality should return a valid municipality", async () => {
  const response = await request.get(
    `/static_contents/municipalities/A/B/CODE`
  );
  expect(response.status).toBe(200);
  const municipality = Municipality.decode(response.body);
  expect(E.isRight(municipality)).toBeTruthy();
});
