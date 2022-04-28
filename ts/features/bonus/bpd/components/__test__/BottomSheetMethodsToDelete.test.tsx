import { render } from "@testing-library/react-native";
import React from "react";
import { BottomSheetMethodsToDelete } from "../optInStatus/BottomSheetMethodsToDelete";
import { mockPrivativeCard } from "../../../../../store/reducers/wallet/__mocks__/wallets";

describe("BottomSheetMethodsToDelete", () => {
  jest.useFakeTimers();
  it(`component should be defined`, () => {
    const renderComponent = render(
      <BottomSheetMethodsToDelete paymentMethods={[mockPrivativeCard]} />
    );
    expect(
      renderComponent.queryByTestId("BottomSheetMethodsToDeleteTestID")
    ).not.toBeNull();
  });

  describe("when some methods are available", () => {
    it(`should shown all these items`, () => {
      const paymentMethods = [
        { ...mockPrivativeCard, idWallet: 1 },
        { ...mockPrivativeCard, idWallet: 2 },
        { ...mockPrivativeCard, idWallet: 3 }
      ];
      const renderComponent = render(
        <BottomSheetMethodsToDelete paymentMethods={paymentMethods} />
      );
      expect(
        renderComponent.queryByTestId("BottomSheetMethodsToDeleteTestID")
      ).not.toBeNull();
      paymentMethods.forEach(pm => {
        expect(
          renderComponent.queryByTestId(`payment_method_${pm.idWallet}`)
        ).not.toBeNull();
      });
    });
  });
});
