import * as React from "react";
import { Picker } from "native-base";
import { StyleSheet } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import ArrowDown from "../../../img/features/siciliaVola/arrowDown.svg";
import variables from "../../theme/variables";
import { isAndroid } from "../../utils/platform";
import { IOColors } from "../core/variables/IOColors";

type PickerItem = {
  label: string;
  value?: string | number;
};

export type PickerItems = ReadonlyArray<PickerItem>;

type Props = {
  items: ReadonlyArray<PickerItem>;
  onValueChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  selectedValue?: string | number;
};

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: "Titillium Web",
    color: "black",
    textAlign: "auto",
    paddingLeft: 15
  },
  headerBackButton: {
    fontFamily: "Titillium Web",
    color: "black",
    fontSize: 16,
    textAlign: "auto",
    lineHeight: undefined,
    paddingLeft: 0,
    fontWeight: "300"
  },
  picker: {
    flex: 1,
    justifyContent: "space-between",
    alignSelf: "auto",
    borderBottomWidth: 1,
    borderBottomColor: IOColors.bluegreyLight
  }
});

const addAndroidPlaceholder = (
  placeholder: string,
  items: ReadonlyArray<PickerItem>
): ReadonlyArray<PickerItem & { disabled?: boolean }> => {
  const placeholderItem: PickerItem & {
    disabled?: boolean;
  } = {
    label: placeholder,
    value: undefined,
    disabled: true
  };

  return [placeholderItem].concat(
    ...items.map(i => ({ ...i, disabled: false }))
  );
};

const generateItems = (
  items: ReadonlyArray<PickerItem>,
  placeholder?: string
) => {
  if (isAndroid && placeholder) {
    return addAndroidPlaceholder(placeholder, items).map(i => (
      <Picker.Item
        label={i.label}
        value={undefined}
        color={i.disabled ? IOColors.bluegreyLight : IOColors.bluegreyDark}
        key={i.value}
      />
    ));
  }
  return items.map(i => <Picker.Item label={i.label} value={i.value} />);
};
/**
 * Wrapper around the native-base Picker component.
 * in addition to the functionality of the native-base component it adds:
 * - the icon for IOS
 * - the placeholder management
 * @param props
 * @constructor
 */
const ItemsPicker = (props: Props) => {
  const handleValueChange = (value: string | number, _: number) =>
    fromNullable(value).map(v => props.onValueChange(v));

  return (
    <Picker
      enabled={!props.disabled}
      collapsable={true}
      selectedValue={props.selectedValue}
      onValueChange={handleValueChange}
      headerTitleStyle={styles.headerTitle}
      headerBackButtonTextStyle={styles.headerBackButton}
      placeholder={props.placeholder}
      iosIcon={
        <ArrowDown width={variables.iconSize3} height={variables.iconSize3} />
      }
      style={styles.picker}
    >
      {generateItems(props.items, props.placeholder)}
    </Picker>
  );
};

export default ItemsPicker;
