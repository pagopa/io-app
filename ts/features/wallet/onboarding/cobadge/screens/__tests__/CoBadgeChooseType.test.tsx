import { render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import CoBadgeChooseType from "../CoBadgeChooseType";

const getComponent = (onAddPaymentMethod: () => void) => {
  const mockStore = configureMockStore();

  const store: ReturnType<typeof mockStore> = mockStore();
  return render(
    <Provider store={store}>
      <CoBadgeChooseType />
    </Provider>
  );
};
