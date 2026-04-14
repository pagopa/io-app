import I18n from "i18next";
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

const every12Months = () =>
  I18n.t(
    "features.itWallet.identification.modeSelection.frequency.every12Months"
  );
const every90Days = () =>
  I18n.t(
    "features.itWallet.identification.modeSelection.frequency.every90Days"
  );

describe("ItwIdentificationModeSelectionScreen", () => {
  beforeEach(() => {
    jest
      .spyOn(remoteConfigSelectors, "itwDisabledIdentificationMethodsSelector")
      .mockReturnValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("[issuance, l2] shows all L2 methods, no badges, no noCie button", () => {
    const { queryByTestId } = renderComponent("issuance", "l2");

    expect(queryByTestId("CiePinMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("CiePinRecommendedBadgeTestID")).toBeNull();
    expect(queryByTestId("noCieButtonTestID")).toBeNull();
  });

  it("[issuance, l2-fallback] hides CiePin, shows SPID and CieID", () => {
    const { queryByTestId } = renderComponent("issuance", "l2-fallback");

    expect(queryByTestId("CiePinMethodModuleTestIDL2")).toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL2")).not.toBeNull();
  });

  it("[issuance, l3] shows all L3 methods with the recommended badge and the noCie button", () => {
    const { queryByTestId } = renderComponent("issuance", "l3");

    expect(queryByTestId("CiePinMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("CiePinRecommendedBadgeTestID")).not.toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("noCieButtonTestID")).not.toBeNull();
    expect(queryByTestId("CiePinReissuanceBadgeTestID")).toBeNull();
  });

  it("[reissuance, l2] shows all L2 methods, no frequency headers", () => {
    const { queryByTestId, queryByText } = renderComponent("reissuance", "l2");

    expect(queryByTestId("CiePinMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByText(every12Months())).toBeNull();
    expect(queryByText(every90Days())).toBeNull();
  });

  it("[reissuance, l3] shows all L3 methods with frequency headers and reissuance badge, no noCie button", () => {
    const { queryByTestId, queryByText } = renderComponent("reissuance", "l3");

    expect(queryByTestId("CiePinMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByText(every12Months())).not.toBeNull();
    expect(queryByText(every90Days())).not.toBeNull();
    expect(queryByTestId("CiePinReissuanceBadgeTestID")).not.toBeNull();
    expect(queryByTestId("noCieButtonTestID")).toBeNull();
  });

  describe("disabled identification methods", () => {
    it("hides CiePin when disabled", () => {
      jest
        .spyOn(
          remoteConfigSelectors,
          "itwDisabledIdentificationMethodsSelector"
        )
        .mockReturnValue(["CiePin"]);
      const { queryByTestId } = renderComponent("issuance", "l2");

      expect(queryByTestId("CiePinMethodModuleTestIDL2")).toBeNull();
      expect(queryByTestId("SpidMethodModuleTestIDL2")).not.toBeNull();
      expect(queryByTestId("CieIDMethodModuleTestIDL2")).not.toBeNull();
    });

    it("hides SPID when disabled", () => {
      jest
        .spyOn(
          remoteConfigSelectors,
          "itwDisabledIdentificationMethodsSelector"
        )
        .mockReturnValue(["SPID"]);
      const { queryByTestId } = renderComponent("issuance", "l2");

      expect(queryByTestId("CiePinMethodModuleTestIDL2")).not.toBeNull();
      expect(queryByTestId("SpidMethodModuleTestIDL2")).toBeNull();
      expect(queryByTestId("CieIDMethodModuleTestIDL2")).not.toBeNull();
    });

    it("hides CieID when disabled", () => {
      jest
        .spyOn(
          remoteConfigSelectors,
          "itwDisabledIdentificationMethodsSelector"
        )
        .mockReturnValue(["CieID"]);
      const { queryByTestId } = renderComponent("issuance", "l2");

      expect(queryByTestId("CiePinMethodModuleTestIDL2")).not.toBeNull();
      expect(queryByTestId("SpidMethodModuleTestIDL2")).not.toBeNull();
      expect(queryByTestId("CieIDMethodModuleTestIDL2")).toBeNull();
    });
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
