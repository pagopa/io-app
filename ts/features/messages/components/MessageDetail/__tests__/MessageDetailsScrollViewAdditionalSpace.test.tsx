import * as React from "react";
import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MessageDetailsScrollViewAdditionalSpace } from "../MessageDetailsScrollViewAdditionalSpace";
import { UIMessageId } from "../../../types";
import * as payments from "../../../store/reducers/payments";

describe("MessageDetailsScrollViewAdditionalSpace", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it("Should match snapshot with hidden button and no CTAs", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(false);
    const component = renderComponent(false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with hidden button and CTAs", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(false);
    const component = renderComponent(true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with button and no CTAs", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(true);
    const component = renderComponent(false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with button and CTAs", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(true);
    const component = renderComponent(true);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (
  hasCTAS: boolean,
  messageId: UIMessageId = "01HRW5J2QYMH3FWAA5CYGXSC84" as UIMessageId
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsScrollViewAdditionalSpace
        messageId={messageId}
        hasCTAS={hasCTAS}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
