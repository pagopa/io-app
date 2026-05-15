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
      ${"jwtExpiring"} | ${"jwtExpiring"} | ${false}  | ${"valid"}
      ${"valid"}       | ${"jwtExpired"}  | ${false}  | ${"invalid"}
      ${"jwtExpired"}  | ${"jwtExpired"}  | ${false}  | ${"invalid"}
      ${"jwtExpiring"} | ${"jwtExpired"}  | ${false}  | ${"invalid"}
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
          isOffline
        );
        expect(result).toBe(expected);
      }
    );
  });
});
