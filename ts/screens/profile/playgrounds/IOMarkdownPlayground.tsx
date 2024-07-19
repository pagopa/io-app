import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  ContentWrapper,
  H2,
  IOStyles,
  TextInput
} from "@pagopa/io-app-design-system";
import { useHeaderSecondLevel } from "../../../hooks/useHeaderSecondLevel";
import IOMarkdown from "../../../components/IOMarkdown";
import { EmptyState } from "../../../features/services/common/components/EmptyState";

export const IOMarkdownPlayground = () => {
  const [content, setContent] = useState("");
  useHeaderSecondLevel({
    title: "IOMarkdown Playground"
  });

  return (
    <View style={IOStyles.flex}>
      <ContentWrapper>
        <TextInput
          accessibilityLabel="Text input field"
          placeholder="Insert here your markdown"
          value={content}
          onChangeText={setContent}
        />
        <H2>Preview</H2>
        <ScrollView>
          {!content ? (
            <EmptyState pictogram="empty" title="Type something" />
          ) : (
            <IOMarkdown content={content} />
          )}
        </ScrollView>
      </ContentWrapper>
    </View>
  );
};
