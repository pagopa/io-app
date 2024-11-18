import React from "react";
import { StyleSheet, View } from "react-native";
import {
  H6,
  HSpacer,
  IOColors,
  LabelSmall,
  VSpacer
} from "@pagopa/io-app-design-system";
import { CheckBox } from "../../../../components/core/selection/checkbox/CheckBox";
import { IOStyles } from "../../../../components/core/variables/IOStyles";

type Props = {
  title: string;
  subtitle: string;
  checked: boolean;
  onValueChange?: (newValue: boolean) => void;
};

const UnsubscriptionCheckListItem = (props: Props) => (
  <View style={styles.listItem}>
    <View style={IOStyles.row}>
      <View style={IOStyles.flex}>
        <H6>{props.title}</H6>
        <VSpacer size={4} />
        <LabelSmall color="bluegrey" weight="Regular">
          {props.subtitle}
        </LabelSmall>
      </View>
      <HSpacer size={24} />
      <CheckBox {...props} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: IOColors["grey-100"],
    paddingVertical: 16
  }
});

export { UnsubscriptionCheckListItem };
