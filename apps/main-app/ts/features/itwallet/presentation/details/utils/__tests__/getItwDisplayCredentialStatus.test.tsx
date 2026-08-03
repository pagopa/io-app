import { getItwDisplayCredentialStatus } from "..";

describe("getItwDisplayCredentialStatus", () => {
  // Rows where credentialStatus and eidStatus match also model the PID,
  // whose status is the eID status itself
  describe("credential status display rules", () => {
    it.each`
      credentialStatus | eidStatus        | isOffline | expected
      ${"valid"}       | ${"jwtExpiring"} | ${true}   | ${"valid"}
      ${"jwtExpiring"} | ${"valid"}       | ${true}   | ${"jwtExpiring"}
      ${"jwtExpired"}  | ${"valid"}       | ${true}   | ${"jwtExpired"}
      ${"expired"}     | ${"valid"}       | ${true}   | ${"expired"}
      ${"jwtExpired"}  | ${"jwtExpired"}  | ${true}   | ${"invalid"}
      ${"jwtExpiring"} | ${"jwtExpiring"} | ${true}   | ${"jwtExpiring"}
      ${"jwtExpiring"} | ${"jwtExpiring"} | ${false}  | ${"jwtExpiring"}
      ${"jwtExpiring"} | ${undefined}     | ${false}  | ${"jwtExpiring"}
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
          isOffline
        );
        expect(result).toBe(expected);
      }
    );
  });
});
