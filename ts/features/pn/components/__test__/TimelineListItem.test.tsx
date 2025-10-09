import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { TimelineListItem } from "../TimelineListItem";
import PN_ROUTES from "../../navigation/routes";
import { NotificationStatusHistory } from "../../../../../definitions/pn/NotificationStatusHistory";
import { GlobalState } from "../../../../store/reducers/types";
import { BackendStatus } from "../../../../../definitions/content/BackendStatus";

jest.mock("../Timeline");

describe("TimelineListItem", () => {
  [false, true].forEach(hideFooter => {
    it(`Should match snapshot, ${
      hideFooter ? "hidden" : "shown"
    } footer, no history, no link`, () => {
      const component = renderComponent(hideFooter, [], false);
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot, ${
      hideFooter ? "hidden" : "shown"
    } footer,no history, with link`, () => {
      const component = renderComponent(hideFooter, []);
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot, ${
      hideFooter ? "hidden" : "shown"
    } footer,all handled-status items history, no link`, () => {
      const component = renderComponent(hideFooter, fullHistory(), false);
      expect(component.toJSON()).toMatchSnapshot();
    });
    it(`Should match snapshot, ${
      hideFooter ? "hidden" : "shown"
    } footer,all handled-status items history, with link`, () => {
      const component = renderComponent(hideFooter, fullHistory(), true);
      expect(component.toJSON()).toMatchSnapshot();
    });
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
  hideFooter: boolean,
  history: NotificationStatusHistory,
  frontendUrlDefined: boolean = true
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const finalState: GlobalState = {
    ...initialState,
    remoteConfig: frontendUrlDefined
      ? O.some({
          cgn: {
            enabled: false
          },
          newPaymentSection: {
            enabled: false,
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            }
          },
          fims: {
            enabled: false
          },
          pn: {
            frontend_url: "https://www.domain.com/sendUrl"
          },
          itw: {
            enabled: true,
            min_app_version: {
              android: "0.0.0.0",
              ios: "0.0.0.0"
            }
          }
        } as BackendStatus["config"])
      : O.none
  };
  const store = createStore(appReducer, finalState as any);
  return renderScreenWithNavigationStoreContext(
    () => <TimelineListItem hideFooter={hideFooter} history={history} />,
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
