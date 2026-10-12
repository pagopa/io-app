export type AuthSourceContact = Readonly<{
  type: string;
  value: string;
}>;

type GetAuthSourceContactsMarkdownParams = Readonly<{
  authSource: string | undefined;
  contacts: ReadonlyArray<AuthSourceContact> | undefined;
  websiteLabel: string;
}>;

/**
 * Removes Markdown syntax characters from interpolated values and replaces line
 * breaks/tabs with spaces so values remain inline text. URL punctuation is
 * preserved.
 */
const sanitizeMarkdownString = (value: string): string =>
  value.replace(/[\r\n\t]+/g, " ").replace(/[\\`*_[\]{}()#!|~<>]/g, "");

/** Sort contacts so that those linking to a website are displayed at the top. */
const sortContactsByUrl = (contacts: ReadonlyArray<AuthSourceContact>) =>
  [...contacts].sort((first, second) => {
    if (first.type === "url" && second.type !== "url") {
      return -1;
    }
    if (first.type !== "url" && second.type === "url") {
      return 1;
    }
    return 0;
  });

/**
 * Formats the Authentic Source's contacts as a Markdown list ready to be
 * consumed by `IOMarkdown`. This is deliberately pure so that each contact type
 * and its ordering can be tested without rendering React components.
 */
export const getAuthSourceContactsMarkdown = ({
  authSource,
  contacts,
  websiteLabel
}: GetAuthSourceContactsMarkdownParams): string => {
  const sanitizedAuthSource = sanitizeMarkdownString(authSource ?? "");

  if (!contacts || contacts.length === 0) {
    return `- ${sanitizedAuthSource}`;
  }

  return sortContactsByUrl(contacts)
    .map(contact => {
      const sanitizedValue = sanitizeMarkdownString(contact.value);
      switch (contact.type) {
        case "email":
          return `- [${sanitizedValue}](mailto:${sanitizedValue})`;
        case "phone":
          return `- [${sanitizedValue}](tel:${sanitizedValue})`;
        case "url":
          return `- [${websiteLabel} ${sanitizedAuthSource}](${sanitizedValue})`;
        default:
          return `- ${sanitizedValue}`;
      }
    })
    .join("\n");
};
