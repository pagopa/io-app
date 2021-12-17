import * as React from "react";
import { ComponentProps } from "react";
import { FAQType } from "../utils/faq";
import Accordion from "./ui/Accordion";
import Markdown from "./ui/Markdown";

type Props = Readonly<{
  faqs: ReadonlyArray<FAQType>;
  onLinkClicked?: ComponentProps<typeof Markdown>["onLinkClicked"];
  shouldHandleLink?: ComponentProps<typeof Markdown>["shouldHandleLink"];
}>;

const FAQComponent: React.FunctionComponent<Props> = (props: Props) => (
  <>
    {props.faqs.map((faqType: FAQType, i: number) => (
      <Accordion
        key={i}
        title={faqType.title}
        content={faqType.content}
        onLinkClicked={props.onLinkClicked}
        shouldHandleLink={props.shouldHandleLink}
      />
    ))}
  </>
);

export default FAQComponent;
