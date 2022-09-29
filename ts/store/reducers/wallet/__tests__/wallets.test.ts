import * as E from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { pipe } from "fp-ts/lib/function";
import { remoteUndefined } from "../../../../features/bonus/bpd/model/RemoteValue";
import {
  CreditCard,
  isRawCreditCard,
  PatchedWalletV2ListResponse,
  RawPaymentMethod,
  Wallet
} from "../../../../types/pagopa";
import { walletsV2_2, walletsV2_1, walletsV2_3 } from "../__mocks__/wallets";
import { toIndexed } from "../../../helpers/indexer";
import {
  bancomatListSelector,
  bPayListSelector,
  creditCardListSelector,
  creditCardWalletV1Selector,
  getFavoriteWallet,
  getFavoriteWalletId,
  withPaymentFeatureSelector,
  getWalletsById,
  pagoPaCreditCardWalletV1Selector,
  satispayListSelector,
  updatingFavouriteWalletSelector
} from "../wallets";
import { GlobalState } from "../../types";
import { convertWalletV2toWalletV1 } from "../../../../utils/walletv2";
import { getPaymentMethodHash } from "../../../../utils/paymentMethod";
import { appReducer } from "../../index";
import { applicationChangeState } from "../../../actions/application";
import {
  fetchWalletsSuccess,
  setFavouriteWalletFailure,
  setFavouriteWalletRequest,
  setFavouriteWalletSuccess,
  updatePaymentStatus
} from "../../../actions/wallet/wallets";
import { EnableableFunctionsEnum } from "../../../../../definitions/pagopa/EnableableFunctions";
import { deleteAllPaymentMethodsByFunction } from "../../../actions/wallet/delete";
import { TypeEnum } from "../../../../../definitions/pagopa/Wallet";
import {
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../../../../utils/input";

describe("walletV2 selectors", () => {
  const maybeWalletsV2 = PatchedWalletV2ListResponse.decode(walletsV2_1);
  const indexedWallets = toIndexed(
    pipe(
      maybeWalletsV2,
      E.map(walletsV2 => walletsV2.data!.map(convertWalletV2toWalletV1)),
      E.getOrElseW(() => [])
    ),
    w => w.idWallet
  );
  const globalState = {
    wallet: {
      wallets: {
        walletById: pot.some(indexedWallets)
      },
      abi: remoteUndefined
    }
  } as any as GlobalState;
  it("should decode walletv2 list", () => {
    expect(E.isRight(maybeWalletsV2)).toBeTruthy();
  });

  it("should return credit cards", () => {
    const maybeCC = creditCardWalletV1Selector(globalState);
    expect(pot.isSome(maybeCC)).toBeTruthy();
    if (pot.isSome(maybeCC)) {
      expect(maybeCC.value.length).toEqual(1);
      const paymentMethod = maybeCC.value[0].paymentMethod;
      if (paymentMethod) {
        expect(isRawCreditCard(paymentMethod)).toBeTruthy();
        expect(getPaymentMethodHash(paymentMethod)).toEqual(
          "853afb770973eb48d5d275778bd124b28f60a684c20bcdf05dc8f0014c7ce871"
        );
      }
    }
  });

  it("should return bancomat", () => {
    const maybeBancomat = bancomatListSelector(globalState);
    expect(pot.isSome(maybeBancomat)).toBeTruthy();
    const hpans = [
      "a591ab131bd9492e6df0357f1ac52785a96ddc8e772baddbb02e2169af9474f4",
      "e105a87731025d54181d8e4c4c04ff344ce82e57d6a3d6c6911e8eadb0348d7b"
    ];
    if (pot.isSome(maybeBancomat)) {
      expect(maybeBancomat.value.length).toEqual(2);
      maybeBancomat.value.forEach(w => {
        expect(hpans.find(h => h === getPaymentMethodHash(w))).toBeDefined();
      });
    }
  });

  it("should return credit card supporting pagoPa payments", () => {
    const maybePagoPaCC = pagoPaCreditCardWalletV1Selector(globalState);
    expect(pot.isSome(maybePagoPaCC)).toBeTruthy();
    if (pot.isSome(maybePagoPaCC)) {
      expect(maybePagoPaCC.value.length).toEqual(1);
      const paymentMethod = maybePagoPaCC.value[0].paymentMethod;
      if (paymentMethod) {
        expect(isRawCreditCard(paymentMethod)).toBeTruthy();
        expect(getPaymentMethodHash(paymentMethod)).toEqual(
          "853afb770973eb48d5d275778bd124b28f60a684c20bcdf05dc8f0014c7ce871"
        );
      }
    }
  });

  it("should return empty list since there is no method compliant with pagoPa", () => {
    const maybeWallets = PatchedWalletV2ListResponse.decode(walletsV2_2);
    const globalState = mockWalletState(maybeWallets);
    const maybePagoPaCC = pagoPaCreditCardWalletV1Selector(globalState);
    expect(pot.isSome(maybePagoPaCC)).toBeTruthy();
    if (pot.isSome(maybePagoPaCC)) {
      expect(maybePagoPaCC.value.length).toEqual(0);
    }
  });
  it("should filter credit card and return one", () => {
    const maybeWallets = PatchedWalletV2ListResponse.decode(walletsV2_3);
    const globalState = mockWalletState(maybeWallets);
    const potCreditCard = creditCardListSelector(globalState);
    expect(pot.isSome(potCreditCard)).toBeTruthy();
    expect(pot.getOrElse(potCreditCard, undefined)).toBeDefined();
    if (pot.isSome(potCreditCard)) {
      expect(potCreditCard.value.length).toEqual(1);
    }
  });
  it("should filter bancomat and return one", () => {
    const maybeWallets = PatchedWalletV2ListResponse.decode(walletsV2_3);
    const globalState = mockWalletState(maybeWallets);
    const potBancomat = bancomatListSelector(globalState);
    expect(pot.isSome(potBancomat)).toBeTruthy();
    expect(pot.getOrElse(potBancomat, undefined)).toBeDefined();
    if (pot.isSome(potBancomat)) {
      expect(potBancomat.value.length).toEqual(1);
    }
  });
  it("should filter BPay and return one", () => {
    const maybeWallets = PatchedWalletV2ListResponse.decode(walletsV2_3);
    const globalState = mockWalletState(maybeWallets);
    const potBPay = bPayListSelector(globalState);
    expect(pot.isSome(potBPay)).toBeTruthy();
    expect(pot.getOrElse(potBPay, undefined)).toBeDefined();
    if (pot.isSome(potBPay)) {
      expect(potBPay.value.length).toEqual(1);
    }
  });
  it("should filter satispay and return one", () => {
    const maybeWallets = PatchedWalletV2ListResponse.decode(walletsV2_3);
    const globalState = mockWalletState(maybeWallets);
    const potSatispay = satispayListSelector(globalState);
    expect(pot.isSome(potSatispay)).toBeTruthy();
    expect(pot.getOrElse(potSatispay, undefined)).toBeDefined();
    if (pot.isSome(potSatispay)) {
      expect(potSatispay.value.length).toEqual(1);
    }
  });
});

describe("walletV2 favoriteId Selector", () => {
  const maybeWalletsV2 = PatchedWalletV2ListResponse.decode(walletsV2_1);
  // set all method to not favourite
  const indexedWallets = toIndexed(
    pipe(
      maybeWalletsV2,
      E.map(walletsV2 =>
        walletsV2
          .data!.map(convertWalletV2toWalletV1)
          .map(w => ({ ...w, favourite: false }))
      ),
      E.getOrElseW(() => [])
    ),
    w => w.idWallet
  );

  it("should return pot none - no wallets", () => {
    const noWallets = {
      wallet: {
        wallets: {
          walletById: pot.none
        }
      }
    } as any as GlobalState;
    expect(getFavoriteWalletId(noWallets)).toEqual(pot.none);
    expect(getFavoriteWallet(noWallets)).toEqual(pot.none);
  });

  it("should return pot none - no favourite method", () => {
    const noFavouriteState = {
      wallet: {
        wallets: {
          walletById: pot.some(indexedWallets)
        }
      }
    } as GlobalState;
    expect(getFavoriteWalletId(noFavouriteState)).toEqual(pot.none);
    expect(getFavoriteWallet(noFavouriteState)).toEqual(pot.none);
  });

  it("should return the favourite wallet id", () => {
    const firstKey = _.keys(indexedWallets)[0];
    const favouriteWallet: Wallet = {
      ...(indexedWallets[firstKey] as Wallet),
      favourite: true
    };
    const aFavourite = _.update(
      indexedWallets,
      firstKey,
      () => favouriteWallet
    );
    const aFavoriteState = {
      wallet: {
        wallets: {
          walletById: pot.some(aFavourite)
        }
      }
    } as GlobalState;
    expect(getFavoriteWalletId(aFavoriteState)).toEqual(
      pot.some(favouriteWallet.idWallet)
    );
    expect(getFavoriteWallet(aFavoriteState)).toEqual(
      pot.some(favouriteWallet)
    );
  });
});

describe("updatePaymentStatus state changes", () => {
  const walletsV2 = pipe(
    walletsV2_1,
    PatchedWalletV2ListResponse.decode,
    E.getOrElseW(() => [] as PatchedWalletV2ListResponse)
  );
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const withWallets = appReducer(
    globalState,
    fetchWalletsSuccess(walletsV2.data!.map(convertWalletV2toWalletV1))
  );
  expect(pot.isSome(withWallets.wallet.wallets.walletById)).toBeTruthy();
  if (pot.isSome(withWallets.wallet.wallets.walletById)) {
    const currentIndexedWallets = withWallets.wallet.wallets.walletById.value;
    expect(Object.keys(currentIndexedWallets).length).toEqual(
      walletsV2.data!.length
    );
    // try to invert payment status on first wallet
    const temp = Object.values(currentIndexedWallets)[0];
    const firstWallet = {
      ...temp,
      paymentMethod: {
        ...temp!.paymentMethod,
        pagoPA: true
      } as RawPaymentMethod
    } as Wallet;
    const updatePaymentStatusState = appReducer(
      globalState,
      updatePaymentStatus.success({
        ...firstWallet,
        pagoPA: false
      } as any)
    );
    const updatedState = updatePaymentStatusState.wallet.wallets.walletById;
    expect(pot.isSome(updatedState)).toBeTruthy();
    if (pot.isSome(updatedState)) {
      const updatedFirstWallet = Object.values(updatedState.value).find(
        w => w!.idWallet === firstWallet.idWallet
      );
      expect(updatedFirstWallet!.paymentMethod!.pagoPA).toBeTruthy();
    }
  }
});

describe("getPayablePaymentMethodsSelector", () => {
  it("should return false - no payable methods", () => {
    const withWallets = appReducer(undefined, fetchWalletsSuccess([]));
    expect(withPaymentFeatureSelector(withWallets).length).toEqual(0);
  });

  it("should return false - empty wallet", () => {
    const paymentMethods = pipe(
      walletsV2_1,
      PatchedWalletV2ListResponse.decode,
      E.getOrElseW(() => [] as PatchedWalletV2ListResponse)
    );

    const updatedMethods = paymentMethods.data!.map(w =>
      convertWalletV2toWalletV1({ ...w, enableableFunctions: [] })
    );
    const withWallets = appReducer(
      undefined,
      fetchWalletsSuccess(updatedMethods)
    );
    expect(updatedMethods.length).toBeGreaterThan(0);
    expect(withPaymentFeatureSelector(withWallets).length).toEqual(0);
  });

  it("should return true - one payable method", () => {
    const paymentMethods = pipe(
      walletsV2_1,
      PatchedWalletV2ListResponse.decode,
      E.getOrElseW(() => [] as PatchedWalletV2ListResponse)
    );
    const updatedMethods = [...paymentMethods.data!];
    // eslint-disable-next-line functional/immutable-data
    updatedMethods[0] = {
      ...updatedMethods[0],
      pagoPA: true,
      enableableFunctions: [EnableableFunctionsEnum.pagoPA]
    };
    const withWallets = appReducer(
      undefined,
      fetchWalletsSuccess(updatedMethods.map(convertWalletV2toWalletV1))
    );
    expect(updatedMethods.length).toBeGreaterThan(0);
    expect(withPaymentFeatureSelector(withWallets).length).toBeGreaterThan(0);
  });
});

describe("getPagoPAMethodsSelector", () => {
  it("should return false - no payable methods", () => {
    const withWallets = appReducer(undefined, fetchWalletsSuccess([]));
    expect(withPaymentFeatureSelector(withWallets).length).toEqual(0);
  });

  it("should return true - one pagoPA method", () => {
    const paymentMethods = pipe(
      walletsV2_1,
      PatchedWalletV2ListResponse.decode,
      E.getOrElseW(() => [] as PatchedWalletV2ListResponse)
    );
    const updatedMethods = [...paymentMethods.data!];
    // eslint-disable-next-line functional/immutable-data
    updatedMethods[0] = {
      ...updatedMethods[0],
      enableableFunctions: [EnableableFunctionsEnum.pagoPA]
    };
    const withWallets = appReducer(
      undefined,
      fetchWalletsSuccess(updatedMethods.map(convertWalletV2toWalletV1))
    );
    expect(updatedMethods.length).toBeGreaterThan(0);
    expect(withPaymentFeatureSelector(withWallets).length).toBeGreaterThan(0);
  });
});

describe("updatingFavouriteWalletSelector", () => {
  it("when empty should return pot.none", () => {
    const empty = appReducer(undefined, applicationChangeState("active"));
    expect(updatingFavouriteWalletSelector(empty)).toEqual(pot.none);
  });

  it("when a favourite setting request is dispatch, should return pot.someLoading", () => {
    const empty = appReducer(undefined, setFavouriteWalletRequest(99));
    expect(updatingFavouriteWalletSelector(empty)).toEqual(
      pot.noneUpdating(99)
    );
  });

  it("when a favourite setting request has been successfully, should return pot.some", () => {
    const updatedWallet = {
      idWallet: 99,
      type: TypeEnum.CREDIT_CARD,
      favourite: true,
      creditCard: {
        id: 3,
        holder: "Gian Maria Rossi",
        pan: "************0000" as CreditCardPan,
        expireMonth: "09" as CreditCardExpirationMonth,
        expireYear: "22" as CreditCardExpirationYear,
        brandLogo:
          "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_poste.png",
        flag3dsVerified: false,
        brand: "POSTEPAY",
        onUs: false
      } as CreditCard,
      pspEditable: true,
      isPspToIgnore: false,
      saved: false,
      registeredNexi: false
    };
    const empty = appReducer(
      undefined,
      setFavouriteWalletSuccess(updatedWallet as Wallet)
    );
    expect(updatingFavouriteWalletSelector(empty)).toEqual(pot.some(99));
  });

  it("when a favourite setting request has been failed, should return pot.someError", () => {
    const empty = appReducer(undefined, setFavouriteWalletRequest(99));
    const state = appReducer(
      empty,
      setFavouriteWalletFailure(new Error("setFavouriteWalletFailure error"))
    );
    expect(updatingFavouriteWalletSelector(state)).toEqual(
      pot.noneError(new Error("setFavouriteWalletFailure error"))
    );
  });
});

describe("walletV2 reducer - deleteAllByFunction", () => {
  it("should delete only those payment method whose have specified function enabled", () => {
    const aPaymentMethod = walletsV2_1.data[0];
    // 2 pagoPA + 1 BPD
    const wallet = [
      {
        ...aPaymentMethod,
        idWallet: 1,
        enableableFunctions: [EnableableFunctionsEnum.pagoPA]
      },
      {
        ...aPaymentMethod,
        idWallet: 2,
        enableableFunctions: [EnableableFunctionsEnum.pagoPA]
      },
      {
        ...aPaymentMethod,
        idWallet: 3,
        enableableFunctions: [EnableableFunctionsEnum.BPD]
      }
    ];
    const maybeWalletsV2 = PatchedWalletV2ListResponse.decode({ data: wallet });
    const maybeWalletsExceptBPDV2 = PatchedWalletV2ListResponse.decode({
      data: wallet.filter(w =>
        w.enableableFunctions.includes(EnableableFunctionsEnum.BPD)
      )
    });
    const convertedWallets = (
      E.getOrElseW(() => [])(maybeWalletsV2) as PatchedWalletV2ListResponse
    ).data!.map(convertWalletV2toWalletV1);
    const convertedWalletsExceptBPD = (
      E.getOrElseW(() => [])(
        maybeWalletsExceptBPDV2
      ) as PatchedWalletV2ListResponse
    ).data!.map(convertWalletV2toWalletV1);

    const globalState: GlobalState = appReducer(
      undefined,
      fetchWalletsSuccess(convertedWallets)
    );
    const walletFull = getWalletsById(globalState);
    expect(pot.isSome(walletFull)).toBeTruthy();
    if (pot.isSome(walletFull)) {
      expect(Object.keys(walletFull.value).length).toEqual(
        convertedWallets.length
      );
    }
    const updatedState: GlobalState = appReducer(
      globalState,
      deleteAllPaymentMethodsByFunction.success({
        wallets: convertedWalletsExceptBPD,
        deletedMethodsCount: 1
      })
    );
    const walletUpdated = getWalletsById(updatedState);
    expect(pot.isSome(walletUpdated)).toBeTruthy();
    if (pot.isSome(walletUpdated)) {
      expect(Object.keys(walletUpdated.value).length).toEqual(
        convertedWalletsExceptBPD.length
      );
    }
  });
});

const mockWalletState = (
  walletResponse: E.Either<Errors, PatchedWalletV2ListResponse>
) => {
  const indexedWallets = toIndexed(
    E.getOrElseW(() => [] as PatchedWalletV2ListResponse)(
      walletResponse
    ).data!.map(convertWalletV2toWalletV1),
    w => w.idWallet
  );
  return {
    wallet: {
      abi: remoteUndefined,
      wallets: {
        walletById: pot.some(indexedWallets)
      }
    }
  } as GlobalState;
};
