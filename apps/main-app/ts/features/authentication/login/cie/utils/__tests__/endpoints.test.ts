import { Platform } from "react-native";

import { getCieIdpUrl } from "../endpoints";

describe("getCieIdpUrl", () => {
  const BASE_URL =
    "https://preproduzione.idserver.servizicie.interno.gov.it/idp/";

  const SCENARIOS = [
    { os: "ios" as const, expected: `${BASE_URL}Authn/SSL/Login2` },
    { os: "android" as const, expected: BASE_URL },
    { os: "windows" as const, expected: null }
  ];

  it.each(SCENARIOS)(
    "should return $expected for preprod when platform is $os",
    ({ os, expected }) => {
      jest
        .spyOn(Platform, "select")
        .mockImplementation(
          options =>
            options[os] ?? options["default" as unknown as keyof typeof options]
        );

      expect(getCieIdpUrl("preprod")).toBe(expected);
    }
  );

  it("should return null for prod", () => {
    expect(getCieIdpUrl("production")).toBeNull();
  });
});
