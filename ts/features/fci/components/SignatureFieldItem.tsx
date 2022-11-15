import * as React from "react";
import { View } from "native-base";
import { StyleSheet, Text } from "react-native";
import { H4 } from "../../../components/core/typography/H4";
import IconFont from "../../../components/ui/IconFont";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { IOColors } from "../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import I18n from "../../../i18n";

type Props = {
  title: string;
  value?: boolean;
  onChange: (_: boolean) => void;
  onPressDetail: () => void;
};

const styles = StyleSheet.create({
  borderBottom: {
    borderBottomColor: IOColors.greyLight,
    borderBottomWidth: 1,
    paddingBottom: 14
  }
});

const SignatureFieldItem = (props: Props) => {
  const [checked, setChecked] = React.useState(props.value || false);
  const onChange = (value: boolean) => {
    setChecked(value);
    props.onChange(value);
  };

  return (
    <View style={{ paddingTop: 20, paddingBottom: 16 }}>
      <TouchableDefaultOpacity
        style={[IOStyles.row, styles.borderBottom]}
        accessibilityRole={"radio"}
        accessibilityState={{ checked }}
        onPress={() => {
          onChange(!checked);
          setChecked(!checked);
        }}
      >
        <View style={IOStyles.flex}>
          <H4 testID="RadioButtonTitleTestID">{props.title}</H4>
          <Text
            testID="RadioButtonDetailTestID"
            style={{
              color: IOColors.blue,
              textDecorationColor: IOColors.blue,
              textDecorationLine: "underline",
              paddingTop: 16
            }}
            onPress={() => {
              props.onPressDetail();
            }}
          >
            {I18n.t("features.fci.signatureFields.showOnDocument")}
          </Text>
        </View>
        <IconFont
          testID="RadioButtonCheckboxTestID"
          name={checked ? "io-checkbox-on" : "io-checkbox-off"}
          color={checked ? IOColors.blue : IOColors.bluegreyDark}
          size={22}
        />
      </TouchableDefaultOpacity>
    </View>
  );
};

export default SignatureFieldItem;
