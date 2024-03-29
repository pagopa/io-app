import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { Toast } from "native-base";
import * as React from "react";
import LegacyMarkdown from "../../../components/ui/Markdown/LegacyMarkdown";
import { deriveCustomHandledLink } from "../../../components/ui/Markdown/handlers/link";
import I18n from "../../../i18n";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { taskLinking } from "../../../utils/url";

export const MarkdownHandleCustomLink = (
  props: React.ComponentProps<typeof LegacyMarkdown>
): React.ReactElement => (
  <LegacyMarkdown
    {...props}
    onLinkClicked={(link: string) => {
      pipe(
        deriveCustomHandledLink(link),
        E.map(hl => {
          if (hl.schema === "copy") {
            clipboardSetStringWithFeedback(hl.value);
            return;
          }
          taskLinking(hl.url)().catch(_ =>
            Toast.show({
              text: I18n.t("global.genericError"),
              type: "danger"
            })
          );
        })
      );
    }}
  >
    {props.children}
  </LegacyMarkdown>
);
