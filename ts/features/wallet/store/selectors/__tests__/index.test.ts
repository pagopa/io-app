import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import {
  isWalletCategoryFilteringEnabledSelector,
  isWalletEmptySelector,
  selectWalletCards,
  selectWalletCardsByCategory,
  selectWalletCardsByType,
  selectWalletCategories,
  shouldRenderWalletCategorySelector,
  shouldRenderWalletEmptyStateSelector,
  shouldRenderItwCardsContainerSelector,
  selectBottomSheetSurveyVisible
} from "..";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../../itwallet/common/utils/itwMocksUtils";
import * as itwLifecycleSelectors from "../../../../itwallet/lifecycle/store/selectors";
import * as itwWalletInstanceSelectors from "../../../../itwallet/walletInstance/store/selectors";
import * as itwSelectors from "../../../../itwallet/common/store/selectors/remoteConfig";
import * as connectivitySelectors from "../../../../connectivity/store/selectors";
import { walletCardCategoryFilters } from "../../../types";
import { WalletCardsState } from "../../reducers/cards";

const T_ITW_CARDS: WalletCardsState = {
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

const T_OTHER_CARDS: WalletCardsState = {
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
  }
};

const T_CARDS: WalletCardsState = {
  ...T_ITW_CARDS,
  ...T_OTHER_CARDS
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
        _.set(globalState, "features.itWallet.issuance", {
          integrityKeyTag: O.some("dummy")
        }),
        _.set(globalState, "features.itWallet.credentials.credentials", {
          [CredentialType.PID]: ItwStoredCredentialsMocks.eid
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

describe("selectWalletCardsByType", () => {
  it("should return the correct cards", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const cards = selectWalletCardsByType(
      _.set(globalState, "features.wallet", {
        cards: T_CARDS
      }),
      "idPay"
    );
    expect(cards).toEqual([T_CARDS["2"]]);
  });
});

describe("selectWalletCardsByCategory", () => {
  it("should return the correct cards", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const cards = selectWalletCardsByCategory(
      _.set(globalState, "features.wallet", {
        cards: T_CARDS
      }),
      "itw"
    );
    expect(cards).toEqual([T_CARDS["4"], T_CARDS["5"]]);
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
        _.set(globalState, "features.itWallet.issuance", {
          integrityKeyTag: O.some("dummy")
        }),
        _.set(globalState, "features.itWallet.credentials", {
          credentials: { [CredentialType.PID]: ItwStoredCredentialsMocks.eid }
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

describe("isWalletCategoryFilteringEnabledSelector", () => {
  it("should return true if the categories are ['itw', 'other']", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const isWalletCategoryFilteringEnabled =
      isWalletCategoryFilteringEnabledSelector(
        _.merge(
          globalState,
          _.set(globalState, "features.wallet", {
            cards: T_CARDS
          })
        )
      );

    expect(isWalletCategoryFilteringEnabled).toBe(true);
  });

  it("should return false if the categories are ['itw']", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const isWalletCategoryFilteringEnabled =
      isWalletCategoryFilteringEnabledSelector(
        _.merge(
          globalState,
          _.set(globalState, "features.wallet", {
            cards: T_ITW_CARDS
          })
        )
      );

    expect(isWalletCategoryFilteringEnabled).toBe(false);
  });
});

describe("shouldRenderWalletCategorySelector", () => {
  it("should return true if the category filter is undefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const shouldRenderWalletCategory = shouldRenderWalletCategorySelector(
      _.merge(
        globalState,
        _.set(globalState, "features.wallet", {
          cards: T_CARDS,
          preferences: {
            categoryFilter: undefined
          }
        })
      ),
      "itw"
    );

    expect(shouldRenderWalletCategory).toBe(true);
  });

  it.each(walletCardCategoryFilters)(
    "should return true if the category filter matches the given category when the category is %s",
    categoryFilter => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );

      const shouldRenderWalletCategory = shouldRenderWalletCategorySelector(
        _.merge(
          globalState,
          _.set(globalState, "features.wallet", {
            cards: T_CARDS,
            preferences: {
              categoryFilter
            }
          })
        ),
        categoryFilter
      );

      expect(shouldRenderWalletCategory).toBe(true);
    }
  );

  it.each(walletCardCategoryFilters)(
    "should return true if the category filtering is not enabled and the category filter is %s",
    categoryFilter => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );

      const shouldRenderWalletCategory = shouldRenderWalletCategorySelector(
        _.merge(
          globalState,
          _.set(globalState, "features.wallet", {
            cards: T_ITW_CARDS,
            preferences: {
              categoryFilter
            }
          })
        ),
        categoryFilter
      );

      expect(shouldRenderWalletCategory).toBe(true);
    }
  );
});

describe("shouldRenderItwCardsContainerSelector", () => {
  it("should return true when ITW is enabled, lifecycle is valid, and no WI error", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => true);

    jest
      .spyOn(
        itwWalletInstanceSelectors,
        "itwIsWalletInstanceStatusFailureSelector"
      )
      .mockImplementation(() => false);

    jest
      .spyOn(itwSelectors, "isItwEnabledSelector")
      .mockImplementation(() => true);

    const shouldRenderItwCardsContainer =
      shouldRenderItwCardsContainerSelector(globalState);
    expect(shouldRenderItwCardsContainer).toBe(true);
  });

  it("should return true when offline, lifecycle is valid, and no WI error, even if ITW is disabled", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => true);

    jest
      .spyOn(
        itwWalletInstanceSelectors,
        "itwIsWalletInstanceStatusFailureSelector"
      )
      .mockImplementation(() => false);

    jest
      .spyOn(itwSelectors, "isItwEnabledSelector")
      .mockImplementation(() => false);

    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockImplementation(() => false);

    const shouldRenderItwCardsContainer =
      shouldRenderItwCardsContainerSelector(globalState);
    expect(shouldRenderItwCardsContainer).toBe(true);
  });

  it("should return false when ITW is disabled and online", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => true);

    jest
      .spyOn(
        itwWalletInstanceSelectors,
        "itwIsWalletInstanceStatusFailureSelector"
      )
      .mockImplementation(() => false);

    jest
      .spyOn(itwSelectors, "isItwEnabledSelector")
      .mockImplementation(() => false);

    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockImplementation(() => true);

    const shouldRenderItwCardsContainer =
      shouldRenderItwCardsContainerSelector(globalState);
    expect(shouldRenderItwCardsContainer).toBe(false);
  });

  it("should return false when lifecycle is not valid", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => false);

    jest
      .spyOn(
        itwWalletInstanceSelectors,
        "itwIsWalletInstanceStatusFailureSelector"
      )
      .mockImplementation(() => false);

    jest
      .spyOn(itwSelectors, "isItwEnabledSelector")
      .mockImplementation(() => true);

    const shouldRenderItwCardsContainer =
      shouldRenderItwCardsContainerSelector(globalState);
    expect(shouldRenderItwCardsContainer).toBe(false);
  });

  it("should return false when there is a WI error", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => true);

    jest
      .spyOn(
        itwWalletInstanceSelectors,
        "itwIsWalletInstanceStatusFailureSelector"
      )
      .mockImplementation(() => true);

    jest
      .spyOn(itwSelectors, "isItwEnabledSelector")
      .mockImplementation(() => true);

    const shouldRenderItwCardsContainer =
      shouldRenderItwCardsContainerSelector(globalState);
    expect(shouldRenderItwCardsContainer).toBe(false);
  });
});

describe("selectBottomSheetSurveyVisible", () => {
  it("should return if the bottom sheet is visible", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const isBottomSheetSurveyVisible = selectBottomSheetSurveyVisible(
      _.merge(
        globalState,
        _.set(globalState, "features.wallet.bottomSheet", {
          bottomSheetSurveyVisible: false
        })
      )
    );

    expect(isBottomSheetSurveyVisible).toBe(false);
  });
});
