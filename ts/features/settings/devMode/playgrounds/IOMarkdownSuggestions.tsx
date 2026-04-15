import { View } from "react-native";
import { Fragment } from "react";
import { HSpacer, IOButton, VSpacer } from "@pagopa/io-app-design-system";

export type Suggestion = {
  label: string;
  content: string;
};

type Props = {
  suggestions: Array<[Suggestion, Suggestion]>;
  setContent: (content: string) => void;
};

const IOMarkdownSuggestions = ({ suggestions, setContent }: Props) => (
  <View style={{ flex: 1 }}>
    {suggestions.map(([first, second], idx) => (
      <Fragment key={`${first.label}_${second.label}_${idx}`}>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flex: 1 }}>
            <IOButton
              fullWidth
              variant="solid"
              label={first.label}
              onPress={() => {
                setContent(first.content);
              }}
            />
          </View>
          <HSpacer />
          <View style={{ flex: 1 }}>
            <IOButton
              fullWidth
              variant="solid"
              label={second.label}
              onPress={() => {
                setContent(second.content);
              }}
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
          variant="outline"
          label="Clear"
          onPress={() => {
            setContent("");
          }}
        />
      </View>
    </View>
  </View>
);
export default IOMarkdownSuggestions;
