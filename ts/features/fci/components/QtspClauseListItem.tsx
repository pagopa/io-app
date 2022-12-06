import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import IconFont from "../../../components/ui/IconFont";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { IOColors } from "../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import { QtspClause } from "../../../../definitions/fci/QtspClause";
import { fciQtspFilledDocumentUrlSelector } from "../store/reducers/fciQtspFilledDocument";
import LinkedText from "./LinkedText";

type Props = {
  clause: QtspClause;
  value?: boolean;
  onChange: (_: boolean) => void;
  onLinkPress: (url: string) => void;
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 24,
    flexDirection: "row"
  }
});

const QtspClauseListItem = (props: Props) => {
  const [checked, setChecked] = React.useState(props.value || false);
  const qtspFilledDocumentUrl = useSelector(fciQtspFilledDocumentUrlSelector);
  const onChange = (value: boolean) => {
    setChecked(value);
    props.onChange(value);
  };

  const onPressLinkedText = (url: string) => {
    props.onLinkPress(url);
  };

  return (
    <View style={styles.container} testID="QtspClauseListItemContainerTestID">
      <View style={{ flex: 1 }} testID="QtspClauseLinkedTextTestID">
        {
          <LinkedText
            text={props.clause.text}
            url={qtspFilledDocumentUrl}
            onPress={onPressLinkedText}
          />
        }
      </View>
      <View style={IOStyles.horizontalContentPadding} />
      <TouchableDefaultOpacity
        accessibilityRole={"radio"}
        testID={"QtspClauseListItemButtonTestID"}
        onPress={() => {
          onChange(!checked);
          setChecked(!checked);
        }}
      >
        <View style={IOStyles.column}>
          <IconFont
            testID="QtspClauseListItemCheckboxTestID"
            name={checked ? "io-checkbox-on" : "io-checkbox-off"}
            color={checked ? IOColors.blue : IOColors.bluegreyDark}
            size={22}
          />
        </View>
      </TouchableDefaultOpacity>
    </View>
  );
};

export default QtspClauseListItem;
