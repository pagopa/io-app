import { Alert } from "react-native";
import { render } from "@testing-library/react-native";
import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { ListItemAction } from "../ListItemAction";
import { ListItemInfo } from "../ListItemInfo";
import { ListItemInfoCopy } from "../ListItemInfoCopy";
import { ListItemNav } from "../ListItemNav";
import { ListItemNavAlert } from "../ListItemNavAlert";
import { ListItemRadioWithAmount } from "../ListItemRadioWithAmount";
import { ListItemTransaction } from "../ListItemTransaction";
import { PressableListItemBase } from "../PressableListItemBase";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test List Item Components", () => {
  it("ListItemInfo Snapshot", () => {
    const { toJSON } = render(
      <ListItemInfo
        label={"label"}
        value={"testValue"}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemInfoCopy Snapshot", () => {
    const { toJSON } = render(
      <ListItemInfoCopy
        label={"label"}
        value={"testValue"}
        onPress={onButtonPress}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNav Snapshot", () => {
    const { toJSON } = render(
      <ListItemNav
        value={"testValue"}
        onPress={onButtonPress}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNavAlert Snapshot", () => {
    const { toJSON } = render(
      <ListItemNavAlert
        value={"testValue"}
        onPress={onButtonPress}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemAction Snapshot", () => {
    const { toJSON } = render(
      <ListItemAction
        label={"label"}
        variant={"primary"}
        onPress={onButtonPress}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemTransaction Snapshot", () => {
    const { toJSON } = render(
      <ListItemTransaction
        title="TITLE"
        subtitle="subtitle"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "€ 1.000,00"
        }}
        isLoading={true}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("PressableListItemsBase Snapshot", () => {
    const { toJSON } = render(<PressableListItemBase />);
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemRadioWithAmount Snapshot", () => {
    const { toJSON: toJSONSuggested } = render(
      <ListItemRadioWithAmount
        formattedAmountString="€ 1.000,00"
        label="label"
        suggestReason="suggestReason"
        isSuggested={true}
        selected={true}
      />
    );
    const { toJSON: toJSONNotSuggested } = render(
      <ListItemRadioWithAmount
        formattedAmountString="€ 1.000,00"
        label="label"
        isSuggested={false}
      />
    );
    expect(toJSONSuggested()).toMatchSnapshot();
    expect(toJSONNotSuggested()).toMatchSnapshot();
  });
});

describe("Test List Item Components - Experimental Enabled ", () => {
  it("ListItemInfo Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemInfo
        label={"label"}
        value={"testValue"}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemInfoCopy Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemInfoCopy
        label={"label"}
        value={"testValue"}
        onPress={onButtonPress}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNav Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemNav
        value={"testValue"}
        onPress={onButtonPress}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNavAlert Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemNavAlert
        value={"testValue"}
        onPress={onButtonPress}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemAction Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemAction
        label={"label"}
        variant={"primary"}
        onPress={onButtonPress}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemTransaction Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemTransaction
        title="TITLE"
        subtitle="subtitle"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "€ 1.000,00"
        }}
        isLoading={true}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("PressableListItemsBase Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <PressableListItemBase />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemRadioWithAmount Snapshot", () => {
    const { toJSON: toJSONSuggested } =
      renderWithExperimentalEnabledContextProvider(
        <ListItemRadioWithAmount
          formattedAmountString="€ 1.000,00"
          label="label"
          suggestReason="suggestReason"
          isSuggested={true}
          selected={true}
        />
      );
    const { toJSON: toJSONNotSuggested } =
      renderWithExperimentalEnabledContextProvider(
        <ListItemRadioWithAmount
          formattedAmountString="€ 1.000,00"
          label="label"
          isSuggested={false}
        />
      );
    expect(toJSONSuggested()).toMatchSnapshot();
    expect(toJSONNotSuggested()).toMatchSnapshot();
  });
});
