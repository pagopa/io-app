import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import { QtspClause } from "../../../../definitions/fci/QtspClause";
import { fciQtspFilledDocumentUrlSelector } from "../store/reducers/fciQtspFilledDocument";
import { Icon } from "../../../components/core/icons/Icon";
import LinkedText from "./LinkedText";

type Props = {
  clause: QtspClause;
  checked?: boolean;
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
  const [checked, setChecked] = React.useState(props.checked || false);
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
            replacementUrl={qtspFilledDocumentUrl}
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
          <Icon
            testID="QtspClauseListItemCheckboxTestID"
            name={checked ? "legIconCheckOn" : "legIconCheckOff"}
            color={checked ? "blue" : "bluegreyDark"}
            size={22}
          />
        </View>
      </TouchableDefaultOpacity>
    </View>
  );
};

export default QtspClauseListItem;
