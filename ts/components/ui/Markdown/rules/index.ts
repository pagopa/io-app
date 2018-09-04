import brRule from "./br";
import emRule from "./em";
import headingRule from "./heading";
import linkRule from "./link";
import listRule from "./list";
import newlineRule from "./newline";
import paragraphRule from "./paragraph";
import strongRule from "./strong";
import textRule from "./text";

// By default, don't display unsupported elements
import defaultRule from "./empty";

/**
 * SimpleMarkdown rules
 *
 * For a complete list
 * @see https://github.com/Khan/simple-markdown/blob/0.4.0/simple-markdown.js#L198
 */

const rules = {
  heading: headingRule,
  nptable: defaultRule,
  lheading: defaultRule,
  hr: defaultRule,
  codeBlock: defaultRule,
  fence: defaultRule,
  blockQuote: defaultRule,
  list: listRule,
  def: defaultRule,
  table: defaultRule,
  newline: newlineRule,
  paragraph: paragraphRule,
  escape: defaultRule,
  autolink: defaultRule,
  mailto: defaultRule,
  url: defaultRule,
  link: linkRule,
  image: defaultRule,
  reflink: defaultRule,
  refimage: defaultRule,
  em: emRule,
  strong: strongRule,
  u: defaultRule,
  del: defaultRule,
  inlineCode: defaultRule,
  br: brRule,
  text: textRule
};

export default rules;
