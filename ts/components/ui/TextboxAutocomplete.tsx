import * as React from "react";
import { LabelledItem } from "../LabelledItem";
import { useContext } from "react";
import SelectCalendarModal from "../SelectCalendarModal";
import { LightModalContext } from "./LightModal";
import { H4 } from "../core/typography/H4";
import { IOColors } from "../core/variables/IOColors";
import { Container, View } from "native-base";
import { H5 } from "../core/typography/H5";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import { formatDateAsLocal } from "../../utils/dates";
import I18n from "../../i18n";
import IconFont from "./IconFont";
import variables from "../../theme/variables";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { ScrollView, StyleSheet } from "react-native";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import BaseScreenComponent from "../screens/BaseScreenComponent";
import { IOStyles } from "../core/variables/IOStyles";
import { SafeAreaView } from "react-native";
import { BaseHeader } from "../screens/BaseHeader";

type Props = {
  label?: string;
  minimumDate?: Date;
  blocked?: boolean;
};
const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderColor: IOColors.bluegreyDark,
    paddingBottom: 10
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

type ModalProps = {
  onClose: () => void;
};

const TextboxAutocompleteModal: React.FunctionComponent<ModalProps> = (
  props: ModalProps
) => {
  return (
    <Container>
      <BaseHeader
        accessibilityEvents={{
          avoidNavigationEventsUsage: true
        }}
        headerTitle={"Inserisci un comune"}
        customRightIcon={{
          iconName: "io-close",
          onPress: props.onClose,
          accessibilityLabel: I18n.t(
            "global.accessibility.contextualHelp.close"
          )
        }}
      />
      <SafeAreaView
        style={IOStyles.flex}
        testID={"SickSelectDestinationScreen"}
      >
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <LabelledItem
            label={"Comune"}
            inputProps={{
              value: "",
              onChangeText: () => true,
              placeholder: "Inserisci un comune"
            }}
          />
        </ScrollView>
      </SafeAreaView>
    </Container>
  );
};

const TextboxAutocomplete: React.FunctionComponent<Props> = (props: Props) => {
  const { showModal, hideModal } = useContext(LightModalContext);
  return (
    <View style={styles.container}>
      {props.label && <H5 color={"bluegreyDark"}>{props.label}</H5>}
      <View spacer={true} />
      <TouchableDefaultOpacity
        style={styles.inputContainer}
        onPress={() =>
          showModal(<TextboxAutocompleteModal onClose={hideModal} />)
        }
      >
        <H4 weight={"Regular"} color={"bluegreyLight"}>
          {"Inserisci un comune"}
        </H4>
      </TouchableDefaultOpacity>
    </View>
    // <LabelledItem
    //   label={props.label}
    //   inputProps={{
    //     onFocus: _ =>
    //       showModal(
    //         <SelectCalendarModal
    //           onCancel={hideModal}
    //           onCalendarSelected={() => true}
    //         />
    //       ),
    //     value: "",
    //     onChangeText: () => true,
    //     placeholder: "Inserisci un comune"
    //   }}
    // />
  );
};

export default TextboxAutocomplete;
