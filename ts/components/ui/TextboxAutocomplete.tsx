import * as React from "react";
import { useContext, useState } from "react";
import {
  Body,
  Container,
  Content,
  Left,
  ListItem,
  Right,
  View
} from "native-base";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  StyleSheet
} from "react-native";
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
type CommonProps<T> = {
  data: ReadonlyArray<T>;
  keyExtractor: (item: T, index: number) => string;
  onChangeText: (value: string) => void;
  renderItem: (item: ListRenderItemInfo<T>) => React.ReactElement;
  title: string;
  label: string;
  placeholder: string;
  isLoading: boolean;
};
type Props<T> = {
  onSelectValue: (value: T) => string;
} & CommonProps<T>;

type ModalProps<T> = {
  onClose: () => void;
} & CommonProps<T>;

const FooterLoading = () => (
  <>
    <View spacer={true} />
    <ActivityIndicator
      color={"black"}
      accessible={false}
      importantForAccessibility={"no-hide-descendants"}
      accessibilityElementsHidden={true}
      testID={"activityIndicator"}
    />
  </>
);

const TextboxAutocompleteModal = <T extends any>(props: ModalProps<T>) => {
  const [inputValue, setInputValue] = useState<string>("");
  return (
    <Container>
      <AppHeader>
        <Left>
          <ButtonDefaultOpacity onPress={props.onClose} transparent={true}>
            <IconFont name="io-close" />
          </ButtonDefaultOpacity>
        </Left>
        <Body style={{ alignItems: "center" }}>
          <H5 weight={"SemiBold"} color={"bluegrey"}>
            {props.title}
          </H5>
        </Body>
        <Right />
      </AppHeader>
      <SafeAreaView style={IOStyles.flex}>
        <Content style={IOStyles.flex}>
          <LabelledItem
            iconPosition={"right"}
            label={props.label}
            inputProps={{
              value: inputValue,
              onChangeText: v => {
                setInputValue(v);
                props.onChangeText(v);
              },
              placeholder: props.placeholder
            }}
          />
          <View spacer large />

          <FlatList
            data={props.data}
            ListFooterComponent={props.isLoading && <FooterLoading />}
            renderItem={props.renderItem}
            keyExtractor={props.keyExtractor}
            keyboardShouldPersistTaps={"handled"}
          />
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
const TextboxAutocomplete = <T extends any>(props: Props<T>) => {
  const { showModal, hideModal } = useContext(LightModalContext);
  const [selectedValue, setSelectedValue] = useState<string | undefined>(
    undefined
  );

  return (
    <>
      <View style={styles.container}>
        <H5 color={"bluegreyDark"}>{props.label}</H5>
        <View spacer={true} />
        <TouchableDefaultOpacity
          style={styles.inputContainer}
          onPress={() =>
            showModal(
              <TextboxAutocompleteModal<T>
                data={props.data}
                keyExtractor={props.keyExtractor}
                renderItem={i => (
                  <ListItem
                    icon={false}
                    onPress={() => {
                      setSelectedValue(props.onSelectValue(i.item));
                      hideModal();
                    }}
                  >
                    {props.renderItem(i)}
                  </ListItem>
                )}
                title={props.title}
                label={props.label}
                placeholder={props.placeholder}
                onClose={hideModal}
                onChangeText={props.onChangeText}
                isLoading={props.isLoading}
              />
            )
          }
        >
          {selectedValue ? (
            <H4 weight={"Regular"} color={"bluegrey"}>
              {selectedValue}
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

export default TextboxAutocomplete;
