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
import { NotificationStatusHistory } from "../../../../../definitions/pn/NotificationStatusHistory";

describe("MessageBottomMenu", () => {
  it("should match snapshot, no history, undefined payments", () => {
    const component = renderComponent([]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments", () => {
    const component = renderComponent([]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, two payments", () => {
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
    const component = renderComponent([], payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, three payments", () => {
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
    const component = renderComponent([], payments);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, all handled-status items history, undefined payments", () => {
    const component = renderComponent(fullHistory());
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments", () => {
    const component = renderComponent(fullHistory());
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, two payments", () => {
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
    const component = renderComponent(fullHistory(), payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, three payments", () => {
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
    const component = renderComponent(fullHistory(), payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const fullHistory = (): NotificationStatusHistory => [
  {
    activeFrom: new Date(2024, 1, 1, 1, 10),
    relatedTimelineElements: [],
    status: "VIEWED"
  },
  {
    activeFrom: new Date(2024, 2, 3, 3, 15),
    relatedTimelineElements: [],
    status: "EFFECTIVE_DATE"
  },
  {
    activeFrom: new Date(2024, 3, 7, 5, 20),
    relatedTimelineElements: [],
    status: "UNREACHABLE"
  },
  {
    activeFrom: new Date(2024, 4, 10, 7, 25),
    relatedTimelineElements: [],
    status: "CANCELLED"
  },
  {
    activeFrom: new Date(2024, 5, 13, 9, 30),
    relatedTimelineElements: [],
    status: "IN_VALIDATION"
  },
  {
    activeFrom: new Date(2024, 6, 18, 11, 35),
    relatedTimelineElements: [],
    status: "ACCEPTED"
  },
  {
    activeFrom: new Date(2024, 7, 20, 13, 40),
    relatedTimelineElements: [],
    status: "REFUSED"
  },
  {
    activeFrom: new Date(2024, 8, 23, 15, 45),
    relatedTimelineElements: [],
    status: "DELIVERING"
  },
  {
    activeFrom: new Date(2024, 9, 25, 17, 50),
    relatedTimelineElements: [],
    status: "DELIVERED"
  },
  {
    activeFrom: new Date(2024, 10, 28, 19, 55),
    relatedTimelineElements: [],
    status: "PAID"
  }
];

const renderComponent = (
  history: NotificationStatusHistory,
  payments?: ReadonlyArray<NotificationPaymentInfo>
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageBottomMenu
        history={history}
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
