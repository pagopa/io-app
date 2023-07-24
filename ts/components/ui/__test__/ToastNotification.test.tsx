import React from "react";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import { Toast, ToastNotification } from "../ToastNotification";

describe("Test ToastNotification component", () => {
  it.each<Toast>([
    { message: "Hello", icon: "checkTick" },
    { message: "Hello", variant: "error" },
    { message: "Hello", variant: "info" },
    { message: "Hello", variant: "neutral" },
    { message: "Hello", variant: "success" },
    { message: "Hello", variant: "warning" }
  ])("should match snapshot for props (%s)", toast => {
    const component = renderComponent(toast);
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (toast: Toast) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <ToastNotification {...toast} />,
      ROUTES.MAIN,
      {},
      store
    ),
    store
  };
};
