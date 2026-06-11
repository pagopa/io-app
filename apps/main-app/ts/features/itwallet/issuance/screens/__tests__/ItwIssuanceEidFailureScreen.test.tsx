import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";
import { createActor } from "xstate";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../../machine/eid/failure";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceEidFailureScreen } from "../ItwIssuanceEidFailureScreen";

const mockSend = jest.fn();

jest.mock("../../../machine/eid/provider", () => {
  const actual = jest.requireActual("../../../machine/eid/provider");
  return {
    ...actual,
    ItwEidIssuanceMachineContext: {
      ...actual.ItwEidIssuanceMachineContext,
      useActorRef: () => ({ send: mockSend })
    }
  };
});

describe("ItwIssuanceEidFailureScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dedicated identity mismatch copy and retry action", () => {
    const { queryByText, getByText } = renderComponent({
      type: IssuanceFailureType.NOT_MATCHING_IDENTITY,
      reason: "IT Wallet identity does not match IO identity"
    });

    expect(
      getByText(
        I18n.t("features.itWallet.issuance.notMatchingIdentityError.title")
      )
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t("features.itWallet.issuance.notMatchingIdentityError.body")
      )
    ).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.retry"))).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.close"))).toBeTruthy();
    expect(queryByText(I18n.t("features.itWallet.support.button"))).toBeNull();

    fireEvent.press(getByText(I18n.t("global.buttons.retry")));

    expect(mockSend).toHaveBeenCalledWith({ type: "retry" });
  });
});

const renderComponent = (failure: IssuanceFailure) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Failure",
    context: {
      ...initialSnapshot.context,
      failure
    }
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwEidIssuanceMachineContext.Provider options={{ snapshot }}>
        <ItwIssuanceEidFailureScreen />
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.ISSUANCE.EID_FAILURE,
    {},
    createStore(appReducer, initialState as any)
  );
};
