import * as pot from "@pagopa/ts-commons/lib/pot";
import { Store, createStore } from "redux";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import {
  InstrumentDTO,
  InstrumentTypeEnum
} from "../../../../../../definitions/idpay/InstrumentDTO";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { getGenericError } from "../../../../../utils/errors";
import {
  idPayCodeCieBannerClose,
  idPayEnrollCode,
  idPayGenerateCode,
  idPayGetCodeStatus,
  idPayResetCode
} from "../actions";
import { IdPayCodeState } from "../reducers";
import {
  idPayCodeSelector,
  isIdPayCodeEnrollmentRequestFailureSelector,
  isIdPayCodeEnrollmentRequestLoadingSelector,
  isIdPayCodeFailureSelector,
  isIdPayCodeLoadingSelector,
  isIdPayCodeOnboardedSelector,
  showIdPayCodeBannerSelector
} from "../selectors";

const tInitiativeId = "123abc";

describe("IdPay Code reducer", () => {
  it("should have initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(globalState.features.idPay.code).toStrictEqual(INITIAL_STATE);
  });

  it("should handle idPayGetCodeStatus action", () => {
    const store = createStoreWith(INITIAL_STATE);

    store.dispatch(idPayGetCodeStatus.request());
    expect(store.getState().features.idPay.code.isOnboarded).toStrictEqual(
      pot.noneLoading
    );

    store.dispatch(idPayGetCodeStatus.success({ isIdPayCodeEnabled: true }));
    expect(store.getState().features.idPay.code.isOnboarded).toStrictEqual(
      pot.some(true)
    );

    const error = {
      ...getGenericError(new Error(""))
    };

    store.dispatch(idPayGetCodeStatus.failure(error));
    expect(store.getState().features.idPay.code.isOnboarded).toStrictEqual(
      pot.someError(true, error)
    );
  });

  it("should handle idPayGenerateCode action", () => {
    const tCode = "12345";

    const store = createStoreWith(INITIAL_STATE);

    store.dispatch(idPayGenerateCode.request({}));
    expect(store.getState().features.idPay.code.code).toStrictEqual(
      pot.noneLoading
    );

    store.dispatch(idPayGenerateCode.success({ idpayCode: tCode }));
    expect(store.getState().features.idPay.code.code).toStrictEqual(
      pot.some(tCode)
    );

    const error = {
      ...getGenericError(new Error(""))
    };

    store.dispatch(idPayGenerateCode.failure(error));
    expect(store.getState().features.idPay.code.code).toStrictEqual(
      pot.someError(tCode, error)
    );
  });

  it("should handle idPayEnrollCode action", () => {
    const store = createStoreWith(INITIAL_STATE);

    store.dispatch(idPayEnrollCode.request({ initiativeId: "abc" }));
    expect(
      store.getState().features.idPay.code.enrollmentRequest
    ).toStrictEqual(pot.noneLoading);

    store.dispatch(idPayEnrollCode.success());
    expect(
      store.getState().features.idPay.code.enrollmentRequest
    ).toStrictEqual(pot.some(undefined));

    const error = {
      ...getGenericError(new Error(""))
    };

    store.dispatch(idPayEnrollCode.failure(error));
    expect(
      store.getState().features.idPay.code.enrollmentRequest
    ).toStrictEqual(pot.someError(undefined, error));
  });

  it("should handle idPayResetCode action", () => {
    const tCode = "12345";

    const store = createStoreWith(INITIAL_STATE);

    store.dispatch(idPayGenerateCode.success({ idpayCode: tCode }));
    expect(store.getState().features.idPay.code.code).toStrictEqual(
      pot.some(tCode)
    );

    store.dispatch(idPayResetCode());
    expect(store.getState().features.idPay.code.code).toStrictEqual(pot.none);
  });

  it("should handle idPayCodeCieBannerClose action", () => {
    const store = createStoreWith(INITIAL_STATE);

    store.dispatch(idPayCodeCieBannerClose({ initiativeId: tInitiativeId }));
    expect(
      store.getState().features.idPay.code.isIdPayInitiativeBannerClosed
    ).toStrictEqual({ [tInitiativeId]: true });
  });
});

describe("IdPay Code selectors", () => {
  describe("isIdPayCodeOnboardedSelector", () => {
    it("should return false when pot.none", () => {
      const store = createStoreWith({ isOnboarded: pot.none });

      expect(isIdPayCodeOnboardedSelector(store.getState())).toEqual(false);
    });

    it("should return false when pot.noneLoading", () => {
      const store = createStoreWith({ isOnboarded: pot.noneLoading });

      expect(isIdPayCodeOnboardedSelector(store.getState())).toEqual(false);
    });

    it("should return true when pot.some(true)", () => {
      const store = createStoreWith({ isOnboarded: pot.some(true) });

      expect(isIdPayCodeOnboardedSelector(store.getState())).toEqual(true);
    });
  });

  describe("isIdPayCodeFailureSelector", () => {
    it("should return true when pot.error", () => {
      const tError = getGenericError(new Error(""));

      const store = createStoreWith({
        code: pot.noneError(tError)
      });

      expect(isIdPayCodeFailureSelector(store.getState())).toStrictEqual(true);
    });
  });

  describe("isIdPayCodeLoadingSelector", () => {
    it("should return true when pot.loading", () => {
      const store = createStoreWith({
        code: pot.noneLoading
      });

      expect(isIdPayCodeLoadingSelector(store.getState())).toStrictEqual(true);
    });
  });

  describe("idPayCodeSelector", () => {
    it("should return the code when pot.some", () => {
      const tCode = "12345";

      const store = createStoreWith({
        code: pot.some(tCode)
      });

      expect(idPayCodeSelector(store.getState())).toStrictEqual(tCode);
    });

    it("should return empty string when not pot.some", () => {
      const store = createStoreWith({
        code: pot.none
      });

      expect(idPayCodeSelector(store.getState())).toStrictEqual("");
    });
  });

  describe("isIdPayCodeEnrollmentRequestLoadingSelector", () => {
    it("should return true when pot.loading", () => {
      const store = createStoreWith({
        enrollmentRequest: pot.noneLoading
      });

      expect(
        isIdPayCodeEnrollmentRequestLoadingSelector(store.getState())
      ).toStrictEqual(true);
    });

    it("should return false when pot.some or pot.none", () => {
      expect(
        isIdPayCodeEnrollmentRequestLoadingSelector(
          createStoreWith({
            enrollmentRequest: pot.none
          }).getState()
        )
      ).toStrictEqual(false);

      expect(
        isIdPayCodeEnrollmentRequestLoadingSelector(
          createStoreWith({
            enrollmentRequest: pot.some(undefined)
          }).getState()
        )
      ).toStrictEqual(false);
    });
  });

  describe("isIdPayCodeEnrollmentRequestFailureSelector", () => {
    it("should return true when pot.error", () => {
      const tError = getGenericError(new Error(""));

      const store = createStoreWith({
        enrollmentRequest: pot.noneError(tError)
      });

      expect(
        isIdPayCodeEnrollmentRequestFailureSelector(store.getState())
      ).toStrictEqual(true);
    });

    it("should return false when not pot.error", () => {
      expect(
        isIdPayCodeEnrollmentRequestFailureSelector(
          createStoreWith({
            enrollmentRequest: pot.none
          }).getState()
        )
      ).toStrictEqual(false);

      expect(
        isIdPayCodeEnrollmentRequestLoadingSelector(
          createStoreWith({
            enrollmentRequest: pot.some(undefined)
          }).getState()
        )
      ).toStrictEqual(false);
    });
  });

  describe("showIdPayCodeBannerSelector", () => {
    it("should return true if there is not a code instrument and the banner was not closed", () => {
      const store = createStoreWith(
        {
          isIdPayInitiativeBannerClosed: {}
        },
        []
      );

      expect(showIdPayCodeBannerSelector(store.getState())).toStrictEqual(true);
    });

    it("should return false if there is a code instrument and the banner was not closed", () => {
      const store = createStoreWith(
        {
          isIdPayInitiativeBannerClosed: {}
        },
        [CODE_INSTRUMENT]
      );

      expect(showIdPayCodeBannerSelector(store.getState())).toStrictEqual(
        false
      );
    });

    it("should return false if there is not a code instrument and the banner was closed", () => {
      const store = createStoreWith(
        {
          isIdPayInitiativeBannerClosed: { [tInitiativeId]: true }
        },
        [CODE_INSTRUMENT]
      );

      expect(showIdPayCodeBannerSelector(store.getState())).toStrictEqual(
        false
      );
    });
  });
});

const INITIAL_STATE: IdPayCodeState = {
  code: pot.none,
  enrollmentRequest: pot.none,
  isOnboarded: pot.none,
  isIdPayInitiativeBannerClosed: {}
};

const CODE_INSTRUMENT: InstrumentDTO = {
  instrumentId: "123",
  instrumentType: InstrumentTypeEnum.IDPAYCODE
};

const createStoreWith = (
  partialCodeState: Partial<IdPayCodeState>,
  instrumentList: Array<InstrumentDTO> = []
): Store<GlobalState> => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const finalState = {
    ...globalState,
    features: {
      ...globalState.features,
      idPay: {
        ...globalState.features.idPay,
        initiative: {
          ...globalState.features.idPay.initiative,
          details: pot.some({
            initiativeId: tInitiativeId,
            voucherEndDate: new Date(),
            nInstr: 0,
            status: StatusEnum.REFUNDABLE
          } as InitiativeDTO)
        },
        configuration: {
          ...globalState.features.idPay.configuration,
          instruments: pot.some({ instrumentList })
        },
        code: {
          ...globalState.features.idPay.code,
          ...partialCodeState
        }
      }
    }
  } as GlobalState;
  return createStore(appReducer, finalState as any);
};
