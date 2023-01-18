import { fireEvent, render } from "@testing-library/react-native";
import { View } from "react-native";
import * as React from "react";
import { CardLogoPreview } from "../card/CardLogoPreview";
import anImage from "../../../../../img/wallet/cards-icons/bPay.png";

describe("CardLogoPreview", () => {
  it("should show the left component, the image and when press should run the onPress", () => {
    const left = () => <View testID="leftComponent" />;
    const onPress = jest.fn();
    const component = render(
      <CardLogoPreview left={left()} image={anImage} onPress={onPress} />
    );
    const cardImage = component.queryByTestId("cardImage");
    const cardPreview = component.queryByTestId("cardPreview");

    expect(component.queryByTestId("leftComponent")).not.toBeNull();
    expect(cardImage).not.toBeNull();
    expect(cardImage).toHaveProp("source", anImage);

    if (cardPreview !== null) {
      fireEvent.press(cardPreview);
      expect(onPress).toHaveBeenCalledTimes(1);
    }
  });
});
