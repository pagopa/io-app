import { createStore } from "redux";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { MessageCancelledContent } from "../MessageCancelledContent";

describe("MessageCancelledContent", () => {
  it("Should match snapshot, undefined cancelled, undefined paid notice code, undefined payments", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, undefined cancelled, undefined paid notice code, empty payments", () => {
    const component = renderComponent(undefined, undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, undefined cancelled, undefined paid notice code, non-empty payments", () => {
    const component = renderComponent(undefined, undefined, [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444455"
      } as NotificationPaymentInfo
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, undefined cancelled, empty paid notice code, undefined payments", () => {
    const component = renderComponent(undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, undefined cancelled, empty paid notice code, empty payments", () => {
    const component = renderComponent(undefined, [], []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, undefined cancelled, empty paid notice code, non-empty payments", () => {
    const component = renderComponent(
      undefined,
      [],
      [
        {
          creditorTaxId: "01234567890",
          noticeCode: "111122223333444455"
        } as NotificationPaymentInfo
      ]
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, undefined cancelled, non-empty paid notice code, undefined payments", () => {
    const component = renderComponent(undefined, ["999988887777666655"]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, undefined cancelled, non-empty paid notice code, empty payments", () => {
    const component = renderComponent(undefined, ["999988887777666655"], []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, undefined cancelled, non-empty paid notice code, non-empty payments", () => {
    const component = renderComponent(
      undefined,
      ["999988887777666655"],
      [
        {
          creditorTaxId: "01234567890",
          noticeCode: "111122223333444455"
        } as NotificationPaymentInfo
      ]
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, not cancelled, undefined paid notice code, undefined payments", () => {
    const component = renderComponent(false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, not cancelled, undefined paid notice code, empty payments", () => {
    const component = renderComponent(false, undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, not cancelled, undefined paid notice code, non-empty payments", () => {
    const component = renderComponent(false, undefined, [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444455"
      } as NotificationPaymentInfo
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, not cancelled, empty paid notice code, undefined payments", () => {
    const component = renderComponent(false, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, not cancelled, empty paid notice code, empty payments", () => {
    const component = renderComponent(false, [], []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, not cancelled, empty paid notice code, non-empty payments", () => {
    const component = renderComponent(
      false,
      [],
      [
        {
          creditorTaxId: "01234567890",
          noticeCode: "111122223333444455"
        } as NotificationPaymentInfo
      ]
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, not cancelled, non-empty paid notice code, undefined payments", () => {
    const component = renderComponent(false, ["999988887777666655"]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, not cancelled, non-empty paid notice code, empty payments", () => {
    const component = renderComponent(false, ["999988887777666655"], []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, not cancelled, non-empty paid notice code, non-empty payments", () => {
    const component = renderComponent(
      false,
      ["999988887777666655"],
      [
        {
          creditorTaxId: "01234567890",
          noticeCode: "111122223333444455"
        } as NotificationPaymentInfo
      ]
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, cancelled, undefined paid notice code, undefined payments", () => {
    const component = renderComponent(true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, cancelled, undefined paid notice code, empty payments", () => {
    const component = renderComponent(true, undefined, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, cancelled, undefined paid notice code, non-empty payments", () => {
    const component = renderComponent(true, undefined, [
      {
        creditorTaxId: "01234567890",
        noticeCode: "111122223333444455"
      } as NotificationPaymentInfo
    ]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, cancelled, empty paid notice code, undefined payments", () => {
    const component = renderComponent(true, []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, cancelled, empty paid notice code, empty payments", () => {
    const component = renderComponent(true, [], []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, cancelled, empty paid notice code, non-empty payments", () => {
    const component = renderComponent(
      true,
      [],
      [
        {
          creditorTaxId: "01234567890",
          noticeCode: "111122223333444455"
        } as NotificationPaymentInfo
      ]
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, cancelled, non-empty paid notice code, undefined payments", () => {
    const component = renderComponent(true, ["999988887777666655"]);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, cancelled, non-empty paid notice code, empty payments", () => {
    const component = renderComponent(true, ["999988887777666655"], []);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot, cancelled, non-empty paid notice code, non-empty payments", () => {
    const component = renderComponent(
      true,
      ["999988887777666655"],
      [
        {
          creditorTaxId: "01234567890",
          noticeCode: "111122223333444455"
        } as NotificationPaymentInfo
      ]
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (
  isCancelled?: boolean,
  paidNoticeCodes?: ReadonlyArray<string>,
  payments?: ReadonlyArray<NotificationPaymentInfo>
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageCancelledContent
        isCancelled={isCancelled}
        paidNoticeCodes={paidNoticeCodes}
        payments={payments}
      />
    ),
    PN_ROUTES.MESSAGE_DETAILS,
    {},
    store
  );
};
