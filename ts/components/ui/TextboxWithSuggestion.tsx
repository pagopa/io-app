import * as React from "react";
import { ReactNode, useContext, useState } from "react";
import { Body, Container, Content, Left, Right, View } from "native-base";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native";
import { H4 } from "../core/typography/H4";
import { IOColors } from "../core/variables/IOColors";
import { H5 } from "../core/typography/H5";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import { IOStyles } from "../core/variables/IOStyles";
import { LabelledItem } from "../LabelledItem";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import AppHeader from "./AppHeader";
import { LightModalContext } from "./LightModal";
import IconFont from "./IconFont";
import I18n from "../../i18n";

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

/**
 * Props explanation:
 * - onChangeText -> method that notify when the user changes the searching text in the modal.
 * - title -> the title of the modal screen.
 * - label -> displayed on top the search text-box both.
 * - placeholder -> placeholder of the search text-box.
 * - showModalInputTextbox -> boolean that control the input textbox in the modal
 * - wrappedFlatlist -> the Flatlist component that show the suggestions that the user can choose from
 */
type CommonProps = {
  onChangeText?: (value: string) => void;
  title: string;
  label: string;
  placeholder: string;
  showModalInputTextbox: boolean;
  wrappedFlatlist: ReactNode;
};

/**
 * Props explanation:
 * - onSelectValue -> method that inform about selected value from the suggested ones. The returned string will be used to set the search text-box.
 * - isFailed -> if true show a label that allow to execute the function onRetry
 * - onRetry -> method executed when the user press the "Retry" label
 * - disabled -> if true disable the onPress on the initial textBox and show the border light gray
 * - isLoading -> if true show a loading indicator near the label
 */
type Props = {
  selectedValue?: string;
  isFailed?: boolean;
  onRetry?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
} & CommonProps;

type ModalProps = {
  onClose: () => void;
} & CommonProps;

const TextboxWithSuggestionModal = (props: ModalProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  return (
    <Container>
      <AppHeader>
        <Left>
          <ButtonDefaultOpacity onPress={props.onClose} transparent={true}>
            <IconFont name="io-close" />
          </ButtonDefaultOpacity>
        </Left>
        <Body style={{ alignItems: "center", marginRight: 32 }}>
          <H5 weight={"SemiBold"} color={"bluegrey"}>
            {props.title}
          </H5>
        </Body>
        <Right />
      </AppHeader>
      <SafeAreaView style={IOStyles.flex}>
        <Content style={IOStyles.flex}>
          {props.showModalInputTextbox && (
            <>
              <LabelledItem
                iconPosition={"right"}
                label={props.label}
                inputProps={{
                  value: inputValue,
                  onChangeText: v => {
                    setInputValue(v);
                    props.onChangeText?.(v);
                  },
                  placeholder: props.placeholder
                }}
              />
              <View spacer large />
            </>
          )}
          {props.wrappedFlatlist}
        </Content>
      </SafeAreaView>
    </Container>
  );
};

/**
 * This component is a wrapper around a modal that contains:
 * - a LabelledItem component
 * - a Flatlist that shows a list of results from which the user has to choose
 * Two callbacks are available:
 * - onChangeText -> executed when the user inserts or cancels some character from the LabelledItem
 * - onSelectValue -> executed when the user selects an item before the modal is hide
 * @param props
 * @constructor
 */
const TextboxWithSuggestion = (props: Props) => {
  const { showModal, hideModal } = useContext(LightModalContext);

  const borderBottomColor = props.disabled
    ? IOColors.bluegreyLight
    : IOColors.bluegreyDark;
  return (
    <>
      <View style={[styles.container, { borderBottomColor }]}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <H5 color={"bluegreyDark"}>{props.label}</H5>
          <View hspacer={true} />
          {props.isLoading && (
            <ActivityIndicator
              color={"black"}
              accessible={false}
              importantForAccessibility={"no-hide-descendants"}
              accessibilityElementsHidden={true}
            />
          )}
          {props.isFailed && (
            <H5
              color={"red"}
              style={{ textDecorationLine: "underline" }}
              onPress={props.onRetry}
            >
              {I18n.t("global.genericRetry")}
            </H5>
          )}
        </View>
        <View spacer={true} />
        <TouchableDefaultOpacity
          style={styles.inputContainer}
          disabled={props.disabled}
          onPress={() =>
            showModal(
              <TextboxWithSuggestionModal
                title={props.title}
                label={props.label}
                placeholder={props.placeholder}
                onClose={hideModal}
                onChangeText={props.onChangeText}
                showModalInputTextbox={props.showModalInputTextbox}
                wrappedFlatlist={props.wrappedFlatlist}
              />
            )
          }
        >
          {props.selectedValue ? (
            <H4 weight={"Regular"} color={"bluegrey"}>
              {props.selectedValue}
            </H4>
          ) : (
            <H4 weight={"Regular"} color={"bluegreyLight"}>
              {props.placeholder}
            </H4>
          )}
        </TouchableDefaultOpacity>
      </View>
    </>
  );
};

export default TextboxWithSuggestion;
