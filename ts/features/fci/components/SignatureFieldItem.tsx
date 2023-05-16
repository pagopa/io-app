import * as React from "react";
import { View, StyleSheet } from "react-native";
import { H4 } from "../../../components/core/typography/H4";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { IOColors } from "../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import { Link } from "../../../components/core/typography/Link";
import I18n from "../../../i18n";
import { Icon } from "../../../components/core/icons/Icon";

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
        <H4 style={styles.titleMargin} testID="SignatureFieldItemTitleTestID">
          {props.title}
        </H4>
        <TouchableDefaultOpacity
          accessibilityRole={"checkbox"}
          accessibilityValue={{
            text: checked
              ? I18n.t("features.fci.signatureFields.accessibility.selected")
              : I18n.t("features.fci.signatureFields.accessibility.unselected")
          }}
          accessibilityState={{ selected: checked }}
          testID={"SignatureFieldItemButtonTestID"}
          onPress={() => {
            onChange(!checked);
          }}
          disabled={props.disabled}
          style={{ alignSelf: "center" }}
        >
          <Icon
            testID="SignatureFieldItemCheckboxTestID"
            name={checked ? "legCheckOn" : "legCheckOff"}
            color={
              checked && !props.disabled
                ? "blue"
                : props.disabled
                ? "grey"
                : "bluegreyDark"
            }
            size={24}
          />
        </TouchableDefaultOpacity>
      </View>
      <View style={[IOStyles.row, styles.details]}>
        <Link
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
        </Link>
      </View>
    </View>
  );
};

export default SignatureFieldItem;
