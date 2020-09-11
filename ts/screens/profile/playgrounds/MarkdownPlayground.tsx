import React from "react";
import { SafeAreaView, StyleSheet, TextInput } from "react-native";
import { connect } from "react-redux";
import { View, Content } from "native-base";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import IconFont from "../../../components/ui/IconFont";
import { navigateBack } from "../../../store/actions/navigation";
import { Label } from "../../../components/core/typography/Label";
import { Dispatch, ReduxProps } from "../../../store/actions/types";
import Markdown from "../../../components/ui/Markdown";
import { CreatedMessageWithContent } from "../../../../definitions/backend/CreatedMessageWithContent";
import {
  cleanMarkdownFromCTAs,
  getCTA,
  handleCtaAction
} from "../../../utils/messages";
import { MessageBodyMarkdown } from "../../../../definitions/backend/MessageBodyMarkdown";
import { MessageNestedCtaButton } from "../../../components/messages/MessageNestedCtaButton";
import { CTA } from "../../../types/MessageCTA";
import { maybeNotNullyString } from "../../../utils/strings";
import { IOColors } from "../../../components/core/variables/IOColors";
type Props = ReturnType<typeof mapDispatchToProps> & ReduxProps;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  textInput: { flex: 1, padding: 1, borderWidth: 1, height: 60 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  contentCenter: { justifyContent: "center" }
});

const MarkdownPlayground: React.FunctionComponent<Props> = (props: Props) => {
  const [markdownText, setMarkdownText] = React.useState("");
  const [inputText, setInputText] = React.useState("");

  const message: CreatedMessageWithContent = {
    content: {
      markdown: markdownText
    }
  } as CreatedMessageWithContent;
  const maybeCTA = getCTA(message);
  const ctaMessage = maybeCTA.isSome()
    ? `${maybeCTA.value.cta_1 ? "2" : "1"} cta found!`
    : "no CTA found";
  const isMarkdownSet = maybeNotNullyString(markdownText).isSome();
  return (
    <BaseScreenComponent goBack={true} headerTitle={"Markdown playground"}>
      <SafeAreaView style={styles.flex}>
        <Content contentContainerStyle={styles.flex}>
          <View style={styles.row}>
            <TextInput
              multiline={true}
              placeholder={"paste here your markdown and press the button"}
              style={styles.textInput}
              onChangeText={setInputText}
              value={inputText}
            />
            <View hspacer={true} />
            <View>
              <ButtonDefaultOpacity
                style={styles.contentCenter}
                onPress={() => setMarkdownText(inputText)}
              >
                <IconFont
                  name={"io-right"}
                  style={{
                    color: IOColors.white
                  }}
                />
              </ButtonDefaultOpacity>
            </View>
          </View>
          <View style={{ marginTop: 10 }}>
            <Label
              weight={"Regular"}
              color={"blue"}
              onPress={() => setInputText("")}
            >
              {"clear"}
            </Label>
          </View>
          <View spacer={true} />
          {isMarkdownSet && <Label color={"bluegrey"}>{ctaMessage}</Label>}

          {maybeCTA.isSome() && (
            <View style={styles.row}>
              <MessageNestedCtaButton
                cta={maybeCTA.value.cta_1}
                xsmall={true}
                onCTAPress={props.handleCTAPress}
              />
            </View>
          )}
          {maybeCTA.isSome() && maybeCTA.value.cta_2 && (
            <>
              <View spacer={true} />
              <View style={styles.row}>
                <MessageNestedCtaButton
                  cta={maybeCTA.value.cta_2}
                  xsmall={true}
                  onCTAPress={props.handleCTAPress}
                />
              </View>
            </>
          )}
          {isMarkdownSet && (
            <>
              <View spacer={true} />
              <Markdown extraBodyHeight={60}>
                {cleanMarkdownFromCTAs(markdownText as MessageBodyMarkdown)}
              </Markdown>
            </>
          )}
        </Content>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(navigateBack()),
  handleCTAPress: (cta: CTA) => handleCtaAction(cta, dispatch)
});

export default connect(undefined, mapDispatchToProps)(MarkdownPlayground);
