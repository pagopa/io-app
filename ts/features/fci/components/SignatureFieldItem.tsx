import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  H6,
  IOColors,
  IOStyles,
  IconButton,
  LabelLink
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";

type Props = {
  title: string;
  value?: boolean;
  disabled?: boolean;
  onChange: (_: boolean) => void;
  onPressDetail: () => void;
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 16,
    flexDirection: "column",
    borderBottomColor: IOColors.greyLight,
    borderBottomWidth: 1
  },
  details: {
    paddingTop: 16,
    paddingBottom: 8
  },
  titleMargin: { marginRight: 22, flex: 1 }
});

const SignatureFieldItem = (props: Props) => {
  const [checked, setChecked] = React.useState(props.value || false);
  const onChange = (value: boolean) => {
    setChecked(value);
    props.onChange(value);
  };

  return (
    <View style={styles.container}>
      <View style={IOStyles.row}>
        <H6 style={styles.titleMargin} testID="SignatureFieldItemTitleTestID">
          {props.title}
        </H6>
        <IconButton
          testID="SignatureFieldItemCheckboxTestID"
          disabled={props.disabled}
          onPress={() => {
            onChange(!checked);
          }}
          accessibilityLabel={
            checked
              ? I18n.t("features.fci.signatureFields.accessibility.selected")
              : I18n.t("features.fci.signatureFields.accessibility.unselected")
          }
          icon={checked ? "legCheckOn" : "legCheckOff"}
          iconSize={24}
        />
      </View>
      <View style={[IOStyles.row, styles.details]}>
        <LabelLink
          accessibilityLabel={I18n.t(
            "features.fci.signatureFields.showOnDocument"
          )}
          accessibilityRole="link"
          accessibilityHint={I18n.t(
            "features.fci.signatureFields.accessibility.fieldDetailHint"
          )}
          testID="SignatureFieldItemDetailTestID"
          onPress={props.onPressDetail}
        >
          {I18n.t("features.fci.signatureFields.showOnDocument")}
        </LabelLink>
      </View>
    </View>
  );
};

export default SignatureFieldItem;
