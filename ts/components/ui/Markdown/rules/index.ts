import blockQuoteRule from "./blockQuote";
import brRule from "./br";
import demoRule from "./demo";
import emRule from "./em";
import defaultRule from "./empty";
import headingRule from "./heading";
import linkRule from "./link";
import listRule from "./list";
import newlineRule from "./newline";
import paragraphRule from "./paragraph";
import strongRule from "./strong";
import textRule from "./text";

// By default, don't display unsupported elements
/**
 * SimpleMarkdown rules
 *
 * For a complete list
 * @see https://github.com/Khan/simple-markdown/blob/0.4.0/simple-markdown.js#L198
 */

const rules = {
  autolink: defaultRule,
  blockQuote: blockQuoteRule,
  br: brRule,
  codeBlock: defaultRule,
  def: defaultRule,
  del: defaultRule,
  demo: demoRule,
  em: emRule,
  escape: defaultRule,
  fence: defaultRule,
  heading: headingRule,
  hr: defaultRule,
  image: defaultRule,
  inlineCode: defaultRule,
  lheading: defaultRule,
  link: linkRule,
  list: listRule,
  mailto: defaultRule,
  newline: newlineRule,
  nptable: defaultRule,
  paragraph: paragraphRule,
  refimage: defaultRule,
  reflink: defaultRule,
  strong: strongRule,
  table: defaultRule,
  text: textRule,
  u: defaultRule,
  url: defaultRule
};

export default rules;
