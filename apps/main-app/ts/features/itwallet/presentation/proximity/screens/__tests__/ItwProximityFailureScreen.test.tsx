import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as bottomSheet from "../../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as url from "../../../../../../utils/url";
import { testProximityDeps } from "../../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../../navigation/routes";
import * as analytics from "../../analytics";
import { ProximityFailure, ProximityFailureType } from "../../machine/failure";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { TimeoutError, UntrustedRpError } from "../../utils/errors";
import { ItwProximityFailureScreen } from "../ItwProximityFailureScreen";

describe("ItwProximityFailureScreen", () => {
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
  it("tracks discover more only when pressed and opens the FAQ", () => {
    const track = jest
      .spyOn(analytics, "trackItwProximityRpNotTrustedDiscoverMore")
      .mockImplementation();
    const openWebUrl = jest.spyOn(url, "openWebUrl").mockImplementation();
    const modal = jest
      .spyOn(bottomSheet, "useIOBottomSheetModal")
      .mockImplementation(({ footer }) => ({
        bottomSheet: <>{footer}</>,
        present: jest.fn(),
        dismiss: jest.fn()
      }));
    const screen = renderComponent({
      type: ProximityFailureType.UNTRUSTED_RP,
      reason: new UntrustedRpError("Untrusted RP")
    });

    expect(track).not.toHaveBeenCalled();
    fireEvent.press(screen.getByText(I18n.t("global.buttons.findOutMore")));
    expect(track).toHaveBeenCalledTimes(1);
    expect(openWebUrl).toHaveBeenCalledTimes(1);

    modal.mockRestore();
    openWebUrl.mockRestore();
    track.mockRestore();
  });
});

const renderComponent = (failure: ProximityFailure) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const initialSnapshot = createActor(itwProximityMachine, {
    input: { deps: testProximityDeps({ store }) }
  }).getSnapshot();

  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: { Failure: "Idle" },
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
    store
  );
};
