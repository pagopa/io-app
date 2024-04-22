import React from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { MessageBottomMenu } from "../MessageBottomMenu";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { UIMessageId } from "../../../messages/types";

describe("MessageBottomMenu", () => {
  it("should match snapshot, undefined payments", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, empty payments", () => {
    const component = renderComponent([]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, one payment", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, two payments", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo,
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444401"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, three payments", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo,
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444401"
      } as NotificationPaymentInfo,
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444402"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (payments?: ReadonlyArray<NotificationPaymentInfo>) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageBottomMenu
        iun={"randomIUN"}
        messageId={"01HVPB9XYZMWNEPTDKZJ8ZJV28" as UIMessageId}
        payments={payments}
        serviceId={"01HT25YR72A8N42AJ0TEKAB2V7" as ServiceId}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
