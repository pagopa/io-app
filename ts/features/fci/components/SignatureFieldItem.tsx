import { Body, ListItemCheckbox } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  disabled?: boolean;
  onChange: (_: boolean) => void;
  onPressDetail: () => void;
  title: string;
  value?: boolean;
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
        accessibilityLabel={props.title}
        disabled={props.disabled}
        onValueChange={() => {
          onChange(!checked);
        }}
        selected={checked}
        value={props.title}
      />
      <View style={{ flexDirection: "row", paddingTop: 4, paddingBottom: 8 }}>
        <Body
          accessibilityHint={I18n.t(
            "features.fci.signatureFields.accessibility.fieldDetailHint"
          )}
          asLink
          onPress={props.onPressDetail}
          testID="SignatureFieldItemDetailTestID"
          weight="Semibold"
        >
          {I18n.t("features.fci.signatureFields.showOnDocument")}
        </Body>
      </View>
    </View>
  );
};

export default SignatureFieldItem;
