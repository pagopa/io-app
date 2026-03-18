import MockDate from "mockdate";
import { ItwStoredCredentialsMocks } from "../../../../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../../../../common/utils/itwTypesUtils";
import {
  areAllPresentableCredentialsExpired,
  shouldBlockProximityQrCodeSelector
} from "../index";

describe("proximity selectors", () => {
  afterEach(() => {
    MockDate.reset();
  });

  it("detects when all presentable credentials are expired", () => {
    MockDate.set(new Date(2024, 0, 20));

    const expiredMdl: StoredCredential = {
      ...ItwStoredCredentialsMocks.mdl,
      jwt: {
        expiration: "2024-01-10T00:00:00Z"
      },
      parsedCredential: {
        expiry_date: {
          name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
          value: "2034-12-31"
        }
      }
    };

    expect(
      areAllPresentableCredentialsExpired({
        "org.iso.18013.5.1.mDL": expiredMdl
      })
    ).toBe(true);
  });

  it("does not block when at least one presentable credential is valid", () => {
    MockDate.set(new Date(2024, 0, 20));

    const validMdl: StoredCredential = {
      ...ItwStoredCredentialsMocks.mdl,
      jwt: {
        expiration: "2025-01-20T00:00:00Z"
      },
      parsedCredential: {
        expiry_date: {
          name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
          value: "2034-12-31"
        }
      },
      // @ts-expect-error partial type for test fixture
      storedStatusAssertion: { credentialStatus: "valid" }
    };
    expect(
      shouldBlockProximityQrCodeSelector.resultFunc("jwtExpired", {
        "org.iso.18013.5.1.mDL": validMdl
      })
    ).toBe(false);
  });

  it("blocks when PID is expired and all presentable credentials are expired", () => {
    MockDate.set(new Date(2024, 0, 20));

    const expiredMdl: StoredCredential = {
      ...ItwStoredCredentialsMocks.mdl,
      jwt: {
        expiration: "2024-01-10T00:00:00Z"
      },
      parsedCredential: {
        expiry_date: {
          name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
          value: "2034-12-31"
        }
      }
    };

    expect(
      shouldBlockProximityQrCodeSelector.resultFunc("jwtExpired", {
        "org.iso.18013.5.1.mDL": expiredMdl
      })
    ).toBe(true);
  });
});
