import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import { Either, isLeft, isRight } from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { GenericTicket, GenericTicketType } from "../ticket/types";

declare const danger: DangerDSLType;

export declare function warn(message: string): void;
export declare function markdown(message: string): void;

const StoryEmoji: Record<GenericTicketType, string> = {
  feat: "🌟",
  fix: "🐞",
  chore: "⚙️"
};

const warningNoTicket = () => {
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
};

const renderTicket = (ticket: GenericTicket) =>
  `${StoryEmoji[ticket.type]} [${ticket.idPrefix ? ticket.idPrefix : ""}${
    ticket.id
  }](${ticket.url}): ${ticket.title}`;

const renderTickets = (ticketList: ReadonlyArray<GenericTicket>) => {
  markdown(`
## Affected stories
${ticketList
  .map(
    s =>
      `  * ${renderTicket(s)}${
        s.parent ? ` \n _subtask of_\n     * ${renderTicket(s.parent)}` : ""
      }`
  )
  .join("\n")}\n`);
};

const renderFailure = (errors: ReadonlyArray<Error | Errors>) => {
  errors.map(e =>
    warn(
      `There was an error retrieving a ticket: ${
        e instanceof Error ? e.message : e.map(x => x.message)
      }`
    )
  );
};

export const ticketDanger = (
  foundTicket: ReadonlyArray<Either<Error | Errors, GenericTicket>>
) => {
  if (foundTicket.length === 0) {
    warningNoTicket();
    return;
  }
  if (foundTicket.some(isLeft)) {
    renderFailure(foundTicket.filter(isLeft).map(x => x.value));
  }
  if (foundTicket.some(isRight)) {
    renderTickets(foundTicket.filter(isRight).map(x => x.value));
  }
};
