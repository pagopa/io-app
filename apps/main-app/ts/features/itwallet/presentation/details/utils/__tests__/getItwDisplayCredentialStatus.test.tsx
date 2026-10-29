import MockDate from "mockdate";

import { getItwDisplayCredentialStatus } from "..";
import { getCredentialStatus } from "../../../../common/utils/itwCredentialStatusUtils";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";

describe("getItwDisplayCredentialStatus", () => {
  describe("non-PID credentials", () => {
    it.each`
      credentialStatus | eidStatus        | isOffline | expected
      ${"valid"}       | ${"jwtExpiring"} | ${true}   | ${"valid"}
      ${"jwtExpiring"} | ${"valid"}       | ${true}   | ${"valid"}
      ${"jwtExpired"}  | ${"valid"}       | ${true}   | ${"jwtExpired"}
      ${"expired"}     | ${"valid"}       | ${true}   | ${"expired"}
      ${"jwtExpired"}  | ${"jwtExpired"}  | ${true}   | ${"invalid"}
      ${"jwtExpiring"} | ${"jwtExpiring"} | ${true}   | ${"valid"}
      ${"jwtExpiring"} | ${"jwtExpiring"} | ${false}  | ${"valid"}
      ${"jwtExpiring"} | ${undefined}     | ${false}  | ${"valid"}
      ${"valid"}       | ${"jwtExpired"}  | ${false}  | ${"valid"}
      ${"jwtExpired"}  | ${"jwtExpired"}  | ${false}  | ${"invalid"}
      ${"jwtExpiring"} | ${"jwtExpired"}  | ${false}  | ${"valid"}
      ${"expiring"}    | ${"jwtExpired"}  | ${false}  | ${"expiring"}
      ${"expired"}     | ${"jwtExpired"}  | ${false}  | ${"expired"}
      ${"jwtExpiring"} | ${"valid"}       | ${false}  | ${"valid"}
      ${"jwtExpired"}  | ${"valid"}       | ${false}  | ${"jwtExpired"}
    `(
      "should return '$expected' for credentialStatus=$credentialStatus, eidStatus=$eidStatus, offline=$isOffline",
      ({ credentialStatus, eidStatus, isOffline, expected }) => {
        const result = getItwDisplayCredentialStatus(
          credentialStatus,
          eidStatus,
          isOffline,
          false
        );
        expect(result).toBe(expected);
      }
    );
  });

  describe("digital expiration warning display", () => {
    afterEach(() => {
      MockDate.reset();
    });

    it.each([
      {
        name: "no physical expiration",
        expiryDate: undefined,
        expected: "valid"
      },
      {
        name: "physical expiration outside warning period",
        expiryDate: "2024-03-01",
        expected: "valid"
      },
      {
        name: "physical expiration within warning period",
        expiryDate: "2024-02-10",
        expected: "expiring"
      },
      {
        name: "physical expiration before digital expiration",
        expiryDate: "2024-01-25",
        expected: "expiring"
      },
      {
        name: "physical expiration on the same day",
        expiryDate: "2024-01-30",
        expected: "expiring"
      },
      {
        name: "physical expiration today",
        expiryDate: "2024-01-20",
        expected: "expiring"
      },
      {
        name: "physical expiration yesterday",
        expiryDate: "2024-01-19",
        expected: "expired"
      }
    ])("preserves $name", ({ expiryDate, expected }) => {
      MockDate.set(new Date(2024, 0, 20));
      const credential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: { expiration: "2024-01-30T12:00:00Z" },
        parsedCredential: expiryDate
          ? { expiry_date: { name: "Expiry date", value: expiryDate } }
          : {},
        validity: undefined
      };

      expect(
        getItwDisplayCredentialStatus(
          getCredentialStatus(credential),
          "valid",
          false,
          false,
          credential
        )
      ).toBe(expected);
    });

    it("preserves an unknown status hidden by digital expiration", () => {
      MockDate.set(new Date(2024, 0, 20));
      const credential: CredentialMetadata = {
        ...ItwStoredCredentialsMocks.mdl,
        jwt: { expiration: "2024-01-30T12:00:00Z" },
        parsedCredential: {},
        validity: { type: "status_assertion", status: "unknown" }
      };

      expect(getCredentialStatus(credential)).toBe("jwtExpiring");
      expect(
        getItwDisplayCredentialStatus(
          getCredentialStatus(credential),
          "valid",
          false,
          false,
          credential
        )
      ).toBe("unknown");
    });
  });

  // The PID shares its status with the eID, so both parameters always match
  describe("PID", () => {
    it.each`
      credentialStatus | isOffline | expected
      ${"valid"}       | ${false}  | ${"valid"}
      ${"valid"}       | ${true}   | ${"valid"}
      ${"jwtExpiring"} | ${false}  | ${"jwtExpiring"}
      ${"jwtExpiring"} | ${true}   | ${"valid"}
      ${"jwtExpired"}  | ${false}  | ${"invalid"}
      ${"jwtExpired"}  | ${true}   | ${"invalid"}
    `(
      "should return '$expected' for credentialStatus=$credentialStatus, offline=$isOffline",
      ({ credentialStatus, isOffline, expected }) => {
        const result = getItwDisplayCredentialStatus(
          credentialStatus,
          credentialStatus,
          isOffline,
          true
        );
        expect(result).toBe(expected);
      }
    );
  });
});
