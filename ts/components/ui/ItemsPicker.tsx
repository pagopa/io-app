import * as React from "react";
import { useState } from "react";
import { Picker } from "native-base";
import { Platform, StyleSheet } from "react-native";
import ArrowDown from "../../../img/features/siciliaVola/arrowDown.svg";
import variables from "../../theme/variables";
import { isAndroid } from "../../utils/platform";

type PickerItem = {
  label: string;
  value: string;
};

type Props = {
  items: ReadonlyArray<PickerItem>;
  // onValueChange: (value: string, key: number) => void;
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
  return (
    <Picker
      enabled={true}
      collapsable={true}
      selectedValue={selectedValue}
      onValueChange={(itemValue, _) => setSelectedValue(itemValue)}
      headerTitleStyle={styles.headerTitle}
      headerBackButtonTextStyle={styles.headerBackButton}
      placeholder={props.placeholder}
      iosIcon={
        <ArrowDown width={variables.iconSize3} height={variables.iconSize3} />
      }
      style={styles.picker}
    >
      {props.placeholder && Platform.OS === "android" && (
        <Picker.Item label={props.placeholder} value="" color="#c1c1c1" />
      )}
      <Picker.Item label={"pippo"} value={"pippo"} />
      <Picker.Item label={"pluto"} value={"pluto"} />
    </Picker>
  );
};

export default ItemsPicker;
