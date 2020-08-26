import * as React from "react";
import {
  FAQsCategoriesType,
  FAQType,
  getFAQsFromCategories
} from "../utils/faq";
import Accordion from "./ui/Accordion";

type Props = Readonly<{
  faqCategories: ReadonlyArray<FAQsCategoriesType>;
  onLinkClicked?: (url: string) => void;
}>;

const FAQComponent: React.FunctionComponent<Props> = (props: Props) => (
    <>
      {getFAQsFromCategories(props.faqCategories).map(
        (faqType: FAQType, i: number) => (
          <Accordion
            key={i}
            title={faqType.title}
            content={faqType.content}
            onLinkClicked={props.onLinkClicked}
          />
        )
      )}
    </>
  );

export default FAQComponent;
