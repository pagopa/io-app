import * as pot from "italia-ts-commons/lib/pot";
import {
  areAnyPaymentMethodsActiveSelector,
  BpdPotPaymentMethodActivation
} from "../paymentMethods";
import { IndexedById } from "../../../../../../../store/helpers/indexer";
import { HPan } from "../../../actions/paymentMethods";
import { fromPatchedWalletV2ToRawPaymentMethod } from "../../../../../../../utils/walletv2";
import { bancomat } from "../../__mock__/bancomat";
import { BancomatPaymentMethod } from "../../../../../../../types/pagopa";

const indexedPaymentMethods: IndexedById<BpdPotPaymentMethodActivation> = {
  id1: pot.some({
    hPan: "hpan1" as HPan,
    activationStatus: "active"
  }),
  id2: pot.some({
    hPan: "hpan2" as HPan,
    activationStatus: "active"
  }),
  id3: pot.some({
    hPan: "hpan2" as HPan,
    activationStatus: "active"
  })
};

const paymentMethod = fromPatchedWalletV2ToRawPaymentMethod(
  bancomat
) as BancomatPaymentMethod;
const paymentMethodBancomat = {
  ...paymentMethod,
  info: { ...paymentMethod.info, hashPan: "id1" }
};

describe("payment methods reducer tests", () => {
  it("should return false since no methods are provided", () => {
    expect(
      areAnyPaymentMethodsActiveSelector([]).resultFunc(indexedPaymentMethods)
    ).toBeFalsy();
  });

  it("should return true (id1 - active)", () => {
    expect(
      areAnyPaymentMethodsActiveSelector([paymentMethodBancomat]).resultFunc(
        indexedPaymentMethods
      )
    ).toBeTruthy();
  });

  it("should return false (id1 - not active)", () => {
    expect(
      areAnyPaymentMethodsActiveSelector([paymentMethodBancomat]).resultFunc({
        ...indexedPaymentMethods,
        id1: pot.some({
          hPan: "hpan1" as HPan,
          activationStatus: "inactive"
        })
      })
    ).toBeFalsy();
  });

  it("should return true, even if in error (some error)", () => {
    expect(
      areAnyPaymentMethodsActiveSelector([paymentMethodBancomat]).resultFunc({
        ...indexedPaymentMethods,
        id1: pot.toError(
          pot.some({
            hPan: "hpan1" as HPan,
            activationStatus: "active"
          }),
          new Error("some error")
        )
      })
    ).toBeTruthy();
  });

  it("should return false (none error)", () => {
    expect(
      areAnyPaymentMethodsActiveSelector([paymentMethodBancomat]).resultFunc({
        ...indexedPaymentMethods,
        id1: pot.toError(pot.none, new Error("some error"))
      })
    ).toBeFalsy();
  });

  it("should return true (at least one active)", () => {
    const indexedPaymentMethodsOneActive: IndexedById<BpdPotPaymentMethodActivation> =
      {
        id1: pot.some({
          hPan: "hpan1" as HPan,
          activationStatus: "active"
        }),
        id2: pot.some({
          hPan: "hpan2" as HPan,
          activationStatus: "inactive"
        }),
        id3: pot.some({
          hPan: "hpan2" as HPan,
          activationStatus: "notActivable"
        }),
        id4: pot.none
      };
    expect(
      areAnyPaymentMethodsActiveSelector([paymentMethodBancomat]).resultFunc(
        indexedPaymentMethodsOneActive
      )
    ).toBeTruthy();
  });
});
