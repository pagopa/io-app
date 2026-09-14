import { getItwDisplayCredentialStatus } from "..";

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
      ${"jwtExpiring"} | ${"jwtExpired"}  | ${false}  | ${"jwtExpiring"}
      ${"expiring"}    | ${"jwtExpired"}  | ${false}  | ${"expiring"}
      ${"expired"}     | ${"jwtExpired"}  | ${false}  | ${"expired"}
      ${"jwtExpiring"} | ${"valid"}       | ${false}  | ${"jwtExpiring"}
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
