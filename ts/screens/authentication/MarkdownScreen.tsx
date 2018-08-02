import { Button, Container, Content, Text, View } from "native-base";
import * as React from "react";
import { TextInput } from "react-native";

import Markdown from "../../components/ui/Markdown";

const MARKDOWN = `
# I am a Header1

## I am a Header 2

### I am a Header 3

A simple paragraph with a [link](http://www.google.it) rendered as a primary button and [another big link](http://www.google.it) also rendered successfully.

Text can be emphasized with *asterisk* or _underscore_.

If you need bold use **double asterisk**.

Here is a list:

* React
* Vue
* Angular
`;

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

export type Props = {};

export type State = {
  markdown: string;
};

export const INITIAL_STATE: State = {
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
            <Button small={true} onPress={() => this.setMarkdown(MARKDOWN)}>
              <Text>Mixed</Text>
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
        </Content>
      </Container>
    );
  }
}

export default MarkdownScreen;
