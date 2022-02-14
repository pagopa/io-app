import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { constNull } from "fp-ts/lib/function";
import { BottomSheetMethodsToDelete } from "../optInStatus/BottomSheetMethodsToDelete";
import { mockPrivativeCard } from "../../../../../store/reducers/wallet/__mocks__/wallets";

jest.mock("@gorhom/bottom-sheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const react = require("react-native");
  return {
    __esModule: true,
    BottomSheetScrollView: react.ScrollView,
    TouchableWithoutFeedback: react.TouchableWithoutFeedback
  };
});

describe("BottomSheetMethodsToDelete", () => {
  jest.useFakeTimers();
  it(`component should be defined`, () => {
    const renderComponent = render(
      <BottomSheetMethodsToDelete
        onDeletePress={constNull}
        paymentMethods={[mockPrivativeCard]}
      />
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
        <BottomSheetMethodsToDelete
          onDeletePress={constNull}
          paymentMethods={paymentMethods}
        />
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

    it(`footer buttons should be tappable`, () => {
      const paymentMethods = [
        { ...mockPrivativeCard, idWallet: 1 },
        { ...mockPrivativeCard, idWallet: 2 },
        { ...mockPrivativeCard, idWallet: 3 }
      ];
      const deleteHandler = jest.fn();
      const cancelHandler = jest.fn();
      const renderComponent = render(
        <BottomSheetMethodsToDelete
          onDeletePress={deleteHandler}
          onCancelPress={cancelHandler}
          paymentMethods={paymentMethods}
        />
      );
      expect(
        renderComponent.queryByTestId("cancelButtonTestID")
      ).not.toBeNull();
      expect(
        renderComponent.queryByTestId("deleteButtonTestID")
      ).not.toBeNull();
      fireEvent.press(renderComponent.queryByTestId("cancelButtonTestID")!);
      fireEvent.press(renderComponent.queryByTestId("deleteButtonTestID")!);
      expect(deleteHandler).toBeCalledTimes(1);
      expect(cancelHandler).toBeCalledTimes(1);
    });
  });
});
