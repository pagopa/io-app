import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { itwStoreIntegrityKeyTag } from "../../../../issuance/store/actions";
import {
  itwLifecycleIsITWalletValidSelector,
  itwLifecycleIsInstalledSelector,
  itwLifecycleIsOperationalSelector,
  itwLifecycleIsValidSelector
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwCredentialsStore } from "../../../../credentials/store/actions";
import { StoredCredential } from "../../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import { reproduceSequence } from "../../../../../../utils/tests";
import { itwSetFiscalCodeWhitelisted } from "../../../../common/store/actions/preferences";

const PID =
  "eyJraWQiOiItRl82VWdhOG4zVmVnalkyVTdZVUhLMXpMb2FELU5QVGM2M1JNSVNuTGF3IiwidHlwIjoiZGMrc2Qtand0IiwiYWxnIjoiRVMyNTYifQ.eyJfc2QiOlsiMHExRDVKbWF2NnBRYUVoX0pfRmN2X3VOTk1RSWdDeWhRT3hxbFk0bDNxVSIsIktDSi1BVk52ODhkLXhqNnNVSUFPSnhGbmJVaDNySFhES2tJSDFsRnFiUnMiLCJNOWxvOVl4RE5JWHJBcTJxV2VpQ0E0MHpwSl96WWZGZFJfNEFFQUxjUnRVIiwiY3pnalVrMG5xUkNzd1NoQ2hDamRTNkExLXY0N2RfcVRDU0ZJdklIaE1vSSIsIm5HblFyN2NsbTN0ZlRwOHlqTF91SHJEU090elIyUFZiOFM3R2VMZEFxQlEiLCJ4TklWd2xwU3NhWjhDSlNmMGd6NXhfNzVWUldXYzZWMW1scGVqZENycVVzIl0sInN1YiI6IjIxNmY4OTQ2LTllY2ItNDgxOS05MzA5LWMwNzZmMzRhN2UxMSIsIl9zZF9hbGciOiJzaGEtMjU2IiwidmN0IjoiUGVyc29uSWRlbnRpZmljYXRpb25EYXRhIiwidmN0I2ludGVncml0eSI6IjEzZTI1ODg4YWM3YjhhM2E2ZDYxNDQwZGE3ODdmY2NjODE2NTRlNjEwODU3MzJiY2FjZDg5YjM2YWVjMzI2NzUiLCJpc3MiOiJodHRwczovL3ByZS5laWQud2FsbGV0LmlwenMuaXQiLCJpc3N1aW5nX2NvdW50cnkiOiJJVCIsImlzc3VpbmdfYXV0aG9yaXR5IjoiSXN0aXR1dG8gUG9saWdyYWZpY28gZSBaZWNjYSBkZWxsbyBTdGF0byIsImNuZiI6eyJqd2siOnsia3R5IjoiRUMiLCJjcnYiOiJQLTI1NiIsImtpZCI6IlJ2M1ctRWlLcHZCVHlrNXlaeHZyZXYtN01EQjZTbHpVQ0JvX0NRampkZFUiLCJ4IjoiMFdveDdRdHlQcUJ5ZzM1TUhfWHlDY25kNUxlLUptMEFYSGxVZ0RCQTAzWSIsInkiOiJlRWhWdmcxSlBxTmQzRFRTYTRtR0RHQmx3WTZOUC1FWmJMYk5GWFNYd0lnIn19LCJleHAiOjE3NTE1NDY1NzYsInN0YXR1cyI6eyJzdGF0dXNfYXNzZXJ0aW9uIjp7ImNyZWRlbnRpYWxfaGFzaF9hbGciOiJzaGEtMjU2In19fQ.XqB-0BJmBr5vwahsbsnE5oqrlxzvxHc-k2NZX93Z_gNMIj4ZqKe7g03r40VnbpfLd2exofd_XZRKtqF_EkFfZA~WyJxTGxVdkNKY3hwX3d4MVY5dHFPbFFRIiwidmVyaWZpY2F0aW9uIix7ImV2aWRlbmNlIjpbeyJhdHRlc3RhdGlvbiI6eyJkYXRlX29mX2lzc3VhbmNlIjoiMjAyNS0wNi0yMyIsInZvdWNoZXIiOnsib3JnYW5pemF0aW9uIjoiTWluaXN0ZXJvIGRlbGwnSW50ZXJubyJ9LCJ0eXBlIjoiZGlnaXRhbF9hdHRlc3RhdGlvbiIsInJlZmVyZW5jZV9udW1iZXIiOiIxMjM0NTY3ODkifSwidGltZSI6IjIwMjUtMDYtMjNUMTM6MTQ6MjVaIiwidHlwZSI6InZvdWNoIn1dLCJ0cnVzdF9mcmFtZXdvcmsiOiJpdF9jaWUiLCJhc3N1cmFuY2VfbGV2ZWwiOiJoaWdoIn1d";
const eID =
  "eyJhbGciOiJFUzI1NiIsInR5cCI6InZjK3NkLWp3dCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1hcmlvIFJvc3NpIiwiaWF0IjoxNTE2MjM5MDIyfQ.LAx3X4EpfB8aJj7n8vAk5zX-bYjjmx7Do02NX0p2feO2-TtRTL1DrPZmfBfPCKgyGlteMAv-EZow8bEaOtjcYw";

describe("IT Wallet lifecycle selectors", () => {
  it("should define the INSTALLED state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(true);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(false);
  });

  it("should define the OPERATIONAL state", () => {
    const globalState = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3")
    ]);
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(true);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(false);
  });

  it("should define the VALID state", () => {
    const globalState = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3"),
      itwCredentialsStore([
        {
          credentialType: CredentialType.PID,
          credentialId: "dc_sd_jwt_PersonIdentificationData",
          format: "dc+sd-jwt"
        }
      ] as Array<StoredCredential>)
    ]);
    expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
    expect(itwLifecycleIsValidSelector(globalState)).toEqual(true);
  });

  it.each`
    credential | isWhitelisted | simplifiedActivation | expected
    ${PID}     | ${true}       | ${false}             | ${true}
    ${PID}     | ${true}       | ${true}              | ${false}
    ${PID}     | ${false}      | ${false}             | ${false}
    ${PID}     | ${false}      | ${true}              | ${false}
    ${eID}     | ${false}      | ${false}             | ${false}
  `(
    "should define a valid IT-Wallet instance for whitelist: $isWhitelisted and simplifiedActivation: $simplifiedActivation",
    ({ credential, isWhitelisted, simplifiedActivation, expected }) => {
      const initialState = {
        features: {
          itWallet: {
            preferences: {
              isItwSimplifiedActivationRequired: simplifiedActivation
            }
          }
        }
      } as GlobalState;

      const globalState = reproduceSequence(initialState, appReducer, [
        applicationChangeState("active"),
        itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3"),
        itwSetFiscalCodeWhitelisted(isWhitelisted),
        itwCredentialsStore([
          {
            credentialType: CredentialType.PID,
            credential,
            credentialId: "dc_sd_jwt_PersonIdentificationData",
            format: "dc+sd-jwt",
            verification: {
              assurance_level: "high"
            }
          }
        ] as Array<StoredCredential>)
      ]);
      expect(itwLifecycleIsInstalledSelector(globalState)).toEqual(false);
      expect(itwLifecycleIsOperationalSelector(globalState)).toEqual(false);
      expect(itwLifecycleIsValidSelector(globalState)).toEqual(true);
      expect(itwLifecycleIsITWalletValidSelector(globalState)).toEqual(
        expected
      );
    }
  );
});
