import { HSpacer, IOButton, VSpacer } from "@pagopa/io-app-design-system";
import { Fragment } from "react";
import { View } from "react-native";

export type Suggestion = {
  content: string;
  label: string;
};

type Props = {
  setContent: (content: string) => void;
  suggestions: Array<[Suggestion, Suggestion]>;
};

const IOMarkdownSuggestions = ({ suggestions, setContent }: Props) => (
  <View style={{ flex: 1 }}>
    {suggestions.map(([first, second], idx) => (
      <Fragment key={`${first.label}_${second.label}_${idx}`}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <IOButton
              fullWidth
              label={first.label}
              onPress={() => {
                setContent(first.content);
              }}
              variant="solid"
            />
          </View>
          <HSpacer />
          <View style={{ flex: 1 }}>
            <IOButton
              fullWidth
              label={second.label}
              onPress={() => {
                setContent(second.content);
              }}
              variant="solid"
            />
          </View>
        </View>
        <VSpacer />
      </Fragment>
    ))}
    <View style={{ flex: 1, flexDirection: "row" }}>
      <View style={{ flex: 1 }}>
        <IOButton
          fullWidth
          label="Clear"
          onPress={() => {
            setContent("");
          }}
          variant="outline"
        />
      </View>
    </View>
  </View>
);
export default IOMarkdownSuggestions;
