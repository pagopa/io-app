import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { walletSetBottomSheetSurveyVisible } from "../../actions/bottomSheet";

describe("Wallet bottomSheet for survey reducer", () => {
  it("should start with initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.bottomSheet).toStrictEqual({
      bottomSheetSurveyVisible: true
    });
  });

  it("should set the visibility of the bottom sheet", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletSetBottomSheetSurveyVisible(false));

    expect(store.getState().features.wallet.bottomSheet).toStrictEqual({
      bottomSheetSurveyVisible: false
    });
  });
});
