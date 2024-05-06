import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { useIOToast } from "@pagopa/io-app-design-system";
import { deriveCustomHandledLink } from "../../../components/ui/Markdown/handlers/link";
import I18n from "../../../i18n";
import { clipboardSetStringWithFeedback } from "../../../utils/clipboard";
import { taskLinking } from "../../../utils/url";
import { Markdown } from "../../../components/ui/Markdown/Markdown";

export const MarkdownHandleCustomLink = (
  props: React.ComponentProps<typeof Markdown>
): React.ReactElement => {
  const toast = useIOToast();
  return (
    <Markdown
      {...props}
      loadingLines={4}
      onLinkClicked={(link: string) => {
        pipe(
          deriveCustomHandledLink(link),
          E.map(hl => {
            if (hl.schema === "copy") {
              clipboardSetStringWithFeedback(hl.value);
              return;
            }
            taskLinking(hl.url)().catch(_ =>
              toast.error(I18n.t("global.genericError"))
            );
          })
        );
      }}
    >
      {props.children}
    </Markdown>
  );
};
