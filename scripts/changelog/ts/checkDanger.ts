import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import { Either, isLeft } from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { GenericTicket, GenericTicketType } from "./story/types";

declare const danger: DangerDSLType;

export declare function warn(message: string): void;
export declare function markdown(message: string): void;

const StoryEmoji: Record<GenericTicketType, string> = {
  feat: "🌟",
  fix: "🐞",
  chore: "⚙️"
};

export const ticketDanger = (
  foundTicket: ReadonlyArray<Either<Error | Errors, GenericTicket>>
) => {
  if (foundTicket.length === 0) {
    warn(
      "Please include a Pivotal story or Jira ticket at the beginning of the PR title"
    );
    markdown(`
  Example of PR titles that include pivotal stories:
  * single story: \`[#123456] my PR title\`
  * multiple stories: \`[#123456,#123457,#123458] my PR title\`
  
  Example of PR titles that include Jira tickets:
  * single story: \`[PROJID-123] my PR title\`
  * multiple stories: \`[PROJID-1,PROJID-2,PROJID-3] my PR title\`
    `);
  } else if (foundTicket.some(isLeft)) {
    warn("Some errors!");
  } else {
    markdown("Story found!" + StoryEmoji.feat);
  }
};
