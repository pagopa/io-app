import * as React from "react";
import { useState } from "react";
import { Picker } from "native-base";
import { StyleSheet } from "react-native";
import ArrowDown from "../../../img/features/siciliaVola/arrowDown.svg";
import variables from "../../theme/variables";
import { isAndroid } from "../../utils/platform";
import { IOColors } from "../core/variables/IOColors";
import { fromNullable } from "fp-ts/lib/Option";

type PickerItem = {
  label: string;
  value?: string;
};

type Props = {
  items: ReadonlyArray<PickerItem>;
  onValueChange: (value: string) => void;
  placeholder?: string;
  selectedValue?: string;
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
    alignSelf: "auto"
  }
});

const addAndroidPlaceholder = (
  placeholder: string,
  items: ReadonlyArray<PickerItem>
): ReadonlyArray<PickerItem & { disabled?: boolean }> => {
  const placeholderItem: PickerItem & { disabled?: boolean } = {
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
const ItemsPicker: React.FunctionComponent<Props> = (props: Props) => {
  const [selectedValue, setSelectedValue] = useState();

  const handleValueChange = (value: string, _: number) =>
    fromNullable(value).map(v => props.onValueChange(v));

  return (
    <Picker
      enabled={true}
      collapsable={true}
      selectedValue={selectedValue}
      onValueChange={handleValueChange}
      headerTitleStyle={styles.headerTitle}
      headerBackButtonTextStyle={styles.headerBackButton}
      placeholder={props.placeholder}
      iosIcon={
        <ArrowDown width={variables.iconSize3} height={variables.iconSize3} />
      }
      style={styles.picker}
    >
      {generateItems(
        [
          { value: "pippo", label: "pippo" },
          { value: "pluto", label: "pluto" }
        ],
        props.placeholder
      )}
    </Picker>
  );
};

export default ItemsPicker;
