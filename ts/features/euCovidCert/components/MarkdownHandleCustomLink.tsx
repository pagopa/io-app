import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { IOToast } from "../../../components/Toast";
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
            IOToast.error(I18n.t("global.genericError"))
          );
        })
      );
    }}
  >
    {props.children}
  </LegacyMarkdown>
);
