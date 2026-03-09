import configureMockStore from "redux-mock-store";
import { createActor } from "xstate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as remoteConfigSelectors from "../../../../common/store/selectors/remoteConfig";
import {
  EidIssuanceLevel,
  EidIssuanceMode
} from "../../../../machine/eid/context.ts";
import { itwEidIssuanceMachine } from "../../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../../navigation/routes";
import {
  ItwIdentificationModeSelectionScreen,
  ItwIdentificationModeSelectionScreenProps
} from "../ItwIdentificationModeSelectionScreen.tsx";

jest.mock("../../../../../../config", () => ({
  itwEnabled: true
}));

describe("ItwIdentificationModeSelectionScreen", () => {
  beforeEach(() => {
    // Default mock for no disabled methods
    jest
      .spyOn(remoteConfigSelectors, "itwDisabledIdentificationMethodsSelector")
      .mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("[issuance, l2] should show CiePin, CieId and SPID authentication methods", () => {
    const component = renderComponent("issuance", "l2");

    expect(component.queryByTestId("CiePinMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("SpidMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CieIDMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CiePinRecommendedBadgeTestID")).toBeNull();
    expect(component.queryByTestId("noCieButtonTestID")).toBeNull();
  });

  it("[issuance, l2-fallback] should show CieId and SPID authentication methods", () => {
    const component = renderComponent("issuance", "l2-fallback");

    expect(component.queryByTestId("CiePinMethodModuleTestID")).toBeNull();
    expect(component.queryByTestId("SpidMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CieIDMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CiePinRecommendedBadgeTestID")).toBeNull();
    expect(component.queryByTestId("noCieButtonTestID")).toBeNull();
  });

  it("[issuance, l3] should show CiePin (w/badge), CieId and SPID authentication methods", () => {
    const component = renderComponent("issuance", "l3");

    expect(component.queryByTestId("CiePinMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("SpidMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CieIDMethodModuleTestID")).not.toBeNull();
    expect(
      component.queryByTestId("CiePinRecommendedBadgeTestID")
    ).not.toBeNull();
    expect(component.queryByTestId("noCieButtonTestID")).not.toBeNull();
  });

  it("[reissuance, l2] should show frequency headers and list CiePin(without badge), CieId and SPID authentication methods", () => {
    const component = renderComponent("reissuance", "l2");

    expect(component.queryByText("Ogni 12 mesi")).not.toBeNull();
    expect(component.queryByText("Ogni 90 giorni")).not.toBeNull();
    expect(
      component.queryByTestId("CiePinReissuanceBadgeTestID")
    ).not.toBeNull();
    expect(component.queryByTestId("CiePinMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("SpidMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CieIDMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CiePinRecommendedBadgeTestID")).toBeNull();
    expect(component.queryByTestId("noCieButtonTestID")).toBeNull();
  });

  it("[reissuance, l3] should show frequency headers and list CiePin(without badge), CieId and SPID authentication methods", () => {
    const component = renderComponent("reissuance", "l3");

    expect(component.queryByText("Ogni 12 mesi")).not.toBeNull();
    expect(component.queryByText("Ogni 90 giorni")).not.toBeNull();
    expect(
      component.queryByTestId("CiePinReissuanceBadgeTestID")
    ).not.toBeNull();
    expect(component.queryByTestId("CiePinMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("SpidMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CieIDMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CiePinRecommendedBadgeTestID")).toBeNull();
    expect(component.queryByTestId("noCieButtonTestID")).toBeNull();
  });

  it("should not show CiePin method when it is disabled", () => {
    jest
      .spyOn(remoteConfigSelectors, "itwDisabledIdentificationMethodsSelector")
      .mockReturnValue(["CiePin"]);

    const component = renderComponent("issuance", "l2");

    expect(component.queryByTestId("CiePinMethodModuleTestID")).toBeNull();
    expect(component.queryByTestId("SpidMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CieIDMethodModuleTestID")).not.toBeNull();
  });

  it("should not show SPID method when it is disabled", () => {
    jest
      .spyOn(remoteConfigSelectors, "itwDisabledIdentificationMethodsSelector")
      .mockReturnValue(["SPID"]);

    const component = renderComponent("issuance", "l2");

    expect(component.queryByTestId("CiePinMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("SpidMethodModuleTestID")).toBeNull();
    expect(component.queryByTestId("CieIDMethodModuleTestID")).not.toBeNull();
  });

  it("should not show CieId method when it is disabled", () => {
    jest
      .spyOn(remoteConfigSelectors, "itwDisabledIdentificationMethodsSelector")
      .mockReturnValue(["CieID"]);

    const component = renderComponent("issuance", "l2");

    expect(component.queryByTestId("CiePinMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("SpidMethodModuleTestID")).not.toBeNull();
    expect(component.queryByTestId("CieIDMethodModuleTestID")).toBeNull();
  });
});

const renderComponent = (mode: EidIssuanceMode, level: EidIssuanceLevel) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const WrappedComponent = (
    props: ItwIdentificationModeSelectionScreenProps
  ) => {
    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn(),
        navigateToIdentificationScreen: () => undefined
      }
    });

    const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
    const snapshot: typeof initialSnapshot = {
      ...initialSnapshot,
      value: { UserIdentification: "Identification" },
      context: {
        ...initialSnapshot.context,
        mode,
        level,
        cieContext: {
          isNFCEnabled: true,
          isCIEAuthenticationSupported: true
        }
      }
    };

    return (
      <ItwEidIssuanceMachineContext.Provider
        logic={logic}
        options={{ snapshot }}
      >
        <ItwIdentificationModeSelectionScreen {...props} />
      </ItwEidIssuanceMachineContext.Provider>
    );
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WrappedComponent,
    ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
    { eidReissuing: mode === "reissuance" },
    store
  );
};
