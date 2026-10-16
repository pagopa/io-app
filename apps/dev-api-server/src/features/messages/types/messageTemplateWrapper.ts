import * as t from "io-ts";

import { MessageTemplate } from "./messageTemplate";

export const MessageTemplateWrapper = t.type({
  template: MessageTemplate,
  count: t.number
});
export type MessageTemplateWrapper = t.TypeOf<typeof MessageTemplateWrapper>;
