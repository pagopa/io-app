import _ from "lodash";
import MockDate from "mockdate";

import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../../../common/utils/itwMocksUtils";
import {
  CredentialFormat,
  CredentialMetadata,
  ItwJwtCredentialStatus
} from "../../../../../common/utils/itwTypesUtils";
import {
  areAllPresentableCredentialsExpired,
  isPresentableCredentialSelector,
  shouldShowExpiredProximityCredentialsBannerSelector
} from "../credentials";

describe("proximity selectors", () => {
  afterEach(() => {
    MockDate.reset();
  });

  describe("isPresentableCredentialSelector", () => {
    const mdlMdoc: CredentialMetadata = {
      ...ItwStoredCredentialsMocks.mdl,
      credentialId: "mso_mdoc_mDL",
      format: CredentialFormat.MDOC
    };
    const mdlSdJwt: CredentialMetadata = {
      ...ItwStoredCredentialsMocks.mdl,
      format: CredentialFormat.SD_JWT
    };
    const ehicMdoc: CredentialMetadata = {
      ...ItwStoredCredentialsMocks.ts,
      format: CredentialFormat.MDOC
    };
    const scenarios = [
      {
        name: "an allowed credential is stored as MDOC",
        credentialType: CredentialType.DRIVING_LICENSE,
        credentials: [mdlMdoc, ehicMdoc],
        expected: true
      },
      {
        name: "an allowed credential is stored in both formats",
        credentialType: CredentialType.DRIVING_LICENSE,
        credentials: [mdlSdJwt, mdlMdoc],
        expected: true
      },
      {
        name: "another allowed credential is stored as MDOC",
        credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
        credentials: [
          { ...ItwStoredCredentialsMocks.dc, format: CredentialFormat.MDOC }
        ],
        expected: true
      },
      {
        name: "the European Health Insurance Card is stored as MDOC",
        credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
        credentials: [ehicMdoc, mdlMdoc],
        expected: false
      },
      {
        name: "an allowed credential is stored only as SD-JWT",
        credentialType: CredentialType.DRIVING_LICENSE,
        credentials: [mdlSdJwt],
        expected: false
      },
      {
        name: "the wallet has no credentials",
        credentialType: CredentialType.DRIVING_LICENSE,
        credentials: [],
        expected: false
      },
      {
        name: "the requested credential type is not stored",
        credentialType: CredentialType.PROOF_OF_AGE,
        credentials: [mdlMdoc],
        expected: false
      }
    ];

    test.each(scenarios)(
      "returns $expected when $name",
      ({ credentialType, credentials, expected }) => {
        const initialState = appReducer(
          undefined,
          applicationChangeState("active")
        );
        const state: GlobalState = _.merge({}, initialState, {
          features: {
            itWallet: {
              credentials: {
                credentials: Object.fromEntries(
                  credentials.map(credential => [
                    credential.credentialId,
                    credential
                  ])
                )
              }
            }
          }
        });

        expect(isPresentableCredentialSelector(credentialType)(state)).toBe(
          expected
        );
      }
    );
  });

  it("detects when all presentable credentials are expired", () => {
    MockDate.set(new Date(2024, 0, 20));

    const expiredMdl: CredentialMetadata = {
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

  it("does not show the banner when at least one presentable credential is valid", () => {
    MockDate.set(new Date(2024, 0, 20));

    const validMdl: CredentialMetadata = {
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
      validity: {
        type: "status_assertion",
        status: "valid",
        statusAssertion: {} as any
      }
    };
    expect(
      shouldShowExpiredProximityCredentialsBannerSelector.resultFunc(
        "jwtExpired",
        {
          "org.iso.18013.5.1.mDL": validMdl
        }
      )
    ).toBe(false);
  });

  it("shows the banner when PID is expired and all presentable credentials are expired", () => {
    MockDate.set(new Date(2024, 0, 20));

    const expiredMdl: CredentialMetadata = {
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
      shouldShowExpiredProximityCredentialsBannerSelector.resultFunc(
        "jwtExpired",
        {
          "org.iso.18013.5.1.mDL": expiredMdl
        }
      )
    ).toBe(true);
  });

  describe("expired credentials banner with a complete wallet state", () => {
    beforeEach(() => {
      MockDate.set(new Date(2024, 0, 20));
    });

    const getCredentialWithJwtStatus = (
      credential: CredentialMetadata,
      status: ItwJwtCredentialStatus
    ): CredentialMetadata => ({
      ...credential,
      jwt: {
        ...credential.jwt,
        expiration:
          status === "jwtExpired"
            ? "2024-01-10T00:00:00Z"
            : "2025-01-20T00:00:00Z"
      },
      validity: undefined
    });

    const pid: CredentialMetadata = {
      ...ItwStoredCredentialsMocks.eid,
      credentialId: "dc_sd_jwt_pid",
      credentialType: "pid",
      format: CredentialFormat.SD_JWT,
      parsedCredential: {}
    };

    const mdlSdJwt: CredentialMetadata = {
      ...ItwStoredCredentialsMocks.mdl,
      credentialId: "dc_sd_jwt_mDL",
      credentialType: "mDL",
      format: CredentialFormat.SD_JWT,
      parsedCredential: {
        expiry_date: {
          name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
          value: "2034-12-31"
        }
      }
    };

    const mdlMdoc: CredentialMetadata = {
      ...mdlSdJwt,
      credentialId: "mso_mdoc_mDL",
      format: CredentialFormat.MDOC,
      issuerConf: {
        credential_configurations_supported: {
          mso_mdoc_mDL: {
            doctype: "org.iso.18013.5.1.mDL",
            format: CredentialFormat.MDOC
          }
        }
      } as unknown as CredentialMetadata["issuerConf"]
    };

    const getState = (
      pidStatus: ItwJwtCredentialStatus,
      mdlSdJwtStatus: ItwJwtCredentialStatus,
      mdlMdocStatus: ItwJwtCredentialStatus
    ): GlobalState => {
      const credentials = [
        getCredentialWithJwtStatus(pid, pidStatus),
        getCredentialWithJwtStatus(mdlSdJwt, mdlSdJwtStatus),
        getCredentialWithJwtStatus(mdlMdoc, mdlMdocStatus)
      ];
      const initialState = appReducer(
        undefined,
        applicationChangeState("active")
      );

      return _.merge({}, initialState, {
        features: {
          itWallet: {
            credentials: {
              credentials: Object.fromEntries(
                credentials.map(credential => [
                  credential.credentialId,
                  credential
                ])
              )
            }
          }
        }
      });
    };

    test.each`
      name                                                   | pidStatus       | mdlSdJwtStatus  | mdlMdocStatus   | expected
      ${"PID and both mDL formats are expired"}              | ${"jwtExpired"} | ${"jwtExpired"} | ${"jwtExpired"} | ${true}
      ${"the mDL SD-JWT is expired but the mDoc is valid"}   | ${"jwtExpired"} | ${"jwtExpired"} | ${"valid"}      | ${false}
      ${"both mDL formats are expired but the PID is valid"} | ${"valid"}      | ${"jwtExpired"} | ${"jwtExpired"} | ${false}
    `(
      "returns $expected when $name",
      ({
        expected,
        mdlMdocStatus,
        mdlSdJwtStatus,
        pidStatus
      }: {
        expected: boolean;
        mdlMdocStatus: ItwJwtCredentialStatus;
        mdlSdJwtStatus: ItwJwtCredentialStatus;
        name: string;
        pidStatus: ItwJwtCredentialStatus;
      }) => {
        const state = getState(pidStatus, mdlSdJwtStatus, mdlMdocStatus);

        expect(shouldShowExpiredProximityCredentialsBannerSelector(state)).toBe(
          expected
        );
      }
    );
  });
});
