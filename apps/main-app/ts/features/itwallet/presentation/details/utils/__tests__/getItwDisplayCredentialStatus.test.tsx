import { getItwDisplayCredentialStatus } from "..";

describe("getItwDisplayCredentialStatus", () => {
  it.each`
    credentialStatus | eidStatus        | isOffline | expected
    ${"valid"}       | ${"jwtExpiring"} | ${true}   | ${"valid"}
    ${"jwtExpiring"} | ${"valid"}       | ${true}   | ${"valid"}
    ${"jwtExpired"}  | ${"valid"}       | ${true}   | ${"jwtExpired"}
    ${"expired"}     | ${"valid"}       | ${true}   | ${"expired"}
    ${"jwtExpired"}  | ${"jwtExpired"}  | ${true}   | ${"valid"}
    ${"jwtExpiring"} | ${"jwtExpiring"} | ${false}  | ${"valid"}
    ${"valid"}       | ${"jwtExpired"}  | ${false}  | ${"valid"}
    ${"jwtExpired"}  | ${"jwtExpired"}  | ${false}  | ${"valid"}
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
