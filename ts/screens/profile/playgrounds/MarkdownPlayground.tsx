import {
  ButtonLink,
  HSpacer,
  IOColors,
  IOStyles,
  IOVisualCostants,
  IconButtonSolid,
  LabelSmallAlt,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useLinkTo } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import React, { useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import { MessageBodyMarkdown } from "../../../../definitions/backend/MessageBodyMarkdown";
import { ExtractedCtaButton } from "../../../components/cta/ExtractedCtaButton";
import Markdown from "../../../components/ui/Markdown";
import { CTA } from "../../../features/messages/types/MessageCTA";
import {
  cleanMarkdownFromCTAs,
  getMessageCTA,
  handleCtaAction
} from "../../../features/messages/utils/messages";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { maybeNotNullyString } from "../../../utils/strings";

const styles = StyleSheet.create({
  flex: { flex: 1 },
  textInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: IOColors["grey-450"],
    height: 64
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

const MarkdownPlayground = () => {
  const [markdownText, setMarkdownText] = React.useState("");
  const [inputText, setInputText] = React.useState("");

  useHeaderSecondLevel({
    title: "Markdown playground"
  });

  const linkTo = useLinkTo();
  const handleCtaPress = useCallback(
    (cta: CTA) => handleCtaAction(cta, linkTo),
    [linkTo]
  );

  const maybeCTA = getMessageCTA(markdownText as MessageBodyMarkdown);
  const ctaMessage = O.isSome(maybeCTA)
    ? `${maybeCTA.value.cta_1 ? "2" : "1"} cta found!`
    : "No CTA found";
  const isMarkdownSet = O.isSome(maybeNotNullyString(markdownText));
  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView
        contentContainerStyle={[
          { paddingHorizontal: IOVisualCostants.appMarginDefault },
          IOStyles.flex
        ]}
      >
        <View style={styles.row}>
          <TextInput
            multiline={true}
            placeholder={"paste here your markdown and press the button"}
            style={styles.textInput}
            onChangeText={setInputText}
            value={inputText}
          />
          <HSpacer size={16} />
          <View>
            <IconButtonSolid
              icon="arrowRight"
              onPress={() => setMarkdownText(inputText)}
              accessibilityLabel="Invia"
            />
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          <ButtonLink onPress={() => setInputText("")} label="Clear" />
        </View>
        <VSpacer size={16} />
        {isMarkdownSet && <LabelSmallAlt>{ctaMessage}</LabelSmallAlt>}

        {O.isSome(maybeCTA) && (
          <View style={styles.row}>
            <ExtractedCtaButton
              cta={maybeCTA.value.cta_1}
              xsmall={true}
              onCTAPress={handleCtaPress}
            />
          </View>
        )}
        {O.isSome(maybeCTA) && maybeCTA.value.cta_2 && (
          <>
            <VSpacer size={16} />
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
            <VSpacer size={16} />
            <Markdown extraBodyHeight={60}>
              {cleanMarkdownFromCTAs(markdownText as MessageBodyMarkdown)}
            </Markdown>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MarkdownPlayground;
