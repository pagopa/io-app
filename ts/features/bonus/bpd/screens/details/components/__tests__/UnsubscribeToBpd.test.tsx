import configureMockStore from "redux-mock-store";
import { fireEvent, render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import * as React from "react";
import UnsubscribeToBpd from "../unsubscribe/UnsubscribeToBpd";

const mockMyPresent = jest.fn();
jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({
    present: mockMyPresent
  })
}));

const mockStore = configureMockStore();

describe("Ranking ready vs not ready", () => {
  it("with ranking: ready, remote ranking: undefined should display SuperCashbackRankingNotReady", () => {
    const store = mockStore();

    const component = render(
      <Provider store={store}>
        <UnsubscribeToBpd />
      </Provider>
    );
    expect(component).toBeDefined();
    const openBSButton = component.getByTestId("UnsubscribeOpenBSButtonTestID");
    if (openBSButton) {
      fireEvent.press(openBSButton);
      expect(mockMyPresent).toHaveBeenCalled();
    }
  });
});
