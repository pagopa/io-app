import * as t from "io-ts";

export const MessageTemplatePreconditions = t.union([
  t.literal("ALWAYS"),
  t.literal("ONCE"),
  t.literal("NEVER")
]);
export type MessageTemplatePreconditions = t.TypeOf<
  typeof MessageTemplatePreconditions
>;

export const MessageTemplate = t.intersection([
  t.type({
    hasRemoteContent: t.boolean,
    attachmentCount: t.number
  }),
  t.partial({
    hasPreconditions: MessageTemplatePreconditions,
    subjectWordCount: t.number
  })
]);
export type MessageTemplate = t.TypeOf<typeof MessageTemplate>;
