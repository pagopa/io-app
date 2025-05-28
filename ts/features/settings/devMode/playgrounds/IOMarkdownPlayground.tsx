import {
  ContentWrapper,
  HSpacer,
  IconButton,
  IOColors,
  IOVisualCostants,
  ListItemSwitch,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useHeaderHeight } from "@react-navigation/elements";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import IOMarkdown from "../../../../components/IOMarkdown";
import { generateMessagesAndServicesRules } from "../../../common/components/IOMarkdown/customRules";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import IOMarkdownSuggestions from "./IOMarkdownSuggestions";

const ALL = `# Lorem Ipsum

## Introduction

Lorem ipsum dolor sit amet, *consectetur adipiscing elit*. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. 

### History

Lorem ipsum dolor sit amet, **consectetur adipiscing elit**. [Learn more about the history of Lorem Ipsum](https://en.wikipedia.org/wiki/Lorem_ipsum).

## Examples of Use

1. **Graphic Design**
    - Lorem ipsum dolor sit amet
    - Consectetur adipiscing elit
2. **Typography**
    - Vivamus lacinia odio vitae vestibulum
    - Cras venenatis euismod malesuada
3. **Web Development**
    - *Frontend*: HTML, CSS, JavaScript
    - *Backend*: Python, Ruby, Node.js

### Graphic Design

Lorem ipsum dolor sit amet, **consectetur adipiscing elit**. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.

### Typography

- Lorem ipsum dolor sit amet, consectetur adipiscing elit.
- Vivamus lacinia odio vitae vestibulum vestibulum.
- Cras venenatis euismod malesuada.

### Web Development

1. *Frontend*
    - HTML
    - CSS
    - JavaScript
2. *Backend*
    - Python
    - Ruby
    - Node.js

## Conclusion

---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.`;

const HEADINGS = `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`;

const BANNER = `>[!settings]
># Settings
>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;

const LIST = `## Unordered list
- Lorem ipsum dolor sit amet, consectetur adipiscing elit.
- Vivamus lacinia odio vitae vestibulum vestibulum.
- Cras venenatis euismod malesuada.

## Ordered list
1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
2. Vivamus lacinia odio vitae vestibulum vestibulum.
3. Cras venenatis euismod malesuada.

## Nested list
1. **Graphic Design**
    - Lorem ipsum dolor sit amet
    - Consectetur adipiscing elit
2. **Typography**
    - Vivamus lacinia odio vitae vestibulum
    - Cras venenatis euismod malesuada
3. **Web Development**
    - *Frontend*: HTML, CSS, JavaScript
    - *Backend*: Python, Ruby, Node.js`;

const PARAGRAPH = `Lorem ipsum dolor sit amet, **consectetur adipiscing elit**. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
Praesent commodo cursus magna, _vel scelerisque nisl consectetur et_. Donec sed odio dui. Nulla vitae elit libero, a pharetra augue.
Curabitur blandit tempus porttitor. **_Nullam quis risus eget urna mollis ornare vel eu leo_**. Sed posuere consectetur est at lobortis.
Vestibulum id ligula porta felis euismod semper. _Cras justo odio_, dapibus ac facilisis in, egestas eget quam. 
Maecenas faucibus mollis interdum. **Donec ullamcorper nulla non metus auctor fringilla**.`;
const LINK = "[This is a link](type_here_your_URL)";

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: IOColors["grey-200"],
    backgroundColor: IOColors.white,
    maxHeight: 128
  }
});

export const IOMarkdownPlayground = () => {
  const [content, setContent] = useState("");
  const [messageSpecificStyle, setMessageSpecificStyle] = useState(true);
  const { bottom } = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { present, bottomSheet } = useIOBottomSheetModal({
    title: "Components",
    component: (
      <>
        <ListItemSwitch
          label={"Enable specific style for Messages"}
          onSwitchValueChange={setMessageSpecificStyle}
          value={messageSpecificStyle}
        />
        <IOMarkdownSuggestions
          setContent={setContent}
          suggestions={[
            [
              { label: "All", content: ALL },
              { label: "Headings", content: HEADINGS }
            ],
            [
              { label: "Paragraph", content: PARAGRAPH },
              { label: "List", content: LIST }
            ],
            [
              { label: "Banner", content: BANNER },
              { label: "Link", content: LINK }
            ]
          ]}
        />
      </>
    )
  });

  useHeaderSecondLevel({
    title: "IOMarkdown Playground"
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: IOVisualCostants.appMarginDefault,
          flexGrow: 1
        }}
      >
        <IOMarkdown
          content={content}
          rules={
            messageSpecificStyle
              ? generateMessagesAndServicesRules(() => "")
              : undefined
          }
        />
      </ScrollView>
      <VSpacer />
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: "padding",
          android: undefined
        })}
        keyboardVerticalOffset={headerHeight - bottom}
      >
        <LinearGradient
          style={{
            height: 2
          }}
          colors={["transparent", "rgba(0,0,0,0.1)"]}
        />
        <View
          style={{
            paddingTop: 8,
            paddingBottom: bottom
          }}
        >
          <ContentWrapper>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingBottom: 8
              }}
            >
              <TextInput
                style={styles.textInput}
                placeholderTextColor={IOColors["grey-450"]}
                accessibilityLabel="Text input field"
                placeholder="Insert here your markdown"
                value={content}
                onChangeText={setContent}
                multiline
              />
              <HSpacer size={16} />
              <IconButton
                icon="magicWand"
                color="neutral"
                accessibilityLabel=""
                onPress={() => {
                  Keyboard.dismiss();
                  present();
                }}
              />
            </View>
          </ContentWrapper>
        </View>
      </KeyboardAvoidingView>
      {bottomSheet}
    </View>
  );
};
