import { StyleSheet, View } from "react-native";
import * as React from "react";
import { ReactNode } from "react";
import { H4 } from "../typography/H4";
import { IOStyles } from "../variables/IOStyles";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import { IOColors } from "../variables/IOColors";
import { Icon } from "../icons/Icon";

export type RadioItem<T> = {
  body: ReactNode;
  id: T;
};

type Props<T> = {
  items: ReadonlyArray<RadioItem<T>>;
  head?: string;
  selectedItem?: T;
  onPress: (selected: T) => void;

  /**
   * This prop will align the radio buttons
   * to the right and the label to the left.
   */
  rightSideSelection?: boolean;
  /**
   * This prop will add a border under the radio button item
   * and modify the padding from {top=10, bottom=10} to {top=20, bottom=0}.
   */
  bordered?: boolean;
};

const styles = StyleSheet.create({
  head: {
    paddingTop: 10,
    paddingBottom: 10
  },
  item: {
    flexDirection: "row",
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    borderColor: IOColors.greyLight
  },
  borderedItem: {
    paddingTop: 20,
    paddingBottom: 0,
    borderBottomWidth: 1
  },
  rightSideItem: {
    flexDirection: "row-reverse"
  },
  itemsContainer: {
    flex: 1,
    flexDirection: "column"
  },
  icon: {
    paddingBottom: 15,
    paddingRight: 20
  },
  rightSideIcon: {
    paddingRight: 0,
    paddingLeft: 20
  }
});

/**
 * return the body relying on the type of the item
 * @param radioItem
 * @param onPress
 */
const getBody = <T,>(
  radioItem: RadioItem<T>,
  onPress: (selected: T) => void
) => {
  const onItemPress = () => onPress(radioItem.id);
  const bodyType = typeof radioItem.body === "string" ? "string" : "node";
  if (bodyType === "string") {
    return (
      <H4
        style={IOStyles.flex}
        color={"bluegreyDark"}
        weight={"Regular"}
        onPress={onItemPress}
      >
        {radioItem.body}
      </H4>
    );
  }
  // node type
  return (
    <TouchableDefaultOpacity style={IOStyles.flex} onPress={onItemPress}>
      {radioItem.body}
    </TouchableDefaultOpacity>
  );
};

/**
 * A list of radio button with an optional heading.
 * The management of the selection is demanded and derived by the `selectedItem` prop.
 * The item with the `id` equal to the `selectedItem` is the active one.
 */
export const RadioButtonList = <T,>(props: Props<T>) => (
  <View>
    {props.head && (
      <H4 color={"bluegreyDark"} weight={"Regular"} style={styles.head}>
        {props.head}
      </H4>
    )}
    <View style={styles.itemsContainer}>
      {props.items.map(item => (
        <View
          key={`radio_item_${item.id}`}
          style={[
            styles.item,
            props.rightSideSelection && styles.rightSideItem,
            props.bordered && styles.borderedItem
          ]}
          testID={`pspItemTestID_${item.id}`}
        >
          <TouchableDefaultOpacity
            onPress={() => props.onPress(item.id)}
            style={[
              styles.icon,
              props.rightSideSelection && styles.rightSideIcon
            ]}
          >
            <Icon
              name={
                props.selectedItem === item.id
                  ? "legIconRadioOn"
                  : "legIconRadioOff"
              }
              size={24}
              color="blue"
            />
          </TouchableDefaultOpacity>
          {getBody(item, () => props.onPress(item.id))}
        </View>
      ))}
    </View>
  </View>
);
