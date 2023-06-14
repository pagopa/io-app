import { View } from "react-native";
import * as React from "react";
import { IOIcons } from "../icons/Icon";
import { RadioListItem } from "../../ui/RadioListItem";
import { Divider } from "../Divider";

export type NewRadioItem<T> = {
  id: T;
  value: string;
  description?: string;
  icon?: IOIcons;
  disabled?: boolean;
};

type Props<T> = {
  items: ReadonlyArray<NewRadioItem<T>>;
  selectedItem?: T;
  onPress: (selected: T) => void;
};

/**
 * A list of radio buttons.
 * The management of the selection is demanded and derived by the `selectedItem` prop.
 * The item with the `id` equal to the `selectedItem` is the active one.
 */
export const RadioGroup = <T,>({ items, selectedItem, onPress }: Props<T>) => (
  <View>
    {items.map((item, index) => (
      <React.Fragment key={`radio_item_${item.id}`}>
        <RadioListItem
          testID={`RadioItemTestID_${item.id}`}
          value={item.value}
          description={item.description}
          icon={item.icon}
          disabled={item.disabled}
          onValueChange={() => onPress(item.id)}
          selected={selectedItem === item.id}
        />
        {index < items.length - 1 && <Divider />}
      </React.Fragment>
    ))}
  </View>
);
