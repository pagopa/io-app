import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  IOColors,
  IOStyles,
  LabelLink,
  ListItemCheckbox
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
    borderBottomColor: IOColors.greyLight,
    borderBottomWidth: 1
  },
  details: {
    paddingTop: 16,
    paddingBottom: 8
  }
});

const SignatureFieldItem = (props: Props) => {
  const [checked, setChecked] = React.useState(props.value || false);
  const onChange = (value: boolean) => {
    setChecked(value);
    props.onChange(value);
  };

  return (
    <View style={styles.container}>
      <ListItemCheckbox
        value={props.title}
        disabled={props.disabled}
        selected={checked}
        onValueChange={() => {
          onChange(!checked);
        }}
        accessibilityLabel={
          checked
            ? I18n.t("features.fci.signatureFields.accessibility.selected")
            : I18n.t("features.fci.signatureFields.accessibility.unselected")
        }
      />
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
