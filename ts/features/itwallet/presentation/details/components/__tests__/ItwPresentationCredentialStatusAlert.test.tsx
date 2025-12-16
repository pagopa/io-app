import { createStore } from "redux";
import MockDate from "mockdate";
import {
  CredentialAlertType,
  ItwPresentationCredentialStatusAlert,
  deriveCredentialAlertType
} from "../ItwPresentationCredentialStatusAlert";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import { ITW_ROUTES } from "../../../../navigation/routes";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../../../common/utils/itwTypesUtils";
import * as selectors from "../../../../credentials/store/selectors";
import { ItwCredentialIssuanceMachineProvider } from "../../../../machine/credential/provider";

type TestCaseParams = [
  ItwCredentialStatus,
  Record<string, { title: string; description: string }> | undefined
];

const mockMessage = {
  "it-IT": { title: "__Scaduto__", description: "__Scaduto__" },
  "en-US": { title: "__Expired__", description: "__Expired__" }
};

describe("ItwPresentationCredentialStatusAlert", () => {
  beforeAll(() => {
    MockDate.set(new Date(2025, 1, 1));
  });

  afterAll(() => {
    MockDate.reset();
  });

  test.each([
    ["jwtExpiring", undefined],
    ["jwtExpired", undefined],
    ["expiring", undefined],
    ["expired", undefined],
    ["invalid", mockMessage],
    [
      "invalid",
      { "it-IT": { title: "__Scaduto__", description: "__Scaduto__" } }
    ],
    ["invalid", { "ko-KO": { title: "__만료됨__", description: "__만료됨__" } }]
  ] as ReadonlyArray<TestCaseParams>)(
    "should match snapshot when the status is %s and the message is %s",
    (credentialStatus, message) => {
      const selectorMock: ReturnType<
        typeof selectors.itwCredentialStatusSelector
      > = { status: credentialStatus, message };
      jest
        .spyOn(selectors, "itwCredentialStatusSelector")
        .mockImplementation(() => selectorMock);

      const component = renderComponent();
      expect(component).toMatchSnapshot();
    }
  );

  it.each`
    credentialStatus | eidStatus        | isOffline | isItwL3  | message        | expected
    ${"jwtExpiring"} | ${"jwtExpiring"} | ${false}  | ${false} | ${undefined}   | ${undefined}
    ${"jwtExpiring"} | ${"jwtExpired"}  | ${false}  | ${false} | ${undefined}   | ${undefined}
    ${"jwtExpired"}  | ${"jwtExpired"}  | ${false}  | ${false} | ${undefined}   | ${CredentialAlertType.EID_LIFECYCLE}
    ${"expiring"}    | ${"jwtExpired"}  | ${false}  | ${false} | ${undefined}   | ${CredentialAlertType.DOCUMENT_EXPIRING}
    ${"expired"}     | ${"jwtExpired"}  | ${false}  | ${false} | ${mockMessage} | ${CredentialAlertType.ISSUER_DYNAMIC_ERROR}
    ${"expired"}     | ${"jwtExpired"}  | ${false}  | ${false} | ${undefined}   | ${CredentialAlertType.DOCUMENT_EXPIRED}
    ${"jwtExpiring"} | ${"valid"}       | ${false}  | ${false} | ${undefined}   | ${CredentialAlertType.JWT_VERIFICATION}
    ${"jwtExpired"}  | ${"valid"}       | ${false}  | ${false} | ${undefined}   | ${CredentialAlertType.JWT_VERIFICATION}
    ${"valid"}       | ${"jwtExpiring"} | ${true}   | ${false} | ${undefined}   | ${undefined}
    ${"jwtExpiring"} | ${"valid"}       | ${true}   | ${false} | ${undefined}   | ${undefined}
    ${"jwtExpired"}  | ${"valid"}       | ${true}   | ${false} | ${undefined}   | ${CredentialAlertType.EID_LIFECYCLE}
    ${"expired"}     | ${"valid"}       | ${true}   | ${false} | ${undefined}   | ${CredentialAlertType.DOCUMENT_EXPIRED}
    ${"jwtExpired"}  | ${"jwtExpired"}  | ${true}   | ${false} | ${undefined}   | ${CredentialAlertType.EID_LIFECYCLE}
  `(
    "returns $expected when credential=$credentialStatus, eid=$eidStatus, offline=$isOffline, itwL3=$isItwL3",
    ({
      credentialStatus,
      eidStatus,
      isOffline,
      isItwL3,
      expected,
      message
    }) => {
      const result = deriveCredentialAlertType({
        credentialStatus,
        eidStatus,
        isOffline,
        isItwL3,
        message
      });
      expect(result).toBe(expected);
    }
  );
});

function renderComponent() {
  const mockedMdl: StoredCredential = {
    credential: "",
    credentialType: "mDL",
    credentialId: "dc_sd_jwt_mDL",
    parsedCredential: {
      expiry_date: { value: "2100-09-04", name: "exp" }
    },
    format: "dc+sd-jwt",
    keyTag: "1",
    issuerConf: {} as StoredCredential["issuerConf"],
    jwt: {
      issuedAt: "2024-09-30T07:32:49.000Z",
      expiration: "2100-09-04T00:00:00.000Z"
    }
  };

  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineProvider>
        <ItwPresentationCredentialStatusAlert credential={mockedMdl} />
      </ItwCredentialIssuanceMachineProvider>
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, globalState as any)
  );
}
