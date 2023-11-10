import React from "react";
import {
  Body,
  H2,
  H6,
  LabelLink,
  useIOToast
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as R from "fp-ts/lib/ReadonlyArray";
import * as B from "fp-ts/lib/boolean";
import { openWebUrl } from "../../../utils/url";
import I18n from "../../../i18n";

interface MarkdownParserProps {
  content: string;
}

const RenderRegularText = (text: string, index: number) => (
  <Body key={`text-${index}`}>{text}</Body>
);

const RenderBoldText = (text: string, index: number) => (
  <Body key={`bold-${index}`} weight="Bold">
    {text}
  </Body>
);

const RenderHeaderLevel2 = (text: string, index: number) => (
  <H2 key={`h2-${index}`}>{text}</H2>
);

const RenderHeaderLevel6 = (text: string, index: number) => (
  <H6 key={`h6-${index}`}>{text}</H6>
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
 * NOTE: only header level 2 and 6 is supported to extend to other
 * headers create a new rgex group (eg. |^##\s(.+)).
 * @param markdownText - contains the text to be parsed.
 */
const ItwTextInfo: React.FC<MarkdownParserProps> = ({ content }) => {
  // eslint-disable-next-line sonarjs/cognitive-complexity
  const renderElements = () => {
    // eslint-disable-next-line functional/no-let
    let elements: ReadonlyArray<React.ReactElement> = [];

    // A regex to match bold text, links and headers
    // Note: the order of the groups is important
    const regex = /\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\)|^##\s(.+)|^######\s(.+)/gm;

    // eslint-disable-next-line functional/no-let
    let match: RegExpExecArray | null;

    // eslint-disable-next-line functional/no-let
    let lastIndex = 0;

    while ((match = regex.exec(content)) !== null) {
      // Note: headers not already added to the elements array
      const [boldText, linkText, url, headerLevel2, headerLevel6] =
        match.slice(1);

      elements = pipe(
        // Add any regular text before the match
        elements,
        R.append(
          RenderRegularText(content.slice(lastIndex, match.index), lastIndex)
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
          ),
        // Add H6 if present
        elements =>
          pipe(
            headerLevel2 !== undefined,
            B.fold(
              () => elements,
              () =>
                pipe(
                  elements,
                  R.append(
                    RenderHeaderLevel2(
                      headerLevel2,
                      match !== null ? match.index : 0
                    )
                  )
                )
            )
          ),
        // Add H6 if present
        elements =>
          pipe(
            headerLevel6 !== undefined,
            B.fold(
              () => elements,
              () =>
                pipe(
                  elements,
                  R.append(
                    RenderHeaderLevel6(
                      headerLevel6,
                      match !== null ? match.index : 0
                    )
                  )
                )
            )
          )
      );

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining regular text
    if (lastIndex < content.length) {
      elements = pipe(
        elements,
        R.append(RenderRegularText(content.slice(lastIndex), lastIndex))
      );
    }

    return elements;
  };

  return <Body>{renderElements()}</Body>;
};

export default ItwTextInfo;
