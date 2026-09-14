export type AuthSourceContact = Readonly<{
  type: string;
  value: string;
}>;

type GetAuthSourceContactsMarkdownParams = Readonly<{
  authSource: string | undefined;
  contacts: ReadonlyArray<AuthSourceContact> | undefined;
  websiteLabel: string;
}>;

// Contacts that link to websites must be displayed on top.
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
 * Formats authentic-source contacts as the Markdown list consumed by the
 * credential-preview bottom sheet. This is deliberately pure so each contact
 * type and its ordering can be verified without rendering the bottom sheet.
 */
export const getAuthSourceContactsMarkdown = ({
  authSource,
  contacts,
  websiteLabel
}: GetAuthSourceContactsMarkdownParams): string => {
  if (!contacts || contacts.length === 0) {
    return `- ${authSource}`;
  }

  return sortContactsByUrl(contacts)
    .map(contact => {
      switch (contact.type) {
        case "email":
          return `- [${contact.value}](mailto:${contact.value})`;
        case "url":
          return `- [${websiteLabel} ${authSource}](${contact.value})`;
        default:
          return `- [${contact.value}](${contact.value})`;
      }
    })
    .join("\n");
};
