import { PublicSession } from "@io-app/api-types/generated/definitions/session_manager/PublicSession";
import * as E from "fp-ts/lib/Either";
import supertest from "supertest";

import { ioDevServerConfig } from "../../config";
import { AppUrlLoginScheme, redirectUrl } from "../../payloads/login";
import { getLoginSessionToken } from "../../persistence/sessionInfo";
import app from "../../server";
import { addApiAuthV1Prefix } from "../../utils/strings";

const request = supertest(app);

const testForPng = async (url: string) => {
  const response = await request.get(url);
  expect(response.status).toBe(200);
  expect(response.get("content-type")).toBe("image/png");
};

it("login should response with a welcome page", async () => {
  const response = await request.get(addApiAuthV1Prefix("/login"));
  expect(response.status).toBe(302);
});

describe("login with auth should response with a redirect url", () => {
  it.each([
    {
      description: "with token only in fragment when flag is disabled",
      sendSessionTokenAsQueryParam: false
    },
    {
      description:
        "with token in query param and fragment when flag is enabled",
      sendSessionTokenAsQueryParam: true
    }
  ])("$description", async ({ sendSessionTokenAsQueryParam }) => {
    jest.replaceProperty(
      ioDevServerConfig.global,
      "sendSessionTokenAsQueryParam",
      sendSessionTokenAsQueryParam
    );

    const response = await request.get("/idp-login?authorized=1");
    const hostAndPort = response.text.match(/\/\/(.*?)\//);
    const host = hostAndPort ? hostAndPort[1] : "";
    const token = getLoginSessionToken() ?? "";

    const baseURL = `${AppUrlLoginScheme.webview}://${host}`;
    const expectedUrlInstance = new URL(redirectUrl, baseURL);

    if (sendSessionTokenAsQueryParam) {
      expectedUrlInstance.searchParams.append("token", token);
    }
    // eslint-disable-next-line functional/immutable-data
    expectedUrlInstance.hash = `token=${token}`;

    expect(response.status).toBe(302);
    expect(response.text).toBe(
      `Found. Redirecting to ${expectedUrlInstance.toString()}`
    );
  });
});

it("session should return a valid session", async () => {
  const response = await request.get(addApiAuthV1Prefix("/session"));
  expect(response.status).toBe(200);
  const session = PublicSession.decode(response.body);
  expect(E.isRight(session)).toBeTruthy();
});

it("test-login for LEGACY /test-login should always return sessionToken", async () => {
  const result = await request
    .post(addApiAuthV1Prefix("/test-login"))
    .set("x-pagopa-lollipop-pub-key-hash-algo", "sha256")
    .set(
      "x-pagopa-lollipop-pub-key",
      "eyJrdHkiOiJFQyIsInkiOiJuYkFGd0JLT3AvRnh4VHpITGgvbVdUL3NtSjllY0lxaElkK0dBemQxTFB3PSIsIngiOiJkdHhFZU5PK1B2RFdoVkM2ZnQyTFRLMlZvWHoxektpQmI4bkRyUy9sZGY4PSIsImNydiI6IlAtMjU2In0="
    )
    .set("x-pagopa-idp-id", "spid");

  expect(result.status).toBe(200);
  expect(result.body).toStrictEqual({ token: getLoginSessionToken() });
});

it("test-login for FL /test-login should always return sessionToken", async () => {
  const result = await request
    .post(addApiAuthV1Prefix("/test-login"))
    .set("x-pagopa-lollipop-pub-key-hash-algo", "sha256")
    .set(
      "x-pagopa-lollipop-pub-key",
      "eyJrdHkiOiJFQyIsInkiOiJuYkFGd0JLT3AvRnh4VHpITGgvbVdUL3NtSjllY0lxaElkK0dBemQxTFB3PSIsIngiOiJkdHhFZU5PK1B2RFdoVkM2ZnQyTFRLMlZvWHoxektpQmI4bkRyUy9sZGY4PSIsImNydiI6IlAtMjU2In0="
    )
    .set("x-pagopa-idp-id", "spid")
    .set("x-pagopa-login-type", "LV");

  expect(result.status).toBe(200);
  expect(result.body).toStrictEqual({ token: getLoginSessionToken() });
});

it("Pay webview route should always response 200", async () => {
  await testForPng("/paywebview");
});

it("Route /assets/imgs/how_to_login.png should response 200", async () => {
  await testForPng("/assets/imgs/how_to_login.png");
});

it("Reset route should response 200 and contain reset text", async () => {
  const response = await request.get("/reset");
  expect(response.status).toBe(200);
  expect(response.text).toContain("<h2>reset:</h2>");
});

it("logout should response 200", async () => {
  const response = await request.post(addApiAuthV1Prefix("/logout"));
  expect(response.status).toBe(200);
});
