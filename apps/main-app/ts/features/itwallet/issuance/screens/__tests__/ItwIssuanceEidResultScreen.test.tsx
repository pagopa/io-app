import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createActor } from "xstate";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import { Context, EidIssuanceLevel } from "../../../machine/eid/context";
import { itwEidIssuanceMachine } from "../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceEidResultScreen } from "../ItwIssuanceEidResultScreen";

const mockSend = jest.fn();
const mockCredentialSend = jest.fn();

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

jest.mock("../../../machine/credential/provider", () => {
  const actual = jest.requireActual("../../../machine/credential/provider");
  return {
    ...actual,
    ItwCredentialIssuanceMachineContext: {
      ...actual.ItwCredentialIssuanceMachineContext,
      useActorRef: () => ({ send: mockCredentialSend })
    }
  };
});

describe("ItwIssuanceEidResultScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("IT-Wallet (L3) flow", () => {
    describe("when the wallet has no digital documents", () => {
      beforeEach(() => {
        jest
          .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
          .mockReturnValue(true);
      });

      it("renders the 'explore IT-Wallet' TYP without secondary action", () => {
        const { getByText, queryByText } = renderComponent("l3");

        expect(
          getByText(
            I18n.t("features.itWallet.issuance.eidResult.success.itw.title")
          )
        ).toBeTruthy();
        expect(
          getByText(
            I18n.t(
              "features.itWallet.issuance.eidResult.success.itw.withoutDocuments.subtitle"
            )
          )
        ).toBeTruthy();
        expect(
          getByText(
            I18n.t(
              "features.itWallet.issuance.eidResult.success.itw.withoutDocuments.primaryAction"
            )
          )
        ).toBeTruthy();
        expect(
          queryByText(
            I18n.t(
              "features.itWallet.issuance.eidResult.success.secondaryAction"
            )
          )
        ).toBeNull();
      });

      it("navigates back to the wallet when the primary action is pressed", () => {
        const { getByText } = renderComponent("l3");

        fireEvent.press(
          getByText(
            I18n.t(
              "features.itWallet.issuance.eidResult.success.itw.withoutDocuments.primaryAction"
            )
          )
        );

        expect(mockSend).toHaveBeenCalledWith({ type: "go-to-wallet" });
      });
    });

    describe("when the wallet already has at least one digital document", () => {
      beforeEach(() => {
        jest
          .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
          .mockReturnValue(false);
      });

      it("renders the 'add document' TYP with the secondary action", () => {
        const { getByText } = renderComponent("l3");

        expect(
          getByText(
            I18n.t("features.itWallet.issuance.eidResult.success.itw.title")
          )
        ).toBeTruthy();
        expect(
          getByText(
            I18n.t(
              "features.itWallet.issuance.eidResult.success.itw.withDocuments.subtitle"
            )
          )
        ).toBeTruthy();
        expect(
          getByText(
            I18n.t(
              "features.itWallet.issuance.eidResult.success.itw.withDocuments.primaryAction"
            )
          )
        ).toBeTruthy();
        expect(
          getByText(
            I18n.t(
              "features.itWallet.issuance.eidResult.success.secondaryAction"
            )
          )
        ).toBeTruthy();
      });

      it("adds a new credential when the primary action is pressed", () => {
        const { getByText } = renderComponent("l3");

        fireEvent.press(
          getByText(
            I18n.t(
              "features.itWallet.issuance.eidResult.success.itw.withDocuments.primaryAction"
            )
          )
        );

        expect(mockSend).toHaveBeenCalledWith({ type: "add-new-credential" });
      });

      it("navigates back to the wallet when the secondary action is pressed", () => {
        const { getByText } = renderComponent("l3");

        fireEvent.press(
          getByText(
            I18n.t(
              "features.itWallet.issuance.eidResult.success.secondaryAction"
            )
          )
        );

        expect(mockSend).toHaveBeenCalledWith({ type: "go-to-wallet" });
      });
    });
  });

  describe("IT-Wallet upgrade flow (Documenti su IO → IT-Wallet)", () => {
    it("renders the 'add document' TYP when the upgraded wallet has documents", () => {
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);

      const { getByText } = renderComponent("l3", { mode: "upgrade" });

      expect(
        getByText(
          I18n.t("features.itWallet.issuance.eidResult.success.itw.title")
        )
      ).toBeTruthy();
      expect(
        getByText(
          I18n.t(
            "features.itWallet.issuance.eidResult.success.itw.withDocuments.primaryAction"
          )
        )
      ).toBeTruthy();
      expect(
        getByText(
          I18n.t("features.itWallet.issuance.eidResult.success.secondaryAction")
        )
      ).toBeTruthy();
    });

    it("renders the 'explore IT-Wallet' TYP when the upgraded wallet has no documents", () => {
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(true);

      const { getByText, queryByText } = renderComponent("l3", {
        mode: "upgrade"
      });

      expect(
        getByText(
          I18n.t(
            "features.itWallet.issuance.eidResult.success.itw.withoutDocuments.primaryAction"
          )
        )
      ).toBeTruthy();
      expect(
        queryByText(
          I18n.t("features.itWallet.issuance.eidResult.success.secondaryAction")
        )
      ).toBeNull();
    });
  });

  describe("Documenti su IO (L2) flow", () => {
    it("keeps the original success copy regardless of the wallet content", () => {
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(true);

      const { getByText, queryByText } = renderComponent("l2");

      expect(
        getByText(I18n.t("features.itWallet.issuance.eidResult.success.title"))
      ).toBeTruthy();
      expect(
        getByText(
          I18n.t("features.itWallet.issuance.eidResult.success.subtitle")
        )
      ).toBeTruthy();
      expect(
        getByText(
          I18n.t("features.itWallet.issuance.eidResult.success.primaryAction")
        )
      ).toBeTruthy();
      expect(
        getByText(
          I18n.t("features.itWallet.issuance.eidResult.success.secondaryAction")
        )
      ).toBeTruthy();
      // The IT-Wallet specific copy must not appear in the L2 flow
      expect(
        queryByText(
          I18n.t("features.itWallet.issuance.eidResult.success.itw.title")
        )
      ).toBeNull();
    });
  });
});

const renderComponent = (
  level: EidIssuanceLevel,
  contextOverrides: Partial<Context> = {}
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const initialSnapshot = createActor(itwEidIssuanceMachine).getSnapshot();
  const snapshot: typeof initialSnapshot = {
    ...initialSnapshot,
    context: {
      ...initialSnapshot.context,
      level,
      ...contextOverrides
    }
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwEidIssuanceMachineContext.Provider options={{ snapshot }}>
        <ItwIssuanceEidResultScreen />
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.ISSUANCE.EID_RESULT,
    {},
    createStore(appReducer, initialState as any)
  );
};
