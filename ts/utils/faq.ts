import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";

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
  wallet: [57, 78, 33, 34, 35, 36, 37],
  wallet_insert_notice_data: [33, 35],
  wallet_methods: [37, 41, 42, 66, 79, 80],
  wallet_methods_security: [81],
  wallet_transaction: [38, 39, 40],
  payment: [43, 44, 45, 46],
  services: [47, 48, 49],
  services_detail: [50, 51, 52],
  bonus_information: [58, 59, 67, 68, 69, 70, 71, 72, 77],
  bonus_eligible: [60, 61, 69, 71, 72, 73, 75],
  bonus_eligible_discrepancies: [62],
  bonus_detail: [63, 64, 65, 76],
  bonus_available_list: [66, 74]
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
  | "wallet_methods_security"
  | "wallet_transaction"
  | "payment"
  | "services"
  | "services_detail"
  | "bonus_information"
  | "bonus_eligible"
  | "bonus_eligible_discrepancies"
  | "bonus_detail"
  | "bonus_available_list";

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
      new Set<number>([
        ...acc,
        ...pipe(
          FAQs[val],
          O.fromNullable,
          O.fold(
            () => [],
            s => s
          )
        )
      ]),
    new Set<number>()
  );

  return Array.from(faqIDs).map<FAQType>(id => ({
    title: I18n.t(`faq.${id}.title`, { defaultValue: "faq title n/a" }),
    content: I18n.t(`faq.${id}.content`, { defaultValue: "faq content n/a" })
  }));
};
