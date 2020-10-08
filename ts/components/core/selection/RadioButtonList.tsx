import { View } from "react-native";
import * as React from "react";
import { H4 } from "../typography/H4";
import IconFont from "./../../ui/IconFont";
import themeVariables from "./../../../theme/variables";

type RadioItem = {
  label: string;
  id: number;
};

type Props = {
  items: Array<RadioItem>;
  head?: string;
  selectedItem: number;
  onPress: (selected: number) => void;
};

/**
 * A list of radio button with an optional heading.
 * The management of the selection is demanded and drived by the `selectedItem` prop.
 * The item with the `id` equal to the `selectedItem` is the active one.
 */
export const RadioButtonList: React.FunctionComponent<Props> = (
  props: Props
) => {
  const styles = {
    head: {
      paddingTop: 10,
      paddingBottom: 10
    },
    item: {
      flexDirection: "row" as const,
      flex: 1,
      paddingTop: 10,
      paddingBottom: 10
    },
    itemsContainer: {
      flex: 1,
      flexDirection: "column" as const
    },
    icon: {
      paddingBottom: 15,
      paddingRight: 20
    }
  };

  return (
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
              onPress={() => props.onPress(key)}
              style={styles.icon}
            />
            <H4 color={"bluegreyDark"} weight={"Regular"} style={{ flex: 1 }}>
              {item.label}
            </H4>
          </View>
        ))}
      </View>
    </View>
  );
};
