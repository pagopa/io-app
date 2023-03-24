import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import customVariables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import TouchableDefaultOpacity from "./TouchableDefaultOpacity";
import IconFont from "./ui/IconFont";

type Props = Readonly<{
  itemTitle: string;
  itemId: string;
  itemIconComponent?: E.Either<
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
    color: customVariables.textColorDark
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
      ? customVariables.selectedColor
      : customVariables.unselectedColor;

    const icon = itemIconComponent
      ? pipe(
          itemIconComponent,
          E.getOrElse(f => f(itemId))
        )
      : itemIconComponent;

    return (
      <TouchableDefaultOpacity onPress={this.handleOnPress}>
        <View style={styles.container}>
          {icon && <View>{icon}</View>}
          <View style={styles.content}>
            <NBText numberOfLines={2} bold={true} style={styles.title}>
              {itemTitle}
            </NBText>
          </View>
          <ButtonDefaultOpacity onPress={this.handleOnPress} transparent={true}>
            <IconFont name={iconName} color={iconColor} />
          </ButtonDefaultOpacity>
        </View>
      </TouchableDefaultOpacity>
    );
  }

  private handleOnPress = () => {
    this.props.onPressItem(this.props.itemId);
  };
}
