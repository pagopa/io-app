import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { TimelineListItem } from "../TimelineListItem";
import PN_ROUTES from "../../navigation/routes";
import { NotificationStatusHistory } from "../../../../../definitions/pn/NotificationStatusHistory";
import { GlobalState } from "../../../../store/reducers/types";
import { BackendStatus } from "../../../../../definitions/content/BackendStatus";

describe("TimelineListItem", () => {
  it("Should match snapshot, no history, no link", () => {
    const component = renderComponent([], false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, no history, with link", () => {
    const component = renderComponent([]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, all handled-status items history, no link", () => {
    const component = renderComponent(fullHistory(), false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, all handled-status items history, with link", () => {
    const component = renderComponent(fullHistory(), true);
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
  frontendUrlDefined: boolean = true
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const dsEnabledState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const finalState: GlobalState = {
    ...dsEnabledState,
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
    () => <TimelineListItem history={history} />,
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
