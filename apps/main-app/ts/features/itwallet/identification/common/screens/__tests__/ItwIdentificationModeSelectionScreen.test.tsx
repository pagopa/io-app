import { fireEvent, waitFor } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as remoteConfigSelectors from "../../../../common/store/selectors/remoteConfig";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import { navigateToTosScreenAction } from "../../../../machine/eid/actions";
import {
  EidIssuanceLevel,
  EidIssuanceMode
} from "../../../../machine/eid/context.ts";
import { itwEidIssuanceMachine } from "../../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../../machine/eid/provider";
import { testEidIssuanceDeps } from "../../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../../navigation/routes";
import * as identificationSelectors from "../../store/selectors";
import {
  ItwIdentificationModeSelectionScreen,
  ItwIdentificationModeSelectionScreenProps
} from "../ItwIdentificationModeSelectionScreen.tsx";

jest.mock("../../../../../../config", () => ({
  itwEnabled: true
}));

const mockNavigate = jest.fn();
const mockNavigateToTos = jest.fn(navigateToTosScreenAction);

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
      .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockReturnValue(false);
    jest
      .spyOn(remoteConfigSelectors, "itwDisabledIdentificationMethodsSelector")
      .mockReturnValue([]);
    jest
      .spyOn(identificationSelectors, "itwHasNfcFeatureSelector")
      .mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("[issuance, l2] shows all L2 methods and no noCie button", () => {
    const { queryByTestId } = renderComponent("issuance", "l2");

    expect(queryByTestId("CiePinMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("noCieButtonTestID")).toBeNull();
  });

  it("[issuance, l2-fallback] hides CiePin, shows SPID and CieID", () => {
    const { queryByTestId } = renderComponent("issuance", "l2-fallback");

    expect(queryByTestId("CiePinMethodModuleTestIDL2")).toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL2")).not.toBeNull();
  });
  it("[issuance, l2] hides CIE+PIN when NFC is unavailable", () => {
    jest
      .spyOn(identificationSelectors, "itwHasNfcFeatureSelector")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent("issuance", "l2");

    expect(queryByTestId("CiePinMethodModuleTestIDL2")).toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL2")).not.toBeNull();
  });

  it("[issuance, l3] shows all L3 methods and the noCie button", () => {
    const { queryByTestId } = renderComponent("issuance", "l3");

    expect(queryByTestId("CiePinMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("noCieButtonTestID")).not.toBeNull();
  });

  it("[reissuance, l2] shows all L2 methods, no frequency headers", () => {
    const { queryByTestId, queryByText } = renderComponent("reissuance", "l2");

    expect(queryByTestId("CiePinMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL2")).not.toBeNull();
    expect(queryByText(every12Months())).toBeNull();
    expect(queryByText(every90Days())).toBeNull();
  });

  it("[reissuance, l3] shows all L3 methods with frequency headers and no noCie button", () => {
    const { queryByTestId, queryByText } = renderComponent("reissuance", "l3");

    expect(queryByTestId("CiePinMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("SpidMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByTestId("CieIDMethodModuleTestIDL3")).not.toBeNull();
    expect(queryByText(every12Months())).not.toBeNull();
    expect(queryByText(every90Days())).not.toBeNull();
    expect(queryByTestId("noCieButtonTestID")).toBeNull();
  });

  it.each([
    { name: "banner", credentialType: undefined },
    { name: "L3 credential", credentialType: CredentialType.EDUCATION_DEGREE },
    { name: "unknown credential", credentialType: "unsupported-credential" },
    { name: "driving licence", credentialType: CredentialType.DRIVING_LICENSE },
    {
      name: "disability card",
      credentialType: CredentialType.EUROPEAN_DISABILITY_CARD
    },
    {
      name: "health insurance card",
      credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
    }
  ])(
    "opens fallback discovery from $name when the user has no CIE",
    async ({ credentialType }) => {
      const { getByTestId } = renderComponent("issuance", "l3", credentialType);

      fireEvent.press(getByTestId("noCieButtonTestID"));

      const supportedTypes: ReadonlyArray<string> = [
        CredentialType.DRIVING_LICENSE,
        CredentialType.EUROPEAN_DISABILITY_CARD,
        CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
      ];
      expect(mockNavigateToTos).toHaveBeenCalledWith(
        expect.objectContaining({
          context: expect.objectContaining({
            credentialType:
              credentialType && supportedTypes.includes(credentialType)
                ? credentialType
                : undefined
          })
        }),
        undefined
      );

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.DISCOVERY.INFO,
          params: { level: "l2-fallback" }
        })
      );
    }
  );

  it.each([
    { name: "L3 credential", credentialType: CredentialType.EDUCATION_DEGREE },
    { name: "unknown credential", credentialType: "unsupported-credential" },
    {
      name: "Doc su IO credential",
      credentialType: CredentialType.DRIVING_LICENSE
    }
  ])(
    "shows the CIE warning for $name when Doc su IO is already active",
    async ({ credentialType }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(true);
      const { getByTestId } = renderComponent("issuance", "l3", credentialType);

      fireEvent.press(getByTestId("noCieButtonTestID"));

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.IDENTIFICATION.CIE_WARNING,
          params: {
            type: "card",
            routeName: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION
          }
        })
      );
    }
  );

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

const renderComponent = (
  mode: EidIssuanceMode,
  level: EidIssuanceLevel,
  credentialType?: string
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  const WrappedComponent = (
    props: ItwIdentificationModeSelectionScreenProps
  ) => {
    const logic = itwEidIssuanceMachine.provide({
      actions: {
        onInit: jest.fn(),
        navigateToTosScreen: mockNavigateToTos,
        navigateToIdentificationScreen: () => undefined
      }
    });

    const initialSnapshot = createActor(logic, {
      input: {
        deps: {
          ...testEidIssuanceDeps(),
          navigation: {
            ...testEidIssuanceDeps().navigation,
            navigate: mockNavigate
          }
        }
      }
    }).getSnapshot();
    const snapshot: typeof initialSnapshot = {
      ...initialSnapshot,
      value: { UserIdentification: "Identification" },
      context: {
        ...initialSnapshot.context,
        mode,
        level,
        credentialType,
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
