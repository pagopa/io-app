import { Button, Container, Text, View } from "native-base";
import * as React from "react";
import { TextInput } from "react-native";

import ScreenContent from "../../components/screens/ScreenContent";
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

type Props = {};

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
        <ScreenContent>
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <Button
              small={true}
              onPress={() => this.setMarkdown(MARKDOWN_HEADING)}
            >
              <Text>Heading</Text>
            </Button>
            <Button
              small={true}
              onPress={() => this.setMarkdown(MARKDOWN_PARAGRAPH)}
            >
              <Text>Paragraph</Text>
            </Button>
            <Button
              small={true}
              onPress={() => this.setMarkdown(MARKDOWN_LIST)}
            >
              <Text>List</Text>
            </Button>
            <Button
              small={true}
              onPress={() => this.setMarkdown(MARKDOWN_REFERENCE)}
            >
              <Text>Reference</Text>
            </Button>
          </View>
          <View spacer={true} />
          <TextInput
            style={{ borderColor: "gray", borderWidth: 1, width: "100%" }}
            onChangeText={text => this.setState({ markdown: text })}
            value={this.state.markdown}
            multiline={true}
            numberOfLines={10}
          />
          <View spacer={true} />
          <Markdown>{this.state.markdown}</Markdown>
        </ScreenContent>
      </Container>
    );
  }
}

export default MarkdownScreen;
