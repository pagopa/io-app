import {
  Body,
  IOColors,
  IOStyles,
  ListItemCheckbox
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
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
        accessibilityLabel={props.title}
      />
      <View style={[IOStyles.row, styles.details]}>
        <Body
          weight="Semibold"
          asLink
          accessibilityLabel={I18n.t(
            "features.fci.signatureFields.showOnDocument"
          )}
          accessibilityHint={I18n.t(
            "features.fci.signatureFields.accessibility.fieldDetailHint"
          )}
          onPress={props.onPressDetail}
          testID="SignatureFieldItemDetailTestID"
        >
          {I18n.t("features.fci.signatureFields.showOnDocument")}
        </Body>
      </View>
    </View>
  );
};

export default SignatureFieldItem;
