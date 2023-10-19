import React from "react";
import { Text } from "react-native";
import { Body, LabelLink, useIOToast } from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as R from "fp-ts/lib/ReadonlyArray";
import * as B from "fp-ts/lib/boolean";
import { openWebUrl } from "../../../utils/url";
import I18n from "../../../i18n";

interface MarkdownParserProps {
  markdownText: string;
}

const RenderRegularText = (text: string, index: number) => (
  <Text key={`text-${index}`}>{text}</Text>
);

const RenderBoldText = (text: string, index: number) => (
  <Text key={`bold-${index}`} style={{ fontWeight: "bold" }}>
    {text}
  </Text>
);

const RenderLink = (text: string, url: string, index: number) => {
  const toast = useIOToast();
  return (
    <LabelLink
      key={`link-${index}`}
      onPress={() =>
        openWebUrl(url, () => toast.error(I18n.t("global.jserror.title")))
      }
      numberOfLines={1}
    >
      {text}
    </LabelLink>
  );
};

/**
 * This component renders a markdown text.
 * It parses the text and renders bold text, links and headers.
 * NOTE: the headers are not rendered yet.
 * @param markdownText - contains the text to be parsed.
 */
const ItwTextInfo: React.FC<MarkdownParserProps> = ({ markdownText }) => {
  const renderElements = () => {
    // eslint-disable-next-line functional/no-let
    let elements: ReadonlyArray<React.ReactElement> = [];

    // A regex to match bold text, links and headers
    // Note: the order of the groups is important
    const regex =
      /\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\)|^#\s(.+)|^##\s(.+)|^###\s(.+)/gm;

    // eslint-disable-next-line functional/no-let
    let match: RegExpExecArray | null;

    // eslint-disable-next-line functional/no-let
    let lastIndex = 0;

    while ((match = regex.exec(markdownText)) !== null) {
      // Note: headers not already added to the elements array
      const [boldText, linkText, url] = match.slice(1);

      elements = pipe(
        // Add any regular text before the match
        elements,
        R.append(
          RenderRegularText(
            markdownText.slice(lastIndex, match.index),
            lastIndex
          )
        ),
        // Add bold text if present
        elements =>
          pipe(
            boldText !== undefined,
            B.fold(
              () => elements,
              () =>
                pipe(
                  elements,
                  R.append(
                    RenderBoldText(boldText, match !== null ? match.index : 0)
                  )
                )
            )
          ),
        // Add link if present
        elements =>
          pipe(
            linkText !== undefined && url !== undefined,
            B.fold(
              () => elements,
              () =>
                pipe(
                  elements,
                  R.append(
                    RenderLink(linkText, url, match !== null ? match.index : 0)
                  )
                )
            )
          )
      );

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining regular text
    if (lastIndex < markdownText.length) {
      elements = pipe(
        elements,
        R.append(RenderRegularText(markdownText.slice(lastIndex), lastIndex))
      );
    }

    return elements;
  };

  return <Body>{renderElements()}</Body>;
};

export default ItwTextInfo;
