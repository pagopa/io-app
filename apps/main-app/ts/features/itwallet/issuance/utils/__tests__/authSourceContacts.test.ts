import {
  AuthSourceContact,
  getAuthSourceContactsMarkdown
} from "../authSourceContacts";

const AUTH_SOURCE = "Example authority";
const WEBSITE_LABEL = "Website";

const formatContacts = (
  contacts: ReadonlyArray<AuthSourceContact> | undefined
) =>
  getAuthSourceContactsMarkdown({
    authSource: AUTH_SOURCE,
    contacts,
    websiteLabel: WEBSITE_LABEL
  });

describe("getAuthSourceContactsMarkdown", () => {
  it.each([
    ["missing contacts", undefined],
    ["an empty contact list", []]
  ])("uses the authentic source for %s", (_, contacts) => {
    expect(formatContacts(contacts)).toBe(`- ${AUTH_SOURCE}`);
  });

  it.each([
    {
      contact: { type: "email", value: "info@example.com" },
      expected: "- [info@example.com](mailto:info@example.com)",
      name: "email"
    },
    {
      contact: { type: "url", value: "https://example.com" },
      expected: `- [${WEBSITE_LABEL} ${AUTH_SOURCE}](https://example.com)`,
      name: "URL"
    },
    {
      contact: { type: "phone", value: "tel:+39000000000" },
      expected: "- [tel:+39000000000](tel:+39000000000)",
      name: "an unknown type"
    }
  ])("formats $name contacts", ({ contact, expected }) => {
    expect(formatContacts([contact])).toBe(expected);
  });

  it("puts URLs before all the other contact types", () => {
    expect(
      formatContacts([
        { type: "email", value: "info@example.com" },
        { type: "url", value: "https://example.com" },
        { type: "phone", value: "tel:+39000000000" }
      ])
    ).toBe(
      [
        `- [${WEBSITE_LABEL} ${AUTH_SOURCE}](https://example.com)`,
        "- [info@example.com](mailto:info@example.com)",
        "- [tel:+39000000000](tel:+39000000000)"
      ].join("\n")
    );
  });
});
