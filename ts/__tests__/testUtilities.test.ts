export const mockI18nApplyParameters = (
  template: string,
  params?: Record<string, string | number | undefined>
): string =>
  // Use a regular expression to find all {{paramName}} placeholders
  params != null
    ? template.replace(/\{\{(\w+)\}\}/g, (_match, paramName) => {
        const value = params[paramName];
        return value !== undefined ? String(value) : `{{${paramName}}}`;
      })
    : template;

describe("testUtilities", () => {
  it("should perform replacement", () => {
    const output = mockI18nApplyParameters("This {{p1}} is {{p2}}", {
      p1: "test",
      p2: 123
    });
    expect(output).toBe("This test is 123");
  });
});
