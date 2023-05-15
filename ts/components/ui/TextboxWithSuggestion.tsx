import * as React from "react";
import { ReactNode, useContext, useState } from "react";
import { Body, Container, Content, Left, Right } from "native-base";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { H4 } from "../core/typography/H4";
import { IOColors } from "../core/variables/IOColors";
import { H5 } from "../core/typography/H5";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import { IOStyles } from "../core/variables/IOStyles";
import { LabelledItem } from "../LabelledItem";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { HSpacer, VSpacer } from "../core/spacer/Spacer";
import { Icon } from "../core/icons";
import AppHeader from "./AppHeader";
import { LightModalContext } from "./LightModal";

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
 * - wrappedFlatlist -> the Flatlist component that show the suggestions that the user can choose from. Note that if the list needs to react
 *                      and change the showed data when the text change a connected component that wrap the Flatlist is needed.
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
 * - selectedValue -> value to show in the initial textbox.
 * - disabled -> if true disable the onPress on the initial textBox and show the border light gray
 */
type Props = {
  selectedValue?: string;
  disabled?: boolean;
  onClose?: () => void;
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
            <Icon name="legClose" />
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
              <VSpacer size={24} />
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
 * A callback is available:
 * - onChangeText -> executed when the user inserts or cancels some character from the LabelledItem
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
          <HSpacer size={16} />
        </View>
        <VSpacer size={16} />
        <TouchableDefaultOpacity
          style={styles.inputContainer}
          disabled={props.disabled}
          onPress={() =>
            showModal(
              <TextboxWithSuggestionModal
                title={props.title}
                label={props.label}
                placeholder={props.placeholder}
                onClose={() => {
                  hideModal();
                  props.onClose?.();
                }}
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
