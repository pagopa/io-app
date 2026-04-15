import React from "react";
import { createStore } from "redux";
import Countdown from "../CountdownComponent";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";

const mockStartTimer = jest.fn();
const mockIsRunning = jest.fn();

const renderComponent = (
  props?: Partial<React.ComponentProps<typeof Countdown>>
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <Countdown visible={true} {...props} />,
    "DUMMY",
    {},
    store
  );
};

describe("CountdownComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly when visible is true", () => {
    const { toJSON } = renderComponent({ visible: true });
    expect(toJSON()).toMatchSnapshot();
  });

  it("should call onContdownCompleted when timerCount is 0", () => {
    const onCompleted = jest.fn();
    renderComponent({ onContdownCompleted: onCompleted });
    expect(onCompleted).toHaveBeenCalled();
  });

  it("should not call startTimer if already running", () => {
    mockIsRunning.mockReturnValue(true);
    renderComponent({ visible: false });
    expect(mockStartTimer).not.toHaveBeenCalled();
  });
});
