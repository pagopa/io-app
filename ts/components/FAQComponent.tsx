import * as React from "react";
import { FAQType } from "../utils/faq";
import Accordion from "./ui/Accordion";

type Props = Readonly<{
  faqs: ReadonlyArray<FAQType>;
  onLinkClicked?: (url: string) => void;
}>;

const FAQComponent: React.FunctionComponent<Props> = (props: Props) => (
  <>
    {props.faqs.map((faqType: FAQType, i: number) => (
      <Accordion
        key={i}
        title={faqType.title}
        content={faqType.content}
        onLinkClicked={props.onLinkClicked}
      />
    ))}
  </>
);

export default FAQComponent;
