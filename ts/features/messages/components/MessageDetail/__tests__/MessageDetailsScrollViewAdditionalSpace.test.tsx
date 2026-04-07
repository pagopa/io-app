import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as payments from "../../../store/reducers/payments";
import { MessageDetailsScrollViewAdditionalSpace } from "../MessageDetailsScrollViewAdditionalSpace";

describe("MessageDetailsScrollViewAdditionalSpace", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  it("Should match snapshot with hidden button and no CTAs", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(false);
    const component = renderComponent(false, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with hidden button and both CTAs", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(false);
    const component = renderComponent(true, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with hidden button and a single CTA", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(false);
    const component = renderComponent(true, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with button and no CTAs", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(true);
    const component = renderComponent(false, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with button and both CTA", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(true);
    const component = renderComponent(true, true);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("Should match snapshot with button and a single CTA", () => {
    jest
      .spyOn(payments, "isPaymentsButtonVisibleSelector")
      .mockReturnValue(true);
    const component = renderComponent(true, false);
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = (
  hasCTA1: boolean,
  hasCTA2: boolean,
  messageId: string = "01HRW5J2QYMH3FWAA5CYGXSC84"
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <MessageDetailsScrollViewAdditionalSpace
        hasCTA1={hasCTA1}
        hasCTA2={hasCTA2}
        messageId={messageId}
      />
    ),
    "DUMMY",
    {},
    store
  );
};
