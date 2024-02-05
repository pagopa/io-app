import * as React from "react";
import * as O from "fp-ts/lib/Option";
import { H4, H6, LabelLink, WithTestID } from "@pagopa/io-app-design-system";

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
 * This function returns the replacement url
 * for the tag DOCUMENT_URL and PRIVACY_URL
 * otherwise returns the tag because
 * it's a custom link
 */
const getOrReplaceTagWithLink = (tagLink: string, replacementUrl: string) => {
  switch (tagLink) {
    case "@DOCUMENT_URL":
    case "@PRIVACY_URL":
      return replacementUrl;
    default:
      return tagLink;
  }
};

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
      return (
        <LabelLink
          key={index}
          onPress={() =>
            onPress(getOrReplaceTagWithLink(url, props.replacementUrl))
          }
        >
          {textToBeLinked}
        </LabelLink>
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
            <H6 weight={"Regular"} color={"bluegreyDark"}>
              {text}
            </H6>
            {arrayOfLinkedText[index]}
          </>
        ) : (
          <H6 weight={"Regular"} color={"bluegreyDark"}>
            {text}
          </H6>
        )
      )}
    </H4>
  );
};

export default LinkedText;
