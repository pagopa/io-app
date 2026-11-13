import { isSwitchAccessEnabled } from "@io-app/expo-switch-access";
import { render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import { IOSwitchAccessContextProvider } from "../../../context";
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
  it("exposes informational content as one accessible item", () => {
    const { getByLabelText } = render(
      <ListItemInfo accessibilityLabel="Information" value="Value" />
    );

    const information = getByLabelText("Information");
    expect(information).toHaveProp("accessible", true);
  });

  it("exposes information and end actions as separate accessible items", () => {
    const { getByLabelText } = render(
      <ListItemInfo
        accessibilityLabel="Information"
        endElement={{
          type: "buttonLink",
          componentProps: { label: "Action", onPress: onButtonPress }
        }}
        value="Value"
      />
    );

    expect(getByLabelText("Information")).toHaveProp("accessible", true);
    expect(getByLabelText("Information")).toHaveProp(
      "screenReaderFocusable",
      true
    );
    expect(getByLabelText("Action")).toHaveProp("accessibilityRole", "button");
  });

  it("hides informational content while Switch Access is enabled", async () => {
    jest.mocked(isSwitchAccessEnabled).mockResolvedValueOnce(true);

    const { queryByLabelText } = render(
      <IOSwitchAccessContextProvider>
        <ListItemInfo accessibilityLabel="Information" value="Value" />
      </IOSwitchAccessContextProvider>
    );

    await waitFor(() => {
      expect(queryByLabelText("Information")).toBeNull();
    });
  });

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
        label={"testValue"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNavAlert Snapshot", () => {
    const { toJSON } = render(
      <ListItemNavAlert
        accessibilityLabel={"accessibilityLabel"}
        label={"testValue"}
        onPress={onButtonPress}
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
        description="subtitle"
        isLoading={true}
        label="TITLE"
        onPress={onButtonPress}
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

describe("Test List Item Components - Experimental Enabled", () => {
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
        label={"testValue"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
  it("ListItemNavAlert Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ListItemNavAlert
        accessibilityLabel={"accessibilityLabel"}
        label={"testValue"}
        onPress={onButtonPress}
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
        description="subtitle"
        isLoading={true}
        label="TITLE"
        onPress={onButtonPress}
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
