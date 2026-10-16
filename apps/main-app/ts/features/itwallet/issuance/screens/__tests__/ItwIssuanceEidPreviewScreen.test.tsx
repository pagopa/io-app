import I18n from "i18next";
import { createStore } from "redux";
import { createActor, type StateFrom } from "xstate";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import {
  ItwEidIssuanceMachine,
  itwEidIssuanceMachine
} from "../../../machine/eid/machine";
import { ItwTags } from "../../../machine/tags";
import {
  testEidIssuanceDeps,
  testMachineStore
} from "../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../navigation/routes";
import {
  trackCredentialPreview,
  trackItwRequestSuccess
} from "../../analytics";
import { ItwIssuanceEidPreviewScreen } from "../ItwIssuanceEidPreviewScreen";

const mockSend = jest.fn();
const mockUseSelector = jest.fn();

jest.mock("../../analytics", () => ({
  ...jest.requireActual("../../analytics"),
  trackCredentialPreview: jest.fn(),
  trackItwRequestSuccess: jest.fn()
}));

type MachineSelector<T> = (snapshot: MachineSnapshot) => T;
type MachineSnapshot = StateFrom<ItwEidIssuanceMachine>;

jest.mock("../../../machine/eid/provider", () => {
  const actual = jest.requireActual("../../../machine/eid/provider");
  return {
    ...actual,
    ItwEidIssuanceMachineContext: {
      ...actual.ItwEidIssuanceMachineContext,
      useActorRef: () => ({ send: mockSend }),
      useSelector: <T,>(selector: MachineSelector<T>) =>
        mockUseSelector(selector)
    }
  };
});

describe("ItwIssuanceEidPreviewScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the loading content while the issued eID identity is still being checked", () => {
    const { getByText, queryByText } = renderComponent({
      value: { Issuance: "CheckingIdentityMatch" },
      tags: new Set([ItwTags.Loading])
    });

    expect(getByText(I18n.t("global.genericWaiting"))).toBeTruthy();
    expect(
      queryByText(I18n.t("features.itWallet.issuance.eidPreview.title"))
    ).toBeNull();
    expect(trackCredentialPreview).not.toHaveBeenCalled();
    expect(trackItwRequestSuccess).not.toHaveBeenCalled();
  });

  it("tracks an L3 eID when IT-Wallet is activated with CieID L2", () => {
    renderComponent({
      value: { Issuance: "DisplayingPreview" },
      tags: new Set(),
      level: "l3",
      identification: { level: "L2", mode: "cieId" }
    });

    expect(trackItwRequestSuccess).toHaveBeenCalledWith("cieid_L2", "L3", "L3");
  });

  it.each([
    { mode: "issuance" as const, isDisclaimerVisible: true },
    { mode: "reissuance" as const, isDisclaimerVisible: false }
  ])(
    "renders the L3 upgrade disclaimer for $mode",
    ({ mode, isDisclaimerVisible }) => {
      const { queryByTestId } = renderComponent({
        value: { Issuance: "DisplayingPreview" },
        tags: new Set(),
        level: "l3",
        mode
      });

      if (isDisclaimerVisible) {
        expect(queryByTestId("credentialUpgradeDisclaimerTestID")).toBeTruthy();
      } else {
        expect(queryByTestId("credentialUpgradeDisclaimerTestID")).toBeNull();
      }
    }
  );
});

const renderComponent = ({
  value,
  tags,
  level = "l2",
  mode,
  identification
}: {
  identification?: { level: "L2"; mode: "cieId" };
  level?: "l2" | "l3";
  mode?: "issuance" | "reissuance" | "upgrade";
  tags: Set<ItwTags>;
  value: { Issuance: "CheckingIdentityMatch" | "DisplayingPreview" };
}) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwEidIssuanceMachine, {
    input: {
      deps: testEidIssuanceDeps({
        store: testMachineStore({ getState: () => initialState })
      })
    }
  }).getSnapshot();
  const snapshot: MachineSnapshot = {
    ...initialSnapshot,
    value,
    tags,
    context: {
      ...initialSnapshot.context,
      level,
      mode,
      identification,
      eid: {
        credential: "",
        metadata: {
          ...ItwStoredCredentialsMocks.eid,
          spec_version: level === "l3" ? "1.3.3" : "1.0.0",
          verification:
            level === "l3"
              ? { assurance_level: "high", trust_framework: "it_wallet" }
              : undefined
        }
      }
    }
  };

  mockUseSelector.mockImplementation((selector: MachineSelector<unknown>) =>
    selector(snapshot)
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ItwIssuanceEidPreviewScreen />,
    ITW_ROUTES.ISSUANCE.EID_PREVIEW,
    {},
    createStore(appReducer, initialState as any)
  );
};
