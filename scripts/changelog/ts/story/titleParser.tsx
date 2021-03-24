import { fromNullable, Option } from "fp-ts/lib/Option";
import { JiraKey } from "./jira/types";
import { PivotalId } from "./pivotal/types";

const pivotalRegex = /\[(#\d+(,#\d+)*)]\s.+/;
const jiraRegex = /\[([a-zA-Z]+-\d+(,[a-zA-Z]+-\d+)*)]\s.+/;

/**
 * From a PR title extract the Pivotal IDs or Jira IDs (if any).
 * The title can have multiple IDs but they must all be of the same type
 * @param title
 */
export const parsePrTitle = (
  title: string
): Option<ReadonlyArray<JiraKey> | ReadonlyArray<PivotalId>> => {
  const maybePivotal = fromNullable(title.match(pivotalRegex)?.pop()).map(
    p => p.replace("#", "").split(",") as Array<PivotalId>
  );
  const maybeJira = fromNullable(title.match(jiraRegex)?.pop()).map(
    j => j.split(",") as Array<JiraKey>
  );

  return maybePivotal.isNone() ? maybeJira : maybePivotal;
};
