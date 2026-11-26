import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application.ts";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types.ts";
import * as bottomSheet from "../../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper.tsx";
import {
  ITW_ISSUING_AUTHORITY_CLAIM_MOCK_LABEL,
  ItwStoredCredentialsMocks,
  withIssuingAuthorityClaimMock
} from "../../../../common/utils/itwMocksUtils.ts";
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils.ts";
import { ITW_ROUTES } from "../../../../navigation/routes.ts";
import { ItwPresentationPidDetail } from "../ItwPresentationPidDetail.tsx";

describe("ItwPresentationPidDetail", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([{ name: "expiry_date" }, { name: "date_of_expiry" }])(
    "should open and dismiss the expiration info for $name",
    ({ name }) => {
      const title = I18n.t(
        "features.itWallet.presentation.itWalletId.expirationDateInfo.title"
      );
      const present = jest.fn();
      const dismiss = jest.fn();
      const originalBottomSheetModal = bottomSheet.useIOBottomSheetModal;
      jest
        .spyOn(bottomSheet, "useIOBottomSheetModal")
        .mockImplementation(options => {
          const sheet = originalBottomSheetModal(options);
          return options.title === title
            ? { ...sheet, present, dismiss }
            : sheet;
        });

      const credential = ItwStoredCredentialsMocks.eid;
      const { component } = renderComponentWithStore(false, {
        ...credential,
        parsedCredential: {
          ...credential.parsedCredential,
          [name]: { name: "Data di scadenza", value: "2099-12-31" }
        }
      });

      fireEvent.press(
        component.getByLabelText(
          I18n.t(
            "features.itWallet.presentation.itWalletId.expirationDateInfo.accessibilityLabel"
          )
        )
      );
      expect(present).toHaveBeenCalledTimes(1);

      fireEvent.press(
        component.getByText(
          I18n.t(
            "features.itWallet.presentation.itWalletId.expirationDateInfo.primaryAction"
          )
        )
      );
      expect(dismiss).toHaveBeenCalledTimes(1);
    }
  );

  it("should read the claim values visibility from the persisted preference", () => {
    const { component } = renderComponentWithStore(true);

    expect(component.getAllByText("******").length).toBeGreaterThan(0);
  });

  it("should persist the toggled visibility in the redux store instead of local state", () => {
    const { component, store } = renderComponentWithStore(false);

    const toggleButton = component.getByTestId("toggle-pid-claim-visibility");

    fireEvent(toggleButton, "onPress");

    expect(
      store.getState().features.itWallet.preferences.claimValuesHidden
    ).toBe(true);
  });

  it("should not render the issuing_authority claim, already shown by the issuance metadata", () => {
    const { component } = renderComponentWithStore(
      false,
      withIssuingAuthorityClaimMock(ItwStoredCredentialsMocks.eid)
    );

    expect(
      component.queryByText(ITW_ISSUING_AUTHORITY_CLAIM_MOCK_LABEL)
    ).toBeNull();
  });
});

function renderComponentWithStore(
  claimValuesHidden: boolean,
  credential: CredentialMetadata = ItwStoredCredentialsMocks.eid
) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const state: GlobalState = {
    ...globalState,
    features: {
      ...globalState.features,
      itWallet: {
        ...globalState.features.itWallet,
        preferences: {
          ...globalState.features.itWallet.preferences,
          claimValuesHidden
        }
      }
    }
  };
  const store = createStore(appReducer, state as any);

  const component = renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwPresentationPidDetail
        credential={{
          ...credential,
          jwt: { expiration: "2100-01-01T00:00:00Z" }
        }}
      />
    ),
    ITW_ROUTES.PRESENTATION.PID_DETAIL,
    {},
    store
  );

  return { component, store };
}
