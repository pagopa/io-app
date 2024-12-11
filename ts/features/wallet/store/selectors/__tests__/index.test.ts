import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import {
  isWalletEmptySelector,
  selectWalletCards,
  selectWalletCategories,
  shouldRenderWalletEmptyStateSelector
} from "..";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../../itwallet/common/utils/itwMocksUtils";
import { ItwLifecycleState } from "../../../../itwallet/lifecycle/store/reducers";
import * as itwLifecycleSelectors from "../../../../itwallet/lifecycle/store/selectors";
import { WalletCardsState } from "../../reducers/cards";

const T_CARDS: WalletCardsState = {
  "1": {
    key: "1",
    category: "payment",
    type: "payment",
    walletId: ""
  },
  "2": {
    key: "2",
    category: "bonus",
    type: "idPay",
    amount: 1234,
    avatarSource: {
      uri: ""
    },
    expireDate: new Date(),
    initiativeId: "",
    name: "ABC"
  },
  "3": {
    key: "3",
    category: "cgn",
    type: "cgn"
  },
  "4": {
    key: "4",
    category: "itw",
    type: "itw",
    credentialType: CredentialType.DRIVING_LICENSE
  },
  "5": {
    key: "5",
    category: "itw",
    type: "itw",
    credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
  }
};

describe("selectWalletCards", () => {
  it("should return the correct cards", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const cards = selectWalletCards(
      _.set(globalState, "features.wallet", {
        cards: {
          ...T_CARDS,
          test123: {
            key: "test123",
            category: "itw",
            type: "itw",
            hidden: true
          }
        }
      })
    );

    expect(cards).toEqual(Object.values(T_CARDS));
  });
});

describe("selectWalletCategories", () => {
  it("should return 'itw' and 'other'", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => true);

    const categories = selectWalletCategories(
      _.set(globalState, "features.wallet", {
        cards: T_CARDS
      })
    );
    expect(categories).toEqual(new Set(["itw", "other"]));
  });

  it("should return 'itw' and 'other' categories when itw is valid but no ITW cards are present", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const categories = selectWalletCategories(
      _.merge(
        globalState,
        _.set(globalState, "features.wallet", {
          cards: [T_CARDS["1"], T_CARDS["2"], T_CARDS["3"]]
        }),
        _.set(globalState, "features.itWallet", {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID
        }),
        _.set(globalState, "features.itWallet.issuance", {
          integrityKeyTag: O.some("dummy")
        }),
        _.set(globalState, "features.itWallet.credentials", {
          eid: O.some(ItwStoredCredentialsMocks.eid)
        })
      )
    );
    expect(categories).toEqual(new Set(["itw", "other"]));
  });

  it("should return only `other` category", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const categories = selectWalletCategories(
      _.set(globalState, "features.wallet", {
        cards: [T_CARDS["1"], T_CARDS["2"], T_CARDS["3"]]
      })
    );
    expect(categories).toEqual(new Set(["other"]));
  });
});

describe("isWalletEmptySelector", () => {
  it("should return true if there are no categories to display", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const isWalletEmpty = isWalletEmptySelector(
      _.merge(
        globalState,
        _.set(globalState, "features.wallet", {
          cards: []
        }),
        _.set(globalState, "features.itWallet", {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_INSTALLED
        }),
        _.set(globalState, "features.itWallet.issuance", {
          integrityKeyTag: O.none
        }),
        _.set(globalState, "features.itWallet.credentials", {
          eid: O.none
        })
      )
    );
    expect(isWalletEmpty).toBe(true);
  });

  it("should return false if there are some cards", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const isWalletEmpty = isWalletEmptySelector(
      _.merge(
        globalState,
        _.set(globalState, "features.wallet", {
          cards: [T_CARDS["1"], T_CARDS["2"], T_CARDS["3"]]
        })
      )
    );
    expect(isWalletEmpty).toBe(false);
  });

  it("should return false if ITW is valid", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const isWalletEmpty = isWalletEmptySelector(
      _.merge(
        globalState,
        _.set(globalState, "features.wallet", {
          cards: []
        }),
        _.set(globalState, "features.itWallet", {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID
        }),
        _.set(globalState, "features.itWallet.issuance", {
          integrityKeyTag: O.some("dummy")
        }),
        _.set(globalState, "features.itWallet.credentials", {
          eid: O.some(ItwStoredCredentialsMocks.eid)
        })
      )
    );
    expect(isWalletEmpty).toBe(false);
  });
});

describe("shouldRenderWalletEmptyStateSelector", () => {
  it.each`
    walletCards       | userMethods     | cgnInformation           | expected
    ${[]}             | ${pot.some([])} | ${pot.none}              | ${true}
    ${[T_CARDS["1"]]} | ${pot.some([])} | ${pot.none}              | ${false}
    ${[]}             | ${pot.some([])} | ${pot.someError({}, {})} | ${false}
  `(
    "should return $expected if walletCards is $walletCards, userMethods is $userMethods and cgnInformation is $cgnInformation",
    ({ walletCards, userMethods, cgnInformation, expected }) => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );

      const shouldRenderWalletEmptyState = shouldRenderWalletEmptyStateSelector(
        _.merge(
          globalState,
          _.set(globalState, "features.wallet", {
            cards: walletCards
          }),
          _.set(globalState, "features.payments.wallet", {
            userMethods
          }),
          _.set(globalState, "bonus.cgn.detail.information", cgnInformation)
        )
      );
      expect(shouldRenderWalletEmptyState).toBe(expected);
    }
  );
});
