import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import customVariables from "../theme/variables";
import { VSpacer } from "./core/spacer/Spacer";
import { H3 } from "./core/typography/H3";
import TouchableDefaultOpacity from "./TouchableDefaultOpacity";
import { IOColors } from "./core/variables/IOColors";
import { IOIcons, Icon } from "./core/icons";

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
  }
});

/**
 * A component for selectable list item with icon (optional) and text
 * the checkbox for the selection is present by default
 */
export default class ChooserListItem extends React.Component<Props> {
  public render() {
    const { isItemSelected, itemIconComponent, itemId, itemTitle } = this.props;

    const iconName: IOIcons = isItemSelected ? "legCheckOn" : "legCheckOff";
    const iconColor: IOColors = isItemSelected ? "blue" : "bluegrey";

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
            <VSpacer size={4} />
            <H3 weight="Bold" color="bluegreyDark" numberOfLines={2}>
              {itemTitle}
            </H3>
          </View>
          <TouchableDefaultOpacity onPress={this.handleOnPress}>
            <Icon name={iconName} color={iconColor} size={22} />
          </TouchableDefaultOpacity>
        </View>
      </TouchableDefaultOpacity>
    );
  }

  private handleOnPress = () => {
    this.props.onPressItem(this.props.itemId);
  };
}
