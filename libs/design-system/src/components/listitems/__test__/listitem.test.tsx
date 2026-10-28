import { fireEvent, render } from "@testing-library/react-native";
import { Alert, Image, View } from "react-native";

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
  it.each([
    { name: "plain content", withAction: false, withLongPress: false },
    { name: "an end action", withAction: true, withLongPress: false },
    { name: "long press", withAction: true, withLongPress: true }
  ])(
    "displays a decorative image with $name",
    ({ withAction, withLongPress }) => {
      const imageSource = { uri: "https://example.com/image.png" };
      const onPress = jest.fn();
      const {
        UNSAFE_getByType,
        UNSAFE_getAllByType,
        UNSAFE_queryByType,
        getByText,
        getByLabelText
      } = render(
        <ListItemInfo
          accessibilityLabel="Information"
          endElement={
            withAction
              ? {
                  type: "iconButton",
                  componentProps: {
                    icon: "info",
                    accessibilityLabel: "Details",
                    onPress
                  }
                }
              : undefined
          }
          imageSource={imageSource}
          label="Label"
          onLongPress={withLongPress ? onButtonPress : undefined}
          value="Value"
        />
      );

      const image = UNSAFE_getByType(Image);
      expect(image.props.source).toEqual(imageSource);
      expect(
        UNSAFE_getAllByType(View).some(
          view =>
            view.props.importantForAccessibility === "no-hide-descendants" &&
            view.findAllByType(Image).length === 1
        )
      ).toBe(true);
      expect(getByText("Label", { includeHiddenElements: true })).toBeTruthy();
      expect(getByText("Value", { includeHiddenElements: true })).toBeTruthy();
      if (withAction) {
        fireEvent.press(getByLabelText("Details"));
        expect(onPress).toHaveBeenCalledTimes(1);
      }

      fireEvent(image, "error");
      expect(UNSAFE_queryByType(Image)).toBeNull();
      expect(getByText("Value", { includeHiddenElements: true })).toBeTruthy();
      if (withAction) {
        fireEvent.press(getByLabelText("Details"));
        expect(onPress).toHaveBeenCalledTimes(2);
      }
    }
  );

  it("displays a new image after a previous source failed", () => {
    const { UNSAFE_getByType, rerender } = render(
      <ListItemInfo
        imageSource={{ uri: "https://example.com/old.png" }}
        value="Value"
      />
    );
    fireEvent(UNSAFE_getByType(Image), "error");

    const imageSource = { uri: "https://example.com/new.png" };
    rerender(<ListItemInfo imageSource={imageSource} value="Value" />);

    expect(UNSAFE_getByType(Image).props.source).toEqual(imageSource);
  });

  it("keeps informational content out of keyboard focus", () => {
    const { getByLabelText } = render(
      <ListItemInfo accessibilityLabel="Information" value="Value" />
    );

    const information = getByLabelText("Information");
    expect(information).toHaveProp("accessible", false);
    expect(information).toHaveProp("screenReaderFocusable", true);
  });

  it("keeps end actions separate from informational content", () => {
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

    expect(getByLabelText("Information")).toHaveProp("accessible", false);
    expect(getByLabelText("Action")).toHaveProp("accessibilityRole", "button");
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
