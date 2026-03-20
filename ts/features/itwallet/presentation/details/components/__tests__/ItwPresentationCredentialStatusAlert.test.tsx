import { fireEvent } from "@testing-library/react-native";
import MockDate from "mockdate";
import I18n from "i18next";
import { createStore } from "redux";
import { useIONavigation } from "../../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as bottomSheet from "../../../../../../utils/hooks/bottomSheet.tsx";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../../../common/utils/itwTypesUtils";
import * as selectors from "../../../../credentials/store/selectors";
import { ItwCredentialIssuanceMachineProvider } from "../../../../machine/credential/provider";
import { ITW_ROUTES } from "../../../../navigation/routes";
import {
  CredentialAlertType,
  ItwPresentationCredentialStatusAlert,
  deriveCredentialAlertType
} from "../ItwPresentationCredentialStatusAlert";

const mockTrackItwCredentialTapBanner = jest.fn();
const mockTrackItwCredentialBottomSheet = jest.fn();
const mockTrackItwCredentialBottomSheetAction = jest.fn();
const mockTrackCredentialRenewStart = jest.fn();
const mockBottomSheetPresent = jest.fn();
const mockBottomSheetDismiss = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../../../../../../navigation/params/AppParamsList", () => ({
  ...jest.requireActual("../../../../../../navigation/params/AppParamsList"),
  useIONavigation: jest.fn()
}));

jest.mock("../../analytics", () => ({
  ...jest.requireActual("../../analytics"),
  trackItwCredentialTapBanner: (properties: unknown) =>
    mockTrackItwCredentialTapBanner(properties),
  trackItwCredentialBottomSheet: (properties: unknown) =>
    mockTrackItwCredentialBottomSheet(properties),
  trackItwCredentialBottomSheetAction: (properties: unknown) =>
    mockTrackItwCredentialBottomSheetAction(properties)
}));

jest.mock("../../../../analytics", () => ({
  ...jest.requireActual("../../../../analytics"),
  trackCredentialRenewStart: (credential: unknown, properties: unknown) =>
    mockTrackCredentialRenewStart(credential, properties)
}));

jest.mock("../../../../../../utils/url", () => ({
  openWebUrl: jest.fn()
}));

type TestCaseParams = [
  ItwCredentialStatus,
  Record<string, { title: string; description: string }> | undefined
];

const mockMessage = {
  "it-IT": { title: "__Scaduto__", description: "__Scaduto__" },
  "en-US": { title: "__Expired__", description: "__Expired__" }
};

const mockBottomSheetModal = () => {
  jest.spyOn(bottomSheet, "useIOBottomSheetModal").mockImplementation(
    ({ component }) =>
      ({
        present: mockBottomSheetPresent,
        dismiss: mockBottomSheetDismiss,
        bottomSheet: component
      } as ReturnType<typeof bottomSheet.useIOBottomSheetModal>)
  );
};

describe("ItwPresentationCredentialStatusAlert", () => {
  beforeAll(() => {
    MockDate.set(new Date(2025, 1, 1));
  });

  beforeEach(() => {
    (useIONavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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

  it("should render static copy and double CTA for the expired mDL status", () => {
    const selectorMock: ReturnType<
      typeof selectors.itwCredentialStatusSelector
    > = {
      status: "expired",
      message: mockMessage
    };

    jest
      .spyOn(selectors, "itwCredentialStatusSelector")
      .mockImplementation(() => selectorMock);

    const component = renderComponent();

    expect(component.getByText("Quali documenti devo preparare?")).toBeTruthy();
    expect(component.getByText("Hai già rinnovato il documento?")).toBeTruthy();
    expect(component.getByText("Aggiorna il documento digitale")).toBeTruthy();
    expect(component.getByText("Rimuovi dal Portafoglio")).toBeTruthy();
  });

  it("should render only the double CTA for the invalid mDL status", () => {
    const selectorMock: ReturnType<
      typeof selectors.itwCredentialStatusSelector
    > = {
      status: "invalid",
      message: mockMessage
    };

    jest
      .spyOn(selectors, "itwCredentialStatusSelector")
      .mockImplementation(() => selectorMock);

    const component = renderComponent();

    expect(component.queryByText("Quali documenti devo preparare?")).toBeNull();
    expect(component.queryByText("Hai già rinnovato il documento?")).toBeNull();
    expect(component.getByText("Aggiorna il documento digitale")).toBeTruthy();
    expect(component.getByText("Rimuovi dal Portafoglio")).toBeTruthy();
  });

  it("tracks banner tap and bottom sheet opening for the expiring status alert", () => {
    mockBottomSheetModal();

    const selectorMock: ReturnType<
      typeof selectors.itwCredentialStatusSelector
    > = {
      status: "expiring",
      message: undefined
    };

    jest
      .spyOn(selectors, "itwCredentialStatusSelector")
      .mockImplementation(() => selectorMock);

    const component = renderComponent();

    fireEvent.press(
      component.getByText(
        I18n.t("features.itWallet.presentation.alerts.statusAction")
      )
    );

    expect(mockTrackItwCredentialTapBanner).toHaveBeenCalledWith({
      credential: "ITW_PG_V2",
      credential_status: "expiring"
    });
    expect(mockTrackItwCredentialBottomSheet).toHaveBeenCalledWith({
      credential: "ITW_PG_V2",
      credential_status: "expiring"
    });
  });

  it("tracks the informational bottom sheet CTA for the expiring status alert", () => {
    mockBottomSheetModal();

    const selectorMock: ReturnType<
      typeof selectors.itwCredentialStatusSelector
    > = {
      status: "expiring",
      message: undefined
    };

    jest
      .spyOn(selectors, "itwCredentialStatusSelector")
      .mockImplementation(() => selectorMock);

    const component = renderComponent();

    fireEvent.press(
      component.getByText(
        I18n.t("features.itWallet.presentation.bottomSheets.mDL.expiring.cta")
      )
    );

    expect(mockTrackItwCredentialBottomSheetAction).toHaveBeenCalledWith({
      credential: "ITW_PG_V2",
      credential_status: "expiring"
    });
  });

  it("tracks renew start from the expired or invalid bottom sheet update CTA", () => {
    mockBottomSheetModal();

    const selectorMock: ReturnType<
      typeof selectors.itwCredentialStatusSelector
    > = {
      status: "invalid",
      message: mockMessage
    };

    jest
      .spyOn(selectors, "itwCredentialStatusSelector")
      .mockImplementation(() => selectorMock);

    const component = renderComponent();

    fireEvent.press(component.getByText("Aggiorna il documento digitale"));

    expect(mockTrackCredentialRenewStart).toHaveBeenCalledWith("ITW_PG_V2", {
      credential_status: "not_valid",
      position: "bottom_sheet"
    });
    expect(mockTrackItwCredentialBottomSheetAction).not.toHaveBeenCalled();
  });
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
    },
    spec_version: "1.0.0"
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
