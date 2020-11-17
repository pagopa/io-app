import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react-native";

export const renderWithRedux = (
  ui: any,
  { initialState, store, ...renderOptions }: any = {}
) => {
  function Wrapper({ children }: any) {
    return <Provider store={store}>{children}</Provider>;
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
