import { StyleSheet, View } from "react-native";
import * as React from "react";
import { ReactNode } from "react";
import { H4 } from "../typography/H4";
import { IOStyles } from "../variables/IOStyles";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import IconFont from "./../../ui/IconFont";
import themeVariables from "./../../../theme/variables";

export type RadioItem<T> = {
  body: ReactNode;
  id: T;
};

type Props<T> = {
  items: ReadonlyArray<RadioItem<T>>;
  head?: string;
  selectedItem?: T;
  onPress: (selected: T) => void;
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
    paddingBottom: 10
  },
  itemsContainer: {
    flex: 1,
    flexDirection: "column"
  },
  icon: {
    paddingBottom: 15,
    paddingRight: 20
  }
});

/**
 * return the body relying on the type of the item
 * @param radioItem
 * @param onPress
 */
const getBody = <T extends unknown>(
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
export const RadioButtonList = <T extends unknown>(props: Props<T>) => (
  <View>
    {props.head && (
      <H4 color={"bluegreyDark"} weight={"Regular"} style={styles.head}>
        {props.head}
      </H4>
    )}
    <View style={styles.itemsContainer}>
      {props.items.map((item, key) => (
        <View key={`radio_item_${key}`} style={styles.item}>
          <IconFont
            name={
              props.selectedItem === item.id ? "io-radio-on" : "io-radio-off"
            }
            size={24}
            color={themeVariables.contentPrimaryBackground}
            onPress={() => props.onPress(item.id)}
            style={styles.icon}
          />
          {getBody(item, () => props.onPress(item.id))}
        </View>
      ))}
    </View>
  </View>
);
