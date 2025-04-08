import { createStore } from "redux";
import MockDate from "mockdate";
import { ItwPresentationCredentialStatusAlert } from "../ItwPresentationCredentialStatusAlert";
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
import { ItWalletIssuanceMachineProvider } from "../../../../machine/provider";

type TestCaseParams = [
  ItwCredentialStatus,
  Record<string, { title: string; description: string }> | undefined
];

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
    [
      "invalid",
      {
        "it-IT": { title: "__Scaduto__", description: "__Scaduto__" },
        "en-US": { title: "__Expired__", description: "__Expired__" }
      }
    ],
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
});

function renderComponent() {
  const mockedMdl: StoredCredential = {
    credential: "",
    credentialType: "MDL",
    parsedCredential: {
      expiry_date: { value: "2100-09-04", name: "exp" }
    },
    format: "vc+sd-jwt",
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
      <ItWalletIssuanceMachineProvider>
        <ItwPresentationCredentialStatusAlert credential={mockedMdl} />
      </ItWalletIssuanceMachineProvider>
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, globalState as any)
  );
}
