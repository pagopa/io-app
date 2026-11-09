import { IOColors } from "@io-app/design-system";
import { Platform, processColor } from "react-native";
import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  findAllNodes,
  withDarkTheme
} from "../../../../../../utils/testColors";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { testProximityDeps } from "../../../../machine/utils/testDeps";
import { itwProximityMachine } from "../../machine/machine";
import { ItwProximityMachineContext } from "../../machine/provider";
import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import { ItwProximityNfcPresentmentScreen } from "../ItwProximityNfcPresentmentScreen";

describe("ItwProximityNfcPresentmentScreen on Android", () => {
  beforeAll(() => {
    jest.replaceProperty(Platform, "OS", "android");
    jest
      .spyOn(Platform, "select")
      .mockImplementation(specifics =>
        "default" in specifics ? specifics.default : specifics.android
      );
  });

  it("should draw the progress ring with dark tokens in dark mode", () => {
    const { toJSON } = renderComponent();
    const [track, progress] = findAllNodes(
      toJSON(),
      node => node.type === "RNSVGCircle"
    );

    expect(track.props.stroke).toEqual({
      type: 0,
      payload: processColor(IOColors.dark.stroke.default)
    });
    expect(progress.props.stroke).toEqual({
      type: 0,
      payload: processColor(IOColors.dark.foreground.accent)
    });
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  const snapshot = createActor(itwProximityMachine, {
    input: { deps: testProximityDeps({ store }) }
  }).getSnapshot();

  return renderScreenWithNavigationStoreContext(
    withDarkTheme(() => (
      <ItwProximityMachineContext.Provider options={{ snapshot }}>
        <ItwProximityNfcPresentmentScreen />
      </ItwProximityMachineContext.Provider>
    )),
    ITW_PROXIMITY_ROUTES.PRESENTMENT,
    {},
    store
  );
};
