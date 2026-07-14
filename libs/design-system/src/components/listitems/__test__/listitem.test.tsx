import { render } from "@testing-library/react-native";
import { Alert } from "react-native";

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
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        value={"testValue"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemInfoCopy Snapshot", () => {
    const { toJSON } = render(
      <ListItemInfoCopy
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        onPress={onButtonPress}
        value={"testValue"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNav Snapshot", () => {
    const { toJSON } = render(
      <ListItemNav
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
        value={"testValue"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNavAlert Snapshot", () => {
    const { toJSON } = render(
      <ListItemNavAlert
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
        value={"testValue"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemAction Snapshot", () => {
    const { toJSON } = render(
      <ListItemAction
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        onPress={onButtonPress}
        variant={"primary"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemTransaction Snapshot", () => {
    const { toJSON } = render(
      <ListItemTransaction
        isLoading={true}
        onPress={onButtonPress}
        subtitle="subtitle"
        title="TITLE"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "€ 1.000,00"
        }}
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
        isSuggested={true}
        label="label"
        selected={true}
        suggestReason="suggestReason"
      />
    );
    const { toJSON: toJSONNotSuggested } = render(
      <ListItemRadioWithAmount
        formattedAmountString="€ 1.000,00"
        isSuggested={false}
        label="label"
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
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        value={"testValue"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemInfoCopy Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemInfoCopy
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        onPress={onButtonPress}
        value={"testValue"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNav Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemNav
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
        value={"testValue"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNavAlert Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemNavAlert
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
        value={"testValue"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemAction Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemAction
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        onPress={onButtonPress}
        variant={"primary"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemTransaction Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemTransaction
        isLoading={true}
        onPress={onButtonPress}
        subtitle="subtitle"
        title="TITLE"
        transaction={{
          amount: "€ 1.000,00",
          amountAccessibilityLabel: "€ 1.000,00"
        }}
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
          isSuggested={true}
          label="label"
          selected={true}
          suggestReason="suggestReason"
        />
      );
    const { toJSON: toJSONNotSuggested } =
      renderWithExperimentalEnabledContextProvider(
        <ListItemRadioWithAmount
          formattedAmountString="€ 1.000,00"
          isSuggested={false}
          label="label"
        />
      );
    expect(toJSONSuggested()).toMatchSnapshot();
    expect(toJSONNotSuggested()).toMatchSnapshot();
  });
});
