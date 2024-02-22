import * as React from "react";
import { ComponentProps } from "react";
import { FAQType } from "../utils/faq";
import Accordion from "./ui/Accordion";
import LegacyMarkdown from "./ui/Markdown/LegacyMarkdown";

type Props = Readonly<{
  faqs: ReadonlyArray<FAQType>;
  onLinkClicked?: ComponentProps<typeof LegacyMarkdown>["onLinkClicked"];
  shouldHandleLink?: ComponentProps<typeof LegacyMarkdown>["shouldHandleLink"];
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
