import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
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

  it("renders the dedicated CIE mismatch copy and actions", () => {
    const { queryByText, getByText } = renderComponent({
      type: IssuanceFailureType.CIE_NOT_MATCHING_AUTHENTICATION_IDENTITY,
      reason: new Error("tax_id_code_mismatch")
    });

    expect(
      getByText(
        I18n.t(
          "features.itWallet.issuance.cieNotMatchingAuthenticationIdentityError.title"
        )
      )
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t(
          "features.itWallet.issuance.cieNotMatchingAuthenticationIdentityError.body"
        )
      )
    ).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.retry"))).toBeTruthy();
    expect(getByText(I18n.t("global.buttons.close"))).toBeTruthy();
    expect(queryByText(I18n.t("features.itWallet.support.button"))).toBeNull();

    fireEvent.press(getByText(I18n.t("global.buttons.retry")));

    expect(mockSend).toHaveBeenCalledWith({ type: "retry" });
  });

  it("keeps rendering the generic unexpected failure branch", () => {
    const { getByText } = renderComponent({
      type: IssuanceFailureType.UNEXPECTED,
      reason: new Error("Unexpected failure")
    });

    expect(
      getByText(I18n.t("features.itWallet.generic.error.title"))
    ).toBeTruthy();
    expect(getByText(I18n.t("features.itWallet.support.button"))).toBeTruthy();
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
