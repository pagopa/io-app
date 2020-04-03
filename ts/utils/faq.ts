import I18n from 'i18n-js';

/** map for eacth FAQ cathegory the id of the faq to include */
export const FAQs: { 
    [key in FAQsType]: number[]
} = {
    landing_SPID: [1, 2, 3],
    landing_CIE: [4, 5],
    authentication_SPID: [8, 9, 11, 12, 13, 14],
    authentication_CIE: [4, 5, 15, 16],
    authentication_IPD_selection: [6, 7, 8],
    profile: [13, 53, 54],
    privacy: [13, 55, 56],
    onboarding: [17, 18, 19, 20, 21, 22],
    unlock: [17, 18],
    messages: [23, 24,25,26,27],
    messages_detail: [27, 28, 29, 30, 31, 32],
    wallet: [33, 34,35,36,37],
    wallet_methods: [37,41,42],
    wallet_transaction: [38, 39,40],
    payment: [43, 44, 45, 46],
    services: [47, 48, 49],
    services_detail: [50, 51, 52]
}

export type FAQsType = keyof typeof FAQCathegories;

export enum FAQCathegories {
    'landing_SPID' = 'landing_SPID',
    'landing_CIE' = 'landing_CIE',
    'authentication_SPID' = 'authentication_SPID',
    'authentication_CIE' = 'authentication_CIE',
    'authentication_IPD_selection' = 'authentication_IPD_selection',
    'profile' = 'profile',
    'privacy' = 'privacy',
    'onboarding' = 'onboarding',
    'unlock' = 'unlock',
    'messages' = 'messages',
    'messages_detail' = 'messages_detail',
    'wallet' = 'wallet',
    'wallet_methods' = 'wallet_methods',
    'wallet_transaction' = 'wallet_transaction',
    'payment' = 'payment',
    'services' = 'services',
    'services_detail' = 'services_detail'
}

export type FAQType = {
    title: string;
    content: string;
  };

/**
 * 
 * @param cathegory kind of FAQ to be returned as output
 */
export const getFAQFromCathegories = (
    cathegories: ReadonlyArray<FAQsType>
): FAQType[] =>  {
    const allIDs: Array<number> = cathegories.reduce((acc, val) => {
        const ids = FAQs[val]
        return acc.concat(ids)
    }, new Array<number>())
    
    return allIDs.filter((v,i) => allIDs.indexOf(v) === i).reduce((aa: Array<FAQType>, id: number) => {

        const titleTranlationKey = 'faq.'.concat(id.toString()).concat('.title');
        const contentTranlationKey = 'faq.'.concat(id.toString()).concat('.content');
        const item: FAQType = {title: I18n.t(titleTranlationKey), content: I18n.t(contentTranlationKey)};

        return aa.concat(item)
    }, new Array<FAQType>());
}
