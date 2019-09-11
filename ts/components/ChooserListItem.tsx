import { Either } from "fp-ts/lib/Either";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import variables from "../theme/variables";
import customVariables from "../theme/variables";
import ButtonWithoutOpacity from "./ButtonWithoutOpacity";
import TouchableWithoutOpacity from "./TouchableWithoutOpacity";
import IconFont from "./ui/IconFont";

type Props = Readonly<{
  itemTitle: string;
  itemId: string;
  itemIconComponent?: Either<
    (itemId: string) => React.ReactElement,
    React.ReactElement
  >;
  onPressItem: (itemId: string) => void;
  isItemSelected: boolean;
}>;

const styles = StyleSheet.create({
  container: {
    paddingLeft: customVariables.contentPadding,
    paddingRight: customVariables.contentPadding,
    paddingTop: customVariables.contentPadding / 2,
    paddingBottom: customVariables.contentPadding / 2,
    flexDirection: "row",
    alignItems: "center",
    height: 65
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 50
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    marginTop: 4,
    color: customVariables.brandDarkestGray
  }
});

/**
 * A component for selectable list item with icon (optional) and text
 * the checkbox for the selection is present by default
 */
export default class ChooserListItem extends React.Component<Props> {
  public render() {
    const { isItemSelected, itemIconComponent, itemId, itemTitle } = this.props;

    const iconName = isItemSelected ? "io-checkbox-on" : "io-checkbox-off";
    const iconColor = isItemSelected
      ? variables.selectedColor
      : variables.unselectedColor;

    const icon = itemIconComponent
      ? itemIconComponent.getOrElseL(f => f(itemId))
      : itemIconComponent;

    return (
      <TouchableWithoutOpacity onPress={this.handleOnPress}>
        <View style={styles.container}>
          {icon && <View>{icon}</View>}
          <View style={styles.content}>
            <Text numberOfLines={2} bold={true} style={styles.title}>
              {itemTitle}
            </Text>
          </View>
          <ButtonWithoutOpacity onPress={this.handleOnPress} transparent={true}>
            <IconFont name={iconName} color={iconColor} />
          </ButtonWithoutOpacity>
        </View>
      </TouchableWithoutOpacity>
    );
  }

  private handleOnPress = () => {
    this.props.onPressItem(this.props.itemId);
  };
}
