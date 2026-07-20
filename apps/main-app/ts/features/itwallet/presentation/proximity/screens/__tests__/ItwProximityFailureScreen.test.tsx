import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as bottomSheet from "../../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as url from "../../../../../../utils/url";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ProximityFailure, ProximityFailureType } from "../../machine/failure";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { TimeoutError, UntrustedRpError } from "../../utils/errors";
import { ItwProximityFailureScreen } from "../ItwProximityFailureScreen";

describe("ItwProximityFailureScreen", () => {
  afterEach(() => jest.restoreAllMocks());

  test.each<ProximityFailure>([
    {
      type: ProximityFailureType.RELYING_PARTY_GENERIC,
      reason: new Error("RP generic error")
    },
    {
      type: ProximityFailureType.TIMEOUT,
      reason: new TimeoutError("Request timed out")
    },
    {
      type: ProximityFailureType.UNTRUSTED_RP,
      reason: new UntrustedRpError("Untrusted RP")
    }
  ])("should render failure screen for $type", failure => {
    expect(renderComponent(failure)).toMatchSnapshot();
  });

  it("opens the FAQ from the untrusted verifier bottom sheet", () => {
    const mockOpenWebUrl = jest.spyOn(url, "openWebUrl").mockImplementation();
    jest
      .spyOn(bottomSheet, "useIOBottomSheetModal")
      .mockImplementation(params => ({
        bottomSheet: (
          <>
            {params.component}
            {params.footer}
          </>
        ),
        dismiss: jest.fn(),
        present: jest.fn()
      }));
    const { getByLabelText } = renderComponent({
      type: ProximityFailureType.UNTRUSTED_RP,
      reason: new UntrustedRpError("Untrusted RP")
    });

    fireEvent.press(getByLabelText("Scopri di più"));

    expect(mockOpenWebUrl).toHaveBeenCalledWith(expect.any(String));
  });
});

const renderComponent = (failure: ProximityFailure) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwProximityMachine).getSnapshot();

  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Failure",
    context: { ...initialSnapshot.context, failure }
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwProximityMachineContext.Provider options={{ snapshot }}>
        <ItwProximityFailureScreen />
      </ItwProximityMachineContext.Provider>
    ),
    ITW_ROUTES.PROXIMITY.FAILURE,
    {},
    createStore(appReducer, initialState as any)
  );
};
