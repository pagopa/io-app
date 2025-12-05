import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { MessageBottomMenu } from "../MessageBottomMenu";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { NotificationStatusHistory } from "../../../../../definitions/pn/NotificationStatusHistory";
import {
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";

jest.mock("../TimelineListItem");
jest.mock("../NeedHelp");
jest.mock("../../../messages/components/MessageDetail/ContactsListItem");
jest.mock("../../../messages/components/MessageDetail/ShowMoreListItem");

const baseHistory: NotificationStatusHistory = [
  {
    activeFrom: new Date(2024, 1, 1, 1, 10),
    relatedTimelineElements: [],
    status: "VIEWED"
  }
];
const basePaidNoticeCodes = [
  undefined,
  [],
  ["999988887777666655", "999988887777666644"]
];
const basePayments = [
  undefined,
  [],
  [
    {
      creditorTaxId: "01234567890",
      noticeCode: "111122223333444400"
    } as NotificationPaymentInfo,
    {
      creditorTaxId: "01234567890",
      noticeCode: "111122223333444401"
    } as NotificationPaymentInfo
  ]
];

describe("MessageBottomMenu", () => {
  basePayments.forEach(payments =>
    [undefined, false, true].forEach(isCancelled =>
      basePaidNoticeCodes.forEach(paidNoticeCode => {
        it(`Should match snapshot (payments ${
          payments ? payments.length : "undefined"
        }, isCancelled ${isCancelled}, paidNoticeCodes ${
          paidNoticeCode ? paidNoticeCode.length : "undefined"
        })`, () => {
          const component = renderComponent(
            baseHistory,
            payments,
            isCancelled,
            paidNoticeCode,
            "message",
            "not_set"
          );
          expect(component).toMatchSnapshot();
        });
      })
    )
  );
});

const renderComponent = (
  history: NotificationStatusHistory,
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
  isCancelled: boolean | undefined,
  paidNoticeCodes: ReadonlyArray<string> | undefined,
  sendOpeningSource: SendOpeningSource,
  sendUserType: SendUserType
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageBottomMenu
        history={history}
        isCancelled={isCancelled}
        iun={"randomIUN"}
        messageId={"01HVPB9XYZMWNEPTDKZJ8ZJV28"}
        paidNoticeCodes={paidNoticeCodes}
        payments={payments}
        sendOpeningSource={sendOpeningSource}
        sendUserType={sendUserType}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
