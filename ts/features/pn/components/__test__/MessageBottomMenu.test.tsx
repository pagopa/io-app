import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { MessageBottomMenu } from "../MessageBottomMenu";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { NotificationStatusHistory } from "../../../../../definitions/pn/NotificationStatusHistory";

jest.mock("../TimelineListItem");
jest.mock("../NeedHelp");
jest.mock("../../../messages/components/MessageDetail/ContactsListItem");
jest.mock("../../../messages/components/MessageDetail/ShowMoreListItem");

describe("MessageBottomMenu", () => {
  it("should match snapshot, no history, undefined payments, undefined cancelled, undefined paid notice codes", () => {
    const component = renderComponent([]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments, undefined cancelled, undefined paid notice codes", () => {
    const component = renderComponent([], []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment, undefined cancelled, undefined paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, multiple payments, undefined cancelled, undefined paid notice codes", () => {
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

  it("should match snapshot, no history, undefined payments, not cancelled, undefined paid notice codes", () => {
    const component = renderComponent([], undefined, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments, not cancelled, undefined paid notice codes", () => {
    const component = renderComponent([], [], false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment, not cancelled, undefined paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, multiple payments, not cancelled, undefined paid notice codes", () => {
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
    const component = renderComponent([], payments, false);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, no history, undefined payments, cancelled, undefined paid notice codes", () => {
    const component = renderComponent([], undefined, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments, cancelled, undefined paid notice codes", () => {
    const component = renderComponent([], [], true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment, cancelled, undefined paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, multiple payments, cancelled, undefined paid notice codes", () => {
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
    const component = renderComponent([], payments, true);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, no history, undefined payments, undefined cancelled, empty paid notice codes", () => {
    const component = renderComponent([], undefined, undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments, undefined cancelled, empty paid notice codes", () => {
    const component = renderComponent([], [], undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment, undefined cancelled, empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments, undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, multiple payments, undefined cancelled, empty paid notice codes", () => {
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
    const component = renderComponent([], payments, undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, no history, undefined payments, not cancelled, empty paid notice codes", () => {
    const component = renderComponent([], undefined, false, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments, not cancelled, empty paid notice codes", () => {
    const component = renderComponent([], [], false, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment, not cancelled, empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments, false, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, multiple payments, not cancelled, empty paid notice codes", () => {
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
    const component = renderComponent([], payments, false, []);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, no history, undefined payments, cancelled, empty paid notice codes", () => {
    const component = renderComponent([], undefined, true, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments, cancelled, empty paid notice codes", () => {
    const component = renderComponent([], [], true, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment, cancelled, empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments, true, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, multiple payments, cancelled, empty paid notice codes", () => {
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
    const component = renderComponent([], payments, true, []);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, no history, undefined payments, undefined cancelled, non-empty paid notice codes", () => {
    const component = renderComponent([], undefined, undefined, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments, undefined cancelled, non-empty paid notice codes", () => {
    const component = renderComponent([], [], undefined, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment, undefined cancelled, non-empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments, undefined, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, multiple payments, undefined cancelled, non-empty paid notice codes", () => {
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
    const component = renderComponent([], payments, undefined, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, no history, undefined payments, not cancelled, non-empty paid notice codes", () => {
    const component = renderComponent([], undefined, false, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments, not cancelled, non-empty paid notice codes", () => {
    const component = renderComponent([], [], false, ["111122223333444455"]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment, not cancelled, non-empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments, false, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, multiple payments, not cancelled, non-empty paid notice codes", () => {
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
    const component = renderComponent([], payments, false, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, no history, undefined payments, cancelled, non-empty paid notice codes", () => {
    const component = renderComponent([], undefined, true, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, empty payments, cancelled, non-empty paid notice codes", () => {
    const component = renderComponent([], [], true, ["111122223333444455"]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, one payment, cancelled, non-empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent([], payments, true, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, no history, multiple payments, cancelled, non-empty paid notice codes", () => {
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
    const component = renderComponent([], payments, true, [
      "111122223333444455"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, all handled-status items history, undefined payments, undefined cancelled, undefined paid notice codes", () => {
    const component = renderComponent(fullHistory());
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments, undefined cancelled, undefined paid notice codes", () => {
    const component = renderComponent(fullHistory(), []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment, undefined cancelled, undefined paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, multiple payments, undefined cancelled, undefined paid notice codes", () => {
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

  it("should match snapshot, all handled-status items history, undefined payments, not cancelled, undefined paid notice codes", () => {
    const component = renderComponent(fullHistory(), undefined, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments, not cancelled, undefined paid notice codes", () => {
    const component = renderComponent(fullHistory(), [], false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment, not cancelled, undefined paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, multiple payments, not cancelled, undefined paid notice codes", () => {
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
    const component = renderComponent(fullHistory(), payments, false);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, all handled-status items history, undefined payments, cancelled, undefined paid notice codes", () => {
    const component = renderComponent(fullHistory(), undefined, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments, cancelled, undefined paid notice codes", () => {
    const component = renderComponent(fullHistory(), [], true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment, cancelled, undefined paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, multiple payments, cancelled, undefined paid notice codes", () => {
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
    const component = renderComponent(fullHistory(), payments, true);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, all handled-status items history, undefined payments, undefined cancelled, empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), undefined, undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments, undefined cancelled, empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), [], undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment, undefined cancelled, empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments, undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, multiple payments, undefined cancelled, empty paid notice codes", () => {
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
    const component = renderComponent(fullHistory(), payments, undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, all handled-status items history, undefined payments, not cancelled, empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), undefined, false, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments, not cancelled, empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), [], false, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment, not cancelled, empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments, false, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, multiple payments, not cancelled, empty paid notice codes", () => {
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
    const component = renderComponent(fullHistory(), payments, false, []);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, all handled-status items history, undefined payments, cancelled, empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), undefined, true, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments, cancelled, empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), [], true, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment, cancelled, empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments, true, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, multiple payments, cancelled, empty paid notice codes", () => {
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
    const component = renderComponent(fullHistory(), payments, true, []);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, all handled-status items history, undefined payments, undefined cancelled, non-empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), undefined, undefined, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments, undefined cancelled, non-empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), [], undefined, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment, undefined cancelled, non-empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments, undefined, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, multiple payments, undefined cancelled, non-empty paid notice codes", () => {
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
    const component = renderComponent(fullHistory(), payments, undefined, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, all handled-status items history, undefined payments, not cancelled, non-empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), undefined, false, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments, not cancelled, non-empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), [], false, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment, not cancelled, non-empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments, false, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, multiple payments, not cancelled, non-empty paid notice codes", () => {
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
    const component = renderComponent(fullHistory(), payments, false, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match snapshot, all handled-status items history, undefined payments, cancelled, non-empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), undefined, true, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, empty payments, cancelled, non-empty paid notice codes", () => {
    const component = renderComponent(fullHistory(), [], true, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, one payment, cancelled, non-empty paid notice codes", () => {
    const payments = [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444400"
      } as NotificationPaymentInfo
    ];
    const component = renderComponent(fullHistory(), payments, true, [
      "999988887777666655"
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, all handled-status items history, multiple payments, cancelled, non-empty paid notice codes", () => {
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
    const component = renderComponent(fullHistory(), payments, true, [
      "999988887777666655"
    ]);
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
  payments?: ReadonlyArray<NotificationPaymentInfo>,
  isCancelled?: boolean,
  paidNoticeCodes?: ReadonlyArray<string>
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
        sendOpeningSource={"not_set"}
        sendUserType={"not_set"}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
