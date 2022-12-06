import * as React from "react";
import { H4 } from "../../../components/core/typography/H4";
import { Link } from "../../../components/core/typography/Link";
import { WithTestID } from "../../../types/WithTestID";

type Props = WithTestID<{
  text: string;
  url: string;
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
      // TODO: add support for other TAG links
      return (
        <Link
          key={index}
          onPress={() => onPress(url !== "(@DOCUMENT_URL)" ? props.url : url)}
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
      {textWithSeparator.split("$@").map((text, index) => {
        if (arrayOfLinkedText[index] !== undefined) {
          return (
            <>
              <H4 weight={"Regular"} color={"bluegreyDark"}>
                {text}
              </H4>
              {arrayOfLinkedText[index]}
            </>
          );
        } else {
          return (
            <H4 weight={"Regular"} color={"bluegreyDark"}>
              {text}
            </H4>
          );
        }
      })}
    </H4>
  );
};

export default LinkedText;
