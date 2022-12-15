import * as React from "react";
import * as O from "fp-ts/lib/Option";
import { H4 } from "../../../components/core/typography/H4";
import { Link } from "../../../components/core/typography/Link";
import { WithTestID } from "../../../types/WithTestID";

type Props = WithTestID<{
  text: string;
  replacementUrl: string;
  onPress: (holder: string) => void;
}>;

// a regex to match markdown links
const matchMarkdownLink = /!?\[([^\]]*)\]\(([^\\)]+)\)/g;

// a function to get all the matched links
const getMatchedLinks = (text: string) => text.match(matchMarkdownLink) ?? [];

/**
 * This component renders a text with markdown links
 */
const LinkedText = (props: Props) => {
  const parts = getMatchedLinks(props.text);
  // generate unique string with the separator
  const partsToString = parts.join("|");
  // escape special characters
  const stringReg = partsToString.replace(/[[\\\]()]/g, "\\$&");
  // replace the markdown link with a placeholder
  // and use the separator to split the text
  const replaceLinksWithPlaceholder = new RegExp(stringReg, "g");
  const textWithSeparator = props.text.replace(
    replaceLinksWithPlaceholder,
    "$@"
  );

  /**
   * This function generates an array of Link components
   * used to render the list of clauses
   */
  const generateArrayOfLinkedText = (
    text: string,
    onPress: (holder: string) => void
  ) => {
    const parts = getMatchedLinks(text);

    // a function to render the link
    const getTextWithLinkComponent = (matched: string, index: number) => {
      const splitted = matched.split(matchMarkdownLink);
      const textToBeLinked = splitted[1];
      const url = splitted[2];
      // TODO: add support for other TAG links https://pagopa.atlassian.net/browse/SFEQS-1230
      return (
        <Link
          key={index}
          onPress={() =>
            onPress(url !== "(@DOCUMENT_URL)" ? props.replacementUrl : url)
          }
        >
          {textToBeLinked}
        </Link>
      );
    };

    return parts.map(
      (part, index) => part && getTextWithLinkComponent(part, index)
    );
  };

  const arrayOfLinkedText = generateArrayOfLinkedText(
    props.text,
    props.onPress
  );

  return (
    <H4>
      {textWithSeparator.split("$@").map((text, index) =>
        O.isSome(O.fromNullable(arrayOfLinkedText[index])) ? (
          <>
            <H4 weight={"Regular"} color={"bluegreyDark"}>
              {text}
            </H4>
            {arrayOfLinkedText[index]}
          </>
        ) : (
          <H4 weight={"Regular"} color={"bluegreyDark"}>
            {text}
          </H4>
        )
      )}
    </H4>
  );
};

export default LinkedText;
