import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import {
  IbanOperationDTO,
  OperationTypeEnum as IbanOperationTypeEnum
} from "../../../../../../definitions/idpay/IbanOperationDTO";
import {
  OnboardingOperationDTO,
  OperationTypeEnum as OnboardingOperationTypeEnum
} from "../../../../../../definitions/idpay/OnboardingOperationDTO";
import {
  RefundOperationDTO,
  OperationTypeEnum as RefundOperationTypeEnum
} from "../../../../../../definitions/idpay/RefundOperationDTO";
import { setLocale } from "../../../../../i18n";
import {
  IdPayTimelineOperationListItem,
  getOperationSubtitle,
  getOperationSubtitleWithAmount
} from "../IdPayTimelineOperationListItem";
import {
  InstrumentOperationDTO,
  OperationTypeEnum as InstrumentOperationTypeEnum,
  InstrumentTypeEnum
} from "../../../../../../definitions/idpay/InstrumentOperationDTO";
import {
  RejectedInstrumentOperationDTO,
  OperationTypeEnum as RejectedInstrumentOperationTypeEnum
} from "../../../../../../definitions/idpay/RejectedInstrumentOperationDTO";
import {
  ChannelEnum,
  TransactionOperationDTO
} from "../../../../../../definitions/idpay/TransactionOperationDTO";
import {
  StatusEnum,
  OperationTypeEnum as TransactionOperationTypeEnum
} from "../../../../../../definitions/idpay/TransactionDetailDTO";

setLocale("it");

describe("Test IdPayTimelineOperationListItem", () => {
  describe("when operation DTO is OnboardingOperationDTO", () => {
    it("should render the component correctly", () => {
      const T_DATE = new Date(2023, 4, 5, 16, 31);
      const T_SUBTITLE = getOperationSubtitle(T_DATE);
      const T_TITLE = I18n.t(
        `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.ONBOARDING`
      );

      const T_OPERATION: OnboardingOperationDTO = {
        operationDate: T_DATE,
        operationId: "ABC",
        operationType: OnboardingOperationTypeEnum.ONBOARDING
      };

      const component = render(
        <IdPayTimelineOperationListItem operation={T_OPERATION} />
      );

      expect(component).toBeTruthy();
      expect(component.queryByTestId("onboardingLogoTestID")).toBeTruthy();
      expect(component.queryByText(T_TITLE)).toBeTruthy();
      expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
    });
  });

  describe("when operation DTO is IbanOperationDTO", () => {
    it("should render the component correctly", () => {
      const T_DATE = new Date(2023, 4, 5, 16, 31);
      const T_SUBTITLE = getOperationSubtitle(T_DATE);
      const T_TITLE = I18n.t(
        `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.ADD_IBAN`
      );

      const T_OPERATION: IbanOperationDTO = {
        operationDate: T_DATE,
        operationId: "ABC",
        operationType: IbanOperationTypeEnum.ADD_IBAN,
        channel: ChannelEnum.QRCODE,
        iban: "IT60X0542811101000000123456"
      };

      const component = render(
        <IdPayTimelineOperationListItem operation={T_OPERATION} />
      );

      expect(component).toBeTruthy();
      expect(component.queryByTestId("ibanLogoTestID")).toBeTruthy();
      expect(component.queryByText(T_TITLE)).toBeTruthy();
      expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
    });
  });

  describe("when operation DTO is RefundOperationDTO", () => {
    describe("when operation type is PAID_REFUND", () => {
      it("should render the component correctly", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_SUBTITLE = getOperationSubtitle(T_DATE);
        const T_AMOUNT = 457874;
        const T_AMOUNT_STRING = "4.578,74 €";

        const mockOnPress = jest.fn();

        const T_OPERATION = {
          operationDate: T_DATE,
          operationId: "",
          operationType: RefundOperationTypeEnum.PAID_REFUND,
          amountCents: T_AMOUNT,
          eventId: ""
        } as RefundOperationDTO;

        const component = render(
          <IdPayTimelineOperationListItem
            operation={T_OPERATION}
            onPress={mockOnPress}
            pressable
            testID="itemTestID"
          />
        );
        expect(component).toBeTruthy();

        expect(component.queryByTestId("refundLogoTestID")).toBeTruthy();

        expect(
          component.queryByText(
            I18n.t(
              `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.REFUND`
            )
          )
        ).toBeTruthy();

        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
        expect(component.queryByText(T_AMOUNT_STRING)).toBeTruthy();

        const container = component.getByTestId("itemTestID");
        fireEvent(container, "onPress");
        expect(mockOnPress).toHaveBeenCalledTimes(1);
      });
    });
    describe("when operation type is REJECTED_REFUND", () => {
      it("should render the component correctly", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_SUBTITLE = getOperationSubtitle(T_DATE);
        const T_AMOUNT = 457874;
        const T_AMOUNT_STRING = "4.578,74 €";

        const mockOnPress = jest.fn();

        const T_OPERATION = {
          operationDate: T_DATE,
          operationId: "",
          operationType: RefundOperationTypeEnum.REJECTED_REFUND,
          amountCents: T_AMOUNT,
          eventId: ""
        } as RefundOperationDTO;

        const component = render(
          <IdPayTimelineOperationListItem
            operation={T_OPERATION}
            onPress={mockOnPress}
            pressable
            testID="itemTestID"
          />
        );
        expect(component).toBeTruthy();

        expect(component.queryByTestId("refundLogoTestID")).toBeTruthy();

        expect(
          component.queryByText(
            I18n.t(
              `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.REFUND`
            )
          )
        ).toBeTruthy();

        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
        expect(
          component.queryByText(I18n.t("global.badges.failed"))
        ).toBeTruthy();
        expect(component.queryByText(T_AMOUNT_STRING)).toBeFalsy();

        const container = component.getByTestId("itemTestID");
        fireEvent(container, "onPress");
        expect(mockOnPress).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("when operation DTO is InstrumentOperationDTO", () => {
    describe.each([
      InstrumentOperationTypeEnum.ADD_INSTRUMENT,
      InstrumentOperationTypeEnum.DELETE_INSTRUMENT
    ])("when operation type is %s", operationType => {
      it("should render the component correctly with brand logo and masked pan", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_SUBTITLE = getOperationSubtitle(T_DATE);

        const T_MASKED_PAN = "1234";
        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operationType}`,
          {
            maskedPan: `···· ${T_MASKED_PAN}`
          }
        );

        const T_OPERATION = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType,
          channel: ChannelEnum.QRCODE,
          instrumentType: InstrumentTypeEnum.CARD,
          brand: "VISA",
          maskedPan: T_MASKED_PAN
        } as InstrumentOperationDTO;

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );

        expect(component).toBeTruthy();
        expect(component.queryByTestId("creditCardLogoTestID")).toBeFalsy();
        expect(component.queryByTestId("fiscalCodeLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
      });

      it("should render the component correctly without brand logo", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_SUBTITLE = getOperationSubtitle(T_DATE);

        const T_MASKED_PAN = "1234";
        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operationType}`,
          {
            maskedPan: `···· ${T_MASKED_PAN}`
          }
        );

        const T_OPERATION: InstrumentOperationDTO = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType,
          channel: ChannelEnum.QRCODE,
          instrumentType: InstrumentTypeEnum.CARD,
          maskedPan: T_MASKED_PAN
        };

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );

        expect(component).toBeTruthy();
        expect(component.queryByTestId("creditCardLogoTestID")).toBeTruthy();
        expect(component.queryByTestId("fiscalCodeLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
      });

      it("should render the component correctly without masked pan", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_SUBTITLE = getOperationSubtitle(T_DATE);

        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operationType}`,
          {
            maskedPan: ""
          }
        );

        const T_OPERATION: InstrumentOperationDTO = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType,
          channel: ChannelEnum.QRCODE,
          instrumentType: InstrumentTypeEnum.CARD,
          brand: "VISA"
        };

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );

        expect(component).toBeTruthy();
        expect(component.queryByTestId("creditCardLogoTestID")).toBeFalsy();
        expect(component.queryByTestId("fiscalCodeLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
      });

      it("should render the component correctly for CIE instrument", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_SUBTITLE = getOperationSubtitle(T_DATE);

        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.CIE`
        );

        const T_OPERATION: InstrumentOperationDTO = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType: InstrumentOperationTypeEnum.ADD_INSTRUMENT,
          channel: ChannelEnum.QRCODE,
          instrumentType: InstrumentTypeEnum.IDPAYCODE
        };

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );

        expect(component).toBeTruthy();
        expect(component.queryByTestId("creditCardLogoTestID")).toBeFalsy();
        expect(component.queryByTestId("fiscalCodeLogoTestID")).toBeTruthy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
      });
    });
  });

  describe("when operation DTO is RejectedInstrumentOperationDTO", () => {
    describe.each([
      RejectedInstrumentOperationTypeEnum.REJECTED_ADD_INSTRUMENT,
      RejectedInstrumentOperationTypeEnum.REJECTED_DELETE_INSTRUMENT
    ])("when operation type is %s", operationType => {
      it("should render the component correctly with brand logo and masked pan", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_SUBTITLE = getOperationSubtitle(T_DATE);

        const T_MASKED_PAN = "1234";
        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operationType}`,
          {
            maskedPan: `···· ${T_MASKED_PAN}`
          }
        );

        const T_OPERATION: RejectedInstrumentOperationDTO = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType,
          channel: ChannelEnum.QRCODE,
          instrumentType: InstrumentTypeEnum.CARD,
          brand: "VISA",
          maskedPan: T_MASKED_PAN
        };

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );

        expect(component).toBeTruthy();
        expect(component.queryByTestId("creditCardLogoTestID")).toBeFalsy();
        expect(component.queryByTestId("fiscalCodeLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
      });

      it("should render the component correctly without brand logo", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_SUBTITLE = getOperationSubtitle(T_DATE);

        const T_MASKED_PAN = "1234";
        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operationType}`,
          {
            maskedPan: `···· ${T_MASKED_PAN}`
          }
        );

        const T_OPERATION: RejectedInstrumentOperationDTO = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType,
          channel: ChannelEnum.QRCODE,
          instrumentType: InstrumentTypeEnum.CARD,
          maskedPan: T_MASKED_PAN
        };

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );

        expect(component).toBeTruthy();
        expect(component.queryByTestId("creditCardLogoTestID")).toBeTruthy();
        expect(component.queryByTestId("fiscalCodeLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
      });

      it("should render the component correctly without masked pan", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_SUBTITLE = getOperationSubtitle(T_DATE);

        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.${operationType}`,
          {
            maskedPan: ""
          }
        );

        const T_OPERATION: RejectedInstrumentOperationDTO = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType,
          channel: ChannelEnum.QRCODE,
          instrumentType: InstrumentTypeEnum.CARD,
          brand: "VISA"
        };

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );

        expect(component).toBeTruthy();
        expect(component.queryByTestId("creditCardLogoTestID")).toBeFalsy();
        expect(component.queryByTestId("fiscalCodeLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
      });
    });
  });

  describe("when operation DTO is TransactionOperationDTO", () => {
    describe("when operation type is TRANSACTION", () => {
      it("should render the component correctly", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_AMOUNT = 3456.1;
        const T_ACCRUED = 23456;
        const T_ACCRUED_STRING = "−234,56 €";
        const T_SUBTITLE = getOperationSubtitleWithAmount(T_DATE, T_AMOUNT);

        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.TRANSACTION`
        );

        const T_OPERATION = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType: TransactionOperationTypeEnum.TRANSACTION,
          accruedCents: T_ACCRUED,
          status: StatusEnum.AUTHORIZED,
          amountCents: T_AMOUNT,
          brand: "VISA"
        } as TransactionOperationDTO;

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );
        expect(component).toBeTruthy();
        expect(component.queryByTestId("genericLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
        expect(component.queryByText(T_ACCRUED_STRING)).toBeTruthy();
      });
      it("should render the component correctly with business name", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_AMOUNT = 3456.1;
        const T_ACCRUED = 23456;
        const T_ACCRUED_STRING = "−234,56 €";
        const T_SUBTITLE = getOperationSubtitleWithAmount(T_DATE, T_AMOUNT);
        const T_BUSINESS_NAME = "Business name";

        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.TRANSACTION`
        );

        const T_OPERATION = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType: TransactionOperationTypeEnum.TRANSACTION,
          accruedCents: T_ACCRUED,
          status: StatusEnum.AUTHORIZED,
          amountCents: T_AMOUNT,
          brand: "VISA",
          businessName: T_BUSINESS_NAME
        } as TransactionOperationDTO;

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );
        expect(component).toBeTruthy();
        expect(component.queryByTestId("genericLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeFalsy();
        expect(component.queryByText(T_BUSINESS_NAME)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
        expect(component.queryByText(T_ACCRUED_STRING)).toBeTruthy();
      });
      it("should render the component correctly if transaction is cancelled", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_AMOUNT = 3456.1;
        const T_ACCRUED = 23456;
        const T_ACCRUED_STRING = "−234,56 €";
        const T_SUBTITLE = getOperationSubtitleWithAmount(
          T_DATE,
          T_AMOUNT,
          false
        );

        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.TRANSACTION`
        );

        const T_OPERATION = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType: TransactionOperationTypeEnum.TRANSACTION,
          accruedCents: T_ACCRUED,
          status: StatusEnum.CANCELLED,
          amountCents: T_AMOUNT
        } as TransactionOperationDTO;

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );
        expect(component).toBeTruthy();
        expect(component.queryByTestId("genericLogoTestID")).toBeTruthy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
        expect(component.queryByText(T_ACCRUED_STRING)).toBeFalsy();
        expect(
          component.queryByText(I18n.t("global.badges.cancelled"))
        ).toBeTruthy();
      });
    });
    describe("when operation type is REVERSAL", () => {
      it("should render the component correctly", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_AMOUNT = 3456.1;
        const T_ACCRUED = 23456;
        const T_ACCRUED_STRING = "−234,56 €";
        const T_SUBTITLE = getOperationSubtitleWithAmount(
          T_DATE,
          T_AMOUNT,
          true
        );

        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.TRANSACTION`
        );

        const T_OPERATION = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType: TransactionOperationTypeEnum.REVERSAL,
          accruedCents: T_ACCRUED,
          status: StatusEnum.AUTHORIZED,
          amountCents: T_AMOUNT,
          brand: "VISA"
        } as TransactionOperationDTO;

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );
        expect(component).toBeTruthy();
        expect(component.queryByTestId("genericLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
        expect(component.queryByText(T_ACCRUED_STRING)).toBeFalsy();
        expect(
          component.queryByText(I18n.t("global.badges.reversal"))
        ).toBeTruthy();
      });
      it("should render the component correctly with business name", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_AMOUNT = 3456.1;
        const T_ACCRUED = 23456;
        const T_ACCRUED_STRING = "−234,56 €";
        const T_SUBTITLE = getOperationSubtitleWithAmount(
          T_DATE,
          T_AMOUNT,
          true
        );
        const T_BUSINESS_NAME = "Business name";

        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.TRANSACTION`
        );

        const T_OPERATION = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType: TransactionOperationTypeEnum.REVERSAL,
          accruedCents: T_ACCRUED,
          status: StatusEnum.AUTHORIZED,
          amountCents: T_AMOUNT,
          brand: "VISA",
          businessName: T_BUSINESS_NAME
        } as TransactionOperationDTO;

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );
        expect(component).toBeTruthy();
        expect(component.queryByTestId("genericLogoTestID")).toBeFalsy();
        expect(component.queryByText(T_TITLE)).toBeFalsy();
        expect(component.queryByText(T_BUSINESS_NAME)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
        expect(component.queryByText(T_ACCRUED_STRING)).toBeFalsy();
        expect(
          component.queryByText(I18n.t("global.badges.reversal"))
        ).toBeTruthy();
      });
      it("should render the component correctly if transaction is cancelled", () => {
        const T_DATE = new Date(2023, 4, 5, 16, 31);
        const T_AMOUNT = 3456.1;
        const T_ACCRUED = 23456;
        const T_ACCRUED_STRING = "−234,56 €";
        const T_SUBTITLE = getOperationSubtitleWithAmount(
          T_DATE,
          T_AMOUNT,
          true
        );

        const T_TITLE = I18n.t(
          `idpay.initiative.details.initiativeDetailsScreen.configured.operationsList.operationDescriptions.TRANSACTION`
        );

        const T_OPERATION = {
          operationDate: T_DATE,
          operationId: "ABC",
          operationType: TransactionOperationTypeEnum.REVERSAL,
          accruedCents: T_ACCRUED,
          status: StatusEnum.CANCELLED,
          amountCents: T_AMOUNT
        } as TransactionOperationDTO;

        const component = render(
          <IdPayTimelineOperationListItem operation={T_OPERATION} />
        );
        expect(component).toBeTruthy();
        expect(component.queryByTestId("genericLogoTestID")).toBeTruthy();
        expect(component.queryByText(T_TITLE)).toBeTruthy();
        expect(component.queryByText(T_SUBTITLE)).toBeTruthy();
        expect(component.queryByText(T_ACCRUED_STRING)).toBeFalsy();
        expect(
          component.queryByText(I18n.t("global.badges.reversal"))
        ).toBeTruthy();
      });
    });
  });
});

describe("Test getOperationSubtitle", () => {
  it("should return the correct date string", () => {
    const T_DATE = new Date(2023, 4, 5, 16, 31);
    const T_RESULT = "05 mag 2023, 16:31";

    const result = getOperationSubtitle(T_DATE);

    expect(result).toStrictEqual(T_RESULT);
  });
});

describe("Test getOperationSubtitleWithAmount", () => {
  it("should return the correct date string with positive number", () => {
    const T_DATE = new Date(2023, 4, 5, 16, 31);
    const T_AMOUNT = 413567;
    const T_RESULT = "05 mag 2023, 16:31 · 4.135,67 €";

    const result = getOperationSubtitleWithAmount(T_DATE, T_AMOUNT);

    expect(result).toStrictEqual(T_RESULT);
  });

  it("should return the correct date string with negative number", () => {
    const T_DATE = new Date(2023, 4, 5, 16, 31);
    const T_AMOUNT = 413567;
    const T_RESULT = "05 mag 2023, 16:31 · −4.135,67 €";

    const result = getOperationSubtitleWithAmount(T_DATE, T_AMOUNT, true);

    expect(result).toStrictEqual(T_RESULT);
  });
});
