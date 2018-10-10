import * as React from "react";
import { ReactOutput, SingleASTNode, State } from "simple-markdown";

import MarkdownParagraph from "../MarkdownParagraph";
import MarkdownText from "../MarkdownText";
import { makeReactNativeRule } from "./utils";

type Accumulator = {
  children: ReadonlyArray<React.ReactNode>;
  joinedText: string;
};

// tslint:disable-next-line:cognitive-complexity
function rule() {
  return (
    node: SingleASTNode,
    output: ReactOutput,
    state: State
  ): React.ReactNode => {
    const inMessage = state.screen === "MESSAGE_DETAIL";

    if (Array.isArray(node.content)) {
      // Try to group consecutive simple text in a unique Text component
      const result = node.content.reduce(
        (accumulator: Accumulator, _, index) => {
          // The node is of type text
          if (_.type === "text") {
            if (index < node.content.length - 1) {
              // More element in the array
              if (node.content[index + 1].type === "text") {
                // Next element is still a text add the text content to the joinedText
                return {
                  ...accumulator,
                  joinedText: `${accumulator.joinedText}${_.content}`
                };
              } else {
                // Next element is not a text we need to put a new element in the children array
                return {
                  children: [
                    ...accumulator.children,
                    React.createElement(
                      MarkdownText,
                      {
                        key: accumulator.children.length + 1,
                        inMessage
                      },
                      `${accumulator.joinedText}${_.content}`
                    )
                  ],
                  joinedText: ""
                };
              }
            } else {
              // No more element in the array put this element in the children array
              return {
                children: [
                  ...accumulator.children,
                  React.createElement(
                    MarkdownText,
                    {
                      key: accumulator.children.length + 1,
                      inMessage
                    },
                    `${accumulator.joinedText}${_.content}`
                  )
                ],
                joinedText: ""
              };
            }
          }

          // If it is not a text delegate the output and put the result in the children array
          return {
            children: [
              ...accumulator.children,
              output(_, { ...state, key: accumulator.children.length + 1 })
            ],
            joinedText: ""
          };
        },
        {
          children: [],
          joinedText: ""
        }
      );

      return React.createElement(
        MarkdownParagraph,
        {
          key: state.key
        },
        result.children
      );
    }

    return null;
  };
}

export default makeReactNativeRule(rule());
