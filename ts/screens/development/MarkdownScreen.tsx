import { Container, Content, Text as NBButtonText } from "native-base";
import * as React from "react";
import { View, TextInput } from "react-native";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { IOColors } from "../../components/core/variables/IOColors";

import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";

const MARKDOWN_REFERENCE = I18n.t("global.markdown.reference");

const MARKDOWN_HEADING = `
# I am a Header 1

## I am a Header 2

### I am a Header 3

#### I am a Header 4

##### I am a Header 5

###### I am a Header 6
`;

const MARKDOWN_PARAGRAPH = `
A simple paragraph.

Text can be emphasized with *asterisk* or _underscore_.

If you need bold use **double asterisk**.
`;

const MARKDOWN_LIST = `
Unordered list:

* React
* Vue
* Angular

Ordered list:

1. React
2. Vue
3. Angular
`;

type Props = Record<string, unknown>;

type State = {
  markdown: string;
};

const INITIAL_STATE: State = {
  markdown: ""
};

class MarkdownScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  private setMarkdown(markdown: string) {
    this.setState({
      markdown
    });
  }

  public render() {
    return (
      <Container>
        <Content>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <ButtonDefaultOpacity
              small={true}
              onPress={() => this.setMarkdown(MARKDOWN_HEADING)}
            >
              <NBButtonText>Heading</NBButtonText>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              small={true}
              onPress={() => this.setMarkdown(MARKDOWN_PARAGRAPH)}
            >
              <NBButtonText>Paragraph</NBButtonText>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              small={true}
              onPress={() => this.setMarkdown(MARKDOWN_LIST)}
            >
              <NBButtonText>List</NBButtonText>
            </ButtonDefaultOpacity>
            <ButtonDefaultOpacity
              small={true}
              onPress={() => this.setMarkdown(MARKDOWN_REFERENCE)}
            >
              <NBButtonText>Reference</NBButtonText>
            </ButtonDefaultOpacity>
          </View>
          <VSpacer size={16} />
          <TextInput
            style={{
              borderColor: IOColors.grey,
              borderWidth: 1,
              width: "100%"
            }}
            onChangeText={text => this.setState({ markdown: text })}
            value={this.state.markdown}
            multiline={true}
            numberOfLines={10}
          />
          <VSpacer size={16} />
          <Markdown>{this.state.markdown}</Markdown>
        </Content>
      </Container>
    );
  }
}

export default MarkdownScreen;
