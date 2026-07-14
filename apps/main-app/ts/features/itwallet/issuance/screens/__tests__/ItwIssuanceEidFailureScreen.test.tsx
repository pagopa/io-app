import { Errors } from "@pagopa/io-react-native-wallet";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { type EidIssuanceLevel } from "../../../machine/eid/context";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../../machine/eid/failure";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceEidFailureScreen } from "../ItwIssuanceEidFailureScreen";

const mockSend = jest.fn();

const identityMismatchScenarios = [
  {
    name: "Documenti su IO",
    level: "l2",
    bodyKey: "features.itWallet.issuance.notMatchingIdentityError.body.l2"
  },
  {
    name: "IT-Wallet",
    level: "l3",
    bodyKey: "features.itWallet.issuance.notMatchingIdentityError.body.l3"
  }
] as const;

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

  test.each(identityMismatchScenarios)(
    "renders the dedicated identity mismatch copy and retry action for $name",
    ({ level, bodyKey }) => {
      const { queryByText, getByText } = renderComponent(
        {
          type: IssuanceFailureType.NOT_MATCHING_IDENTITY,
          reason: "IT Wallet identity does not match IO identity"
        },
        level
      );

      expect(
        getByText(
          I18n.t("features.itWallet.issuance.notMatchingIdentityError.title")
        )
      ).toBeTruthy();
      expect(getByText(I18n.t(bodyKey))).toBeTruthy();
      expect(getByText(I18n.t("global.buttons.retry"))).toBeTruthy();
      expect(getByText(I18n.t("global.buttons.close"))).toBeTruthy();
      expect(
        queryByText(I18n.t("features.itWallet.support.button"))
      ).toBeNull();

      fireEvent.press(getByText(I18n.t("global.buttons.retry")));

      expect(mockSend).toHaveBeenCalledWith({ type: "retry" });
    }
  );

  it("renders the dedicated CIE mismatch copy and actions", () => {
    const { queryByText, getByText } = renderComponent({
      type: IssuanceFailureType.CIE_NOT_MATCHING_AUTHENTICATION_IDENTITY,
      reason: new Errors.IssuerResponseError({
        message: "MRTD PoP verification failed",
        reason: { error: "tax_id_code_mismatch" },
        statusCode: 400
      })
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

const renderComponent = (
  failure: IssuanceFailure,
  level?: EidIssuanceLevel
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    value: "Failure",
    context: {
      ...initialSnapshot.context,
      level,
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
