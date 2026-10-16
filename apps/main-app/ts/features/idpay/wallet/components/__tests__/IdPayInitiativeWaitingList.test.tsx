import {
  StatusEnum as InitiativeOnboardingStatus,
  UserOnboardingStatusDTO
} from "@io-app/api-types/generated/definitions/idpay/UserOnboardingStatusDTO";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { ReactElement } from "react";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import * as bottomSheetHooks from "../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as analytics from "../../analytics";
import { IdPayInitiativeWaitingList } from "../IdPayInitiativeWaitingList";

const initiativeName = "Test initiative";

const renderComponent = (status: InitiativeOnboardingStatus) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = configureMockStore<GlobalState>()({
    ...globalState,
    features: {
      ...globalState.features,
      idPay: {
        ...globalState.features.idPay,
        wallet: {
          ...globalState.features.idPay.wallet,
          initiativeWaitingList: pot.some([
            {
              initiativeId: "1",
              initiativeName,
              serviceId: "TESTSRV01",
              status,
              statusDate: new Date()
            } as UserOnboardingStatusDTO
          ])
        }
      }
    }
  } as GlobalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    IdPayInitiativeWaitingList,
    "DUMMY",
    {},
    store
  );
};

describe("IdPayInitiativeWaitingList", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      name: "ON_WAITING_LIST",
      status: InitiativeOnboardingStatus.ON_WAITING_LIST,
      titleKey:
        "idpay.wallet.initiativeOnboardedStatus.ON_WAITING_LIST.bottomSheet.title",
      contentKey:
        "idpay.wallet.initiativeOnboardedStatus.ON_WAITING_LIST.bottomSheet.content"
    },
    {
      name: "ON_EVALUATION",
      status: InitiativeOnboardingStatus.ON_EVALUATION,
      titleKey:
        "idpay.wallet.initiativeOnboardedStatus.ON_EVALUATION.bottomSheet.title",
      contentKey:
        "idpay.wallet.initiativeOnboardedStatus.ON_EVALUATION.bottomSheet.content"
    }
  ] as const)(
    "should open the $name bottom sheet when the info button is pressed",
    ({ status, titleKey, contentKey }) => {
      const present = jest.fn();
      const useIOBottomSheetModal = jest
        .spyOn(bottomSheetHooks, "useIOBottomSheetModal")
        .mockImplementation(() => ({
          present,
          dismiss: jest.fn(),
          bottomSheet: <></>
        }));
      const track = jest
        .spyOn(analytics, "trackIDPayOnWaitingListInfoButtonTap")
        .mockImplementation(jest.fn());

      const { getByLabelText } = renderComponent(status);
      fireEvent.press(
        getByLabelText(
          I18n.t(
            "idpay.wallet.initiativeOnboardedStatus.accessibilityInfoLabel"
          )
        )
      );

      const { title, component } = useIOBottomSheetModal.mock.calls.at(-1)![0];
      expect(title).toBe(I18n.t(titleKey));
      expect(
        (
          component as ReactElement<{
            children: Array<ReactElement<{ content: string }>>;
          }>
        ).props.children[0].props.content
      ).toBe(I18n.t(contentKey, { initiativeName }));
      expect(present).toHaveBeenCalledTimes(1);
      expect(track).toHaveBeenCalledWith({
        initiativeId: "1",
        status
      });
    }
  );
});
