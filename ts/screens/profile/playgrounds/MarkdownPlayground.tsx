import React, { useCallback } from "react";
import { SafeAreaView, StyleSheet, TextInput } from "react-native";
import { Content, View } from "native-base";
import { useLinkTo } from "@react-navigation/native";
import ButtonDefaultOpacity from "../../../components/ButtonDefaultOpacity";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import IconFont from "../../../components/ui/IconFont";
import { Label } from "../../../components/core/typography/Label";
import Markdown from "../../../components/ui/Markdown";
import { CreatedMessageWithContent } from "../../../../definitions/backend/CreatedMessageWithContent";
import {
  cleanMarkdownFromCTAs,
  getCTA,
  handleCtaAction
} from "../../../utils/messages";
import { MessageBodyMarkdown } from "../../../../definitions/backend/MessageBodyMarkdown";
import { CTA } from "../../../types/MessageCTA";
import { maybeNotNullyString } from "../../../utils/strings";
import { IOColors } from "../../../components/core/variables/IOColors";
import { ExtractedCtaButton } from "../../../components/cta/ExtractedCtaButton";

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

const MarkdownPlayground = () => {
  const [markdownText, setMarkdownText] = React.useState("");
  const [inputText, setInputText] = React.useState("");

  const linkTo = useLinkTo();
  const handleCtaPress = useCallback(
    (cta: CTA) => handleCtaAction(cta, linkTo),
    [linkTo]
  );

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
              <ExtractedCtaButton
                cta={maybeCTA.value.cta_1}
                xsmall={true}
                onCTAPress={handleCtaPress}
              />
            </View>
          )}
          {maybeCTA.isSome() && maybeCTA.value.cta_2 && (
            <>
              <View spacer={true} />
              <View style={styles.row}>
                <ExtractedCtaButton
                  cta={maybeCTA.value.cta_2}
                  xsmall={true}
                  onCTAPress={handleCtaPress}
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

export default MarkdownPlayground;
