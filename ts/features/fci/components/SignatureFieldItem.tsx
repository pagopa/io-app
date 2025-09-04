import { Body, ListItemCheckbox } from "@pagopa/io-app-design-system";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";

type Props = {
  title: string;
  value?: boolean;
  disabled?: boolean;
  onChange: (_: boolean) => void;
  onPressDetail: () => void;
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 16
  }
});

const SignatureFieldItem = (props: Props) => {
  const [checked, setChecked] = useState(props.value || false);
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
      <View style={{ flexDirection: "row", paddingTop: 4, paddingBottom: 8 }}>
        <Body
          testID="SignatureFieldItemDetailTestID"
          weight="Semibold"
          asLink
          onPress={props.onPressDetail}
          accessibilityHint={I18n.t(
            "features.fci.signatureFields.accessibility.fieldDetailHint"
          )}
        >
          {I18n.t("features.fci.signatureFields.showOnDocument")}
        </Body>
      </View>
    </View>
  );
};

export default SignatureFieldItem;
