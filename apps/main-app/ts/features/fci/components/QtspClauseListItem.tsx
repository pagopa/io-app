import { CheckboxLabel } from "@io-app/design-system";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { QtspClause } from "../../../../definitions/fci/QtspClause";
import { useIOSelector } from "../../../store/hooks";
import { fciQtspFilledDocumentUrlSelector } from "../store/reducers/fciQtspFilledDocument";
import LinkedText from "./LinkedText";

type Props = {
  checked?: boolean;
  clause: QtspClause;
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
  const [checked, setChecked] = useState(props.checked || false);
  const qtspFilledDocumentUrl = useIOSelector(fciQtspFilledDocumentUrlSelector);
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
        <LinkedText
          onPress={onPressLinkedText}
          replacementUrl={qtspFilledDocumentUrl}
          text={props.clause.text}
        />
      </View>
      <CheckboxLabel
        checked={checked}
        label=""
        onValueChange={() => {
          onChange(!checked);
          setChecked(!checked);
        }}
      />
    </View>
  );
};

export default QtspClauseListItem;
