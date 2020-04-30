import { fromNullable } from "fp-ts/lib/Option";
import I18n from "i18n-js";

/** map, for each FAQ category, the ids of the FAQs related to the category */
export const FAQs: Record<
  FAQsCategoriesType,
  ReadonlyArray<number> | undefined
> = {
  landing_SPID: [1, 2, 3],
  landing_CIE: [4, 5],
  authentication_SPID: [8, 9, 11, 12, 13, 14],
  authentication_CIE: [4, 5, 15, 16],
  authentication_IPD_selection: [6, 7, 8],
  profile: [13, 53, 54],
  privacy: [13, 55, 56],
  onboarding_pin: [17, 18, 19],
  onboarding_fingerprint: [20, 21, 22],
  unlock: [17, 18],
  messages: [23, 24, 25, 26, 27],
  messages_detail: [27, 28, 29, 30, 31, 32],
  wallet: [57, 33, 34, 35, 36, 37],
  wallet_insert_notice_data: [33, 35],
  wallet_methods: [37, 41, 42],
  wallet_transaction: [38, 39, 40],
  payment: [43, 44, 45, 46],
  services: [47, 48, 49],
  services_detail: [50, 51, 52]
};

export type FAQsCategoriesType =
  | "landing_SPID"
  | "landing_CIE"
  | "authentication_SPID"
  | "authentication_CIE"
  | "authentication_IPD_selection"
  | "profile"
  | "privacy"
  | "onboarding_pin"
  | "onboarding_fingerprint"
  | "unlock"
  | "messages"
  | "messages_detail"
  | "wallet"
  | "wallet_insert_notice_data"
  | "wallet_methods"
  | "wallet_transaction"
  | "payment"
  | "services"
  | "services_detail";

export type FAQType = {
  title: string;
  content: string;
};

/**
 * Recover the title and the content of the FAQs related to the categories presented as input
 * @param category kind of FAQ to be returned as output
 */
export const getFAQsFromCategories = (
  categories: ReadonlyArray<FAQsCategoriesType>
): ReadonlyArray<FAQType> => {
  const faqIDs: Set<number> = categories.reduce(
    (acc, val) =>
      new Set<number>([...acc, ...fromNullable(FAQs[val]).fold([], s => s)]),
    new Set<number>()
  );

  return Array.from(faqIDs).map<FAQType>(id => {
    return {
      title: I18n.t(`faq.${id}.title`),
      content: I18n.t(`faq.${id}.content`)
    };
  });
};
