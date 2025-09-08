import I18n from "i18next";
import { FAQsCategoriesType, FAQType, getFAQsFromCategories } from "../faq";

describe("getFAQsFromCategories", () => {
  const categories: ReadonlyArray<FAQsCategoriesType> = [
    "landing_SPID",
    "landing_CIE",
    "authentication_IPD_selection"
  ];
  const faqs: ReadonlyArray<FAQType> = [
    {
      title: I18n.t("faq.1.title"),
      content: I18n.t("faq.1.content")
    },
    {
      title: I18n.t("faq.2.title"),
      content: I18n.t("faq.2.content")
    },
    {
      title: I18n.t("faq.3.title"),
      content: I18n.t("faq.3.content")
    },
    {
      title: I18n.t("faq.4.title"),
      content: I18n.t("faq.4.content")
    },
    {
      title: I18n.t("faq.5.title"),
      content: I18n.t("faq.5.content")
    },
    {
      title: I18n.t("faq.6.title"),
      content: I18n.t("faq.6.content")
    },
    {
      title: I18n.t("faq.7.title"),
      content: I18n.t("faq.7.content")
    },
    {
      title: I18n.t("faq.8.title"),
      content: I18n.t("faq.8.content")
    }
  ];

  it("should return the FAQType array from an array of FAQsCategoriesType", () => {
    expect(getFAQsFromCategories(categories)).toStrictEqual(faqs);
  });

  it("should return the FAQType array from an array of FAQsCategoriesType", () => {
    expect(getFAQsFromCategories([...categories, ...categories])).toStrictEqual(
      faqs
    );
  });

  it("Should return an empty array", () => {
    expect(getFAQsFromCategories([])).toStrictEqual([]);
  });

  it("Should return an empty array", () => {
    expect(
      getFAQsFromCategories(["not mapped key" as FAQsCategoriesType])
    ).toStrictEqual([]);
  });
});
