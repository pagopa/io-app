import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { BonusAvailable } from "../../../../../../definitions/content/BonusAvailable";
import { AvailableBonusItem } from "../AvailableBonusItem";

const bonusMockContent = {
  name: "Bonus Test",
  description: "Fino a...",
  subtitle: "L'incentivo per...",
  title: "Richiesta Bonus",
  content: "",
  tos_url: ""
};

const bonusItem: BonusAvailable = {
  id_type: 4,
  it: bonusMockContent,
  en: bonusMockContent,
  valid_from: new Date(),
  valid_to: new Date(),
  is_active: false
};

describe("AvailableBonusItem", () => {
  it("should render correctly with no badge", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <AvailableBonusItem
        bonusItem={bonusItem}
        onPress={onPress}
        state="active"
      />
    );
    const touchable = getByTestId("AvailableBonusItem-4");
    fireEvent.press(touchable);
    expect(onPress).toHaveBeenCalled();
  });

  it("should render correctly with incoming state", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AvailableBonusItem
        bonusItem={bonusItem}
        onPress={onPress}
        state="incoming"
      />
    );
    const element = getByText(I18n.t("wallet.methods.comingSoon"));
    expect(element).toBeTruthy();
  });

  it("should render correctly with completed state", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AvailableBonusItem
        bonusItem={bonusItem}
        onPress={onPress}
        state="completed"
      />
    );
    const element = getByText(I18n.t("bonus.state.completed.caption"));
    expect(element).toBeTruthy();
  });
});
