import {
  ButtonOutline,
  ButtonSolid,
  HSpacer,
  IOColors,
  IOVisualCostants,
  IconButtonSolid,
  BodySmall,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useLinkTo } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { useState, useCallback } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import I18n from "../../../i18n";
import { MessageBodyMarkdown } from "../../../../definitions/backend/MessageBodyMarkdown";
import LegacyMarkdown from "../../../components/ui/Markdown/LegacyMarkdown";
import { CTA } from "../../../features/messages/types/MessageCTA";
import {
  cleanMarkdownFromCTAs,
  getMessageCTA,
  handleCtaAction
} from "../../../features/messages/utils/messages";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import { maybeNotNullyString } from "../../../utils/strings";

const styles = StyleSheet.create({
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
  },
  horizontalScroll: {
    flexShrink: 1,
    marginLeft: -IOVisualCostants.appMarginDefault,
    marginRight: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

const MARKDOWN_REFERENCE = I18n.t("global.markdown.reference");

const MARKDOWN_HEADING = `# I am a Header 1
# I am a Header 1 with a looong looong looooong title

## I am a Header 2
## I am a Header 2 with a looong looong looooong title

### I am a Header 3
### I am a Header 3 with a looong looong looooong title

#### I am a Header 4
#### I am a Header 4 with a looong looong looooong title

##### I am a Header 5
##### I am a Header 5 with a looong looong looooong loooong title

###### I am a Header 6
###### I am a Header 6 with a looong looong looooong loooooong title
`;

const MARKDOWN_PARAGRAPH = `A simple paragraph.

Text can be emphasized with *asterisk* or _underscore_.

If you need bold use **double asterisk**.
`;

const MARKDOWN_LIST = `Unordered list:

* React
* Vue
* Angular

Ordered list:

1. React
2. Vue
3. Angular
`;

const MarkdownPlayground = () => {
  const [markdownText, setMarkdownText] = useState("");
  const [inputText, setInputText] = useState("");

  const setMarkdown = (markdownString: string) => {
    setMarkdownText(markdownString);
    setInputText(markdownString);
  };

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
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault
        }}
      >
        <View style={styles.row}>
          <TextInput
            accessibilityLabel="Markdown content"
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
        <VSpacer />
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          <View style={{ flexDirection: "row" }}>
            <ButtonSolid
              label="Heading"
              accessibilityLabel="Heading"
              onPress={() => setMarkdown(MARKDOWN_HEADING)}
            />
            <HSpacer size={8} />
            <ButtonSolid
              label="Paragraph"
              accessibilityLabel="Paragraph"
              onPress={() => setMarkdown(MARKDOWN_PARAGRAPH)}
            />
            <HSpacer size={8} />
            <ButtonSolid
              label="List"
              accessibilityLabel="List"
              onPress={() => setMarkdown(MARKDOWN_LIST)}
            />
            <HSpacer size={8} />
            <ButtonSolid
              label="All"
              accessibilityLabel="All"
              onPress={() => setMarkdown(MARKDOWN_REFERENCE)}
            />
            <HSpacer size={48} />
          </View>
        </ScrollView>
        <View style={{ marginTop: 10 }}>
          <ButtonOutline
            onPress={() => setMarkdown("")}
            label="Clear"
            accessibilityLabel="Clear"
          />
        </View>
        <VSpacer size={16} />

        {isMarkdownSet && <BodySmall weight="Semibold">{ctaMessage}</BodySmall>}

        {O.isSome(maybeCTA) && (
          <View style={styles.row}>
            <ButtonOutline
              label={maybeCTA.value.cta_1.text}
              onPress={() => handleCtaPress(maybeCTA.value.cta_1)}
            />
          </View>
        )}
        {O.isSome(maybeCTA) && maybeCTA.value.cta_2 && (
          <>
            <VSpacer size={16} />
            <View style={styles.row}>
              <ButtonOutline
                label={maybeCTA.value.cta_2.text}
                onPress={() =>
                  maybeCTA.value.cta_2
                    ? handleCtaPress(maybeCTA.value.cta_2)
                    : undefined
                }
              />
            </View>
          </>
        )}
        {isMarkdownSet && (
          <>
            <VSpacer size={16} />
            <LegacyMarkdown extraBodyHeight={60}>
              {cleanMarkdownFromCTAs(markdownText as MessageBodyMarkdown)}
            </LegacyMarkdown>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default MarkdownPlayground;
