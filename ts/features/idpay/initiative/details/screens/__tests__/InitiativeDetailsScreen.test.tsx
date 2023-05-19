import * as React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import configureMockStore from "redux-mock-store";
import { IDPayDetailsRoutes } from "../../navigation";
import { InitiativeDetailsScreen } from "../InitiativeDetailsScreen";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum
} from "../../../../../../../definitions/idpay/InitiativeDTO";
import { NetworkError } from "../../../../../../utils/errors";
import I18n from "../../../../../../i18n";
import { formatDateAsLocal } from "../../../../../../utils/dates";

const mockedInitiative: InitiativeDTO = {
  endDate: new Date(2023, 1, 1),
  initiativeId: "ABC123",
  initiativeName: "Fake initiative",
  organizationName: "Fake organization",
  nInstr: 2,
  status: StatusEnum.REFUNDABLE,
  initiativeRewardType: InitiativeRewardTypeEnum.REFUND,
  lastCounterUpdate: new Date()
};

describe("Test InitiativeDetailsScreen screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render the screen correctly", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
  });
  it("should render the skeleton with pot.Loading", () => {
    const { component } = renderComponent(pot.noneLoading);
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(
      component.getByTestId("IDPayDetailsHeroSkeletonTestID")
    ).not.toBeNull();
    expect(component.queryByTestId("IDPayDetailsHeroTestID")).toBeNull();
    expect(
      component.queryByTestId("IDPayTimelineSkeletonTestID")
    ).not.toBeNull();
    expect(component.queryByTestId("IDPayDetailsSettingsTestID")).toBeNull();
    expect(component.queryByTestId("IDPayDetailsLastUpdatedTestID")).toBeNull();
    expect(
      component.queryByText(
        I18n.t("idpay.initiative.discountDetails.authorizeButton")
      )
    ).not.toBeTruthy();
  });
  it("should render correct data for REFUND initiatives", () => {
    const { component } = renderComponent(pot.some(mockedInitiative));
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(component.queryByTestId("IDPayDetailsHeroTestID")).not.toBeNull();
    expect(
      component.queryByTestId("IDPayDetailsLastUpdatedTestID")
    ).not.toBeNull();
    expect(component.queryByText("Fake initiative")).not.toBeNull();
    expect(component.queryByText("Fake organization")).not.toBeNull();

    expect(
      component.queryByText(
        I18n.t(`idpay.initiative.details.initiativeCard.validUntil`, {
          expiryDate: formatDateAsLocal(mockedInitiative.endDate, true)
        })
      )
    ).toBeTruthy();

    expect(
      component.queryByText(
        I18n.t("idpay.initiative.details.initiativeCard.availableAmount")
      )
    ).toBeTruthy();

    expect(
      component.queryByText(
        I18n.t("idpay.initiative.details.initiativeCard.toRefund")
      )
    ).toBeTruthy();

    expect(component.queryByTestId("IDPayTimelineSkeletonTestID")).toBeNull();
    expect(
      component.queryByTestId("IDPayDetailsSettingsTestID")
    ).not.toBeNull();

    expect(
      component.queryByText(
        I18n.t("idpay.initiative.discountDetails.authorizeButton")
      )
    ).not.toBeTruthy();
  });
  it("should render correct data for DISCOUNT initiatives", () => {
    const { component } = renderComponent(
      pot.some({
        ...mockedInitiative,
        initiativeRewardType: InitiativeRewardTypeEnum.DISCOUNT
      })
    );
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(component.queryByTestId("IDPayDetailsHeroTestID")).not.toBeNull();
    expect(
      component.queryByTestId("IDPayDetailsLastUpdatedTestID")
    ).not.toBeNull();

    expect(component.queryByText("Fake initiative")).not.toBeNull();
    expect(component.queryByText("Fake organization")).not.toBeNull();

    expect(
      component.queryByText(
        I18n.t(`idpay.initiative.details.initiativeCard.validUntil`, {
          expiryDate: formatDateAsLocal(mockedInitiative.endDate, true)
        })
      )
    ).toBeTruthy();

    expect(
      component.queryByText(
        I18n.t("idpay.initiative.details.initiativeCard.availableAmount")
      )
    ).toBeTruthy();

    expect(
      component.queryByText(
        I18n.t("idpay.initiative.details.initiativeCard.toRefund")
      )
    ).not.toBeTruthy();

    expect(component.queryByTestId("IDPayTimelineSkeletonTestID")).toBeNull();
    expect(component.queryByTestId("IDPayDetailsSettingsTestID")).toBeNull();

    expect(
      component.queryByText(
        I18n.t("idpay.initiative.discountDetails.authorizeButton")
      )
    ).toBeTruthy();
  });
});

const renderComponent = (
  initiativePot: pot.Pot<InitiativeDTO, NetworkError> = pot.none
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    features: {
      ...globalState.features,
      idPay: {
        ...globalState.features.idPay,
        initiative: {
          ...globalState.features.idPay.initiative,
          details: initiativePot
        }
      }
    }
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <InitiativeDetailsScreen />,
      IDPayDetailsRoutes.IDPAY_DETAILS_MAIN,
      {},
      store
    ),
    store
  };
};
