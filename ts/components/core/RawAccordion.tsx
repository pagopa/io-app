import { View } from "native-base";
import * as React from "react";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import themeVariables from "../../theme/variables";
import customVariables from "../../theme/variables";
import IconFont from "../ui/IconFont";
import { IOStyles } from "./variables/IOStyles";

type Props = {
  // The accordion component must accept one children
  header: React.ReactElement;
  children: React.ReactElement;
};

const styles = StyleSheet.create({
  headerIcon: {
    paddingHorizontal: themeVariables.contentPadding,
    alignSelf: "center"
  },
  row: {
    ...IOStyles.row,
    justifyContent: "space-between"
  }
});

export const RawAccordion: React.FunctionComponent<Props> = props => {
  const [isOpen, setOpen] = useState<boolean>(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(!isOpen)}>
        <View style={styles.row}>
          {props.header}
          <IconFont
            name={"io-right"}
            color={customVariables.brandPrimary}
            size={24}
            style={[
              styles.headerIcon,
              {
                transform: [{ rotateZ: isOpen ? "-90deg" : "90deg" }]
              }
            ]}
          />
        </View>
      </TouchableOpacity>
      {isOpen && props.children}
    </View>
  );
};
