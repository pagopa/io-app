import { within } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { setLocale } from "../../../../../i18n";
import {
  IdPayBeneficiaryDetailsContent,
  BeneficiaryDetailsProps
} from "../IdPayBeneficiaryDetailsContent";
import { RewardValueTypeEnum } from "../../../../../../definitions/idpay/RewardValueDTO";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { IDPayDetailsRoutes } from "../../navigation";

setLocale("it");

const mockNavigation = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigation
    })
  };
});

const T_INITIATIVE_ID = "ABC123";
const T_END_DATE = new Date(2023, 0, 1, 10, 0);
const T_END_DATE_TEXT = "01/01/2023";
const T_AMOUNT = 7000;
const T_AMOUNT_TEXT = "70,00 €";
const T_ACCRUED = 2000;
const T_ACCRUED_TEXT = "20,00 €";
const T_REFUNDED = 1000;
const T_REFUNDED_TEXT = "10,00 €";
const T_IBAN = "IT60X0542811101000000123456";
const T_INITIATIVE_NAME = "Test name";
const T_FRUITION_START_DATE = new Date(2023, 4, 7);
const T_FRUITION_START_DATE_STRING = "07 mag 2023";
const T_FRUITION_END_DATE = new Date(2023, 7, 2);
const T_FRUITION_END_DATE_STRING = "02 ago 2023";
const T_REWARD_VALUE = 3000;
const T_REWARD_VALUE_PERCENTAGE = 30;
const T_REWARD_VALUE_PERCENTAGE_STRING = "30%";
const T_REWARD_VALUE_ABSOLUTE_STRING = "30,00 €";

describe("Test IdPayBeneficiaryDetailsContent component", () => {
  it("should correctly render all the info ", () => {
    const { component } = renderComponent(InitiativeRewardTypeEnum.REFUND);

    const statusRow = within(component.getByTestId("statusTestID"));
    expect(
      statusRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.status")
      )
    ).toBeTruthy();
    expect(
      statusRow.queryByText(
        I18n.t(
          `idpay.initiative.details.initiativeCard.statusLabels.REFUNDABLE`
        )
      )
    ).toBeTruthy();

    const endDateRow = within(component.getByTestId("endDateTestID"));
    expect(
      endDateRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.endDate")
      )
    ).toBeTruthy();
    expect(endDateRow.queryByText(T_END_DATE_TEXT)).toBeTruthy();

    const amountRow = within(component.getByTestId("amountTestID"));
    expect(
      amountRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.amount")
      )
    ).toBeTruthy();
    expect(amountRow.queryByText(T_AMOUNT_TEXT)).toBeTruthy();

    const accruedRow = within(component.getByTestId("accruedTestID"));
    expect(
      accruedRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.toBeRefunded")
      )
    ).toBeTruthy();
    expect(accruedRow.queryByText(T_ACCRUED_TEXT)).toBeTruthy();

    const refundedRow = within(component.getByTestId("refundedTestID"));
    expect(
      refundedRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.refunded")
      )
    ).toBeTruthy();
    expect(refundedRow.queryByText(T_REFUNDED_TEXT)).toBeTruthy();

    const fruitionStartDateRow = within(
      component.getByTestId("fruitionStartDateTestID")
    );
    expect(
      fruitionStartDateRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.spendFrom")
      )
    ).toBeTruthy();
    expect(
      fruitionStartDateRow.queryByText(T_FRUITION_START_DATE_STRING)
    ).toBeTruthy();

    const fruitionEndDateRow = within(
      component.getByTestId("fruitionEndDateTestID")
    );
    expect(
      fruitionEndDateRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.spendTo")
      )
    ).toBeTruthy();
    expect(
      fruitionEndDateRow.queryByText(T_FRUITION_END_DATE_STRING)
    ).toBeTruthy();

    const spendPercentageRow = within(
      component.getByTestId("spendPercentageTestID")
    );
    expect(
      spendPercentageRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.spendPercentage")
      )
    ).toBeTruthy();
    expect(
      spendPercentageRow.queryByText(T_REWARD_VALUE_PERCENTAGE_STRING)
    ).toBeTruthy();

    const onboardingDateRow = within(
      component.getByTestId("onboardingDateTestID")
    );
    expect(
      onboardingDateRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.enrollmentDate")
      )
    ).toBeTruthy();
  });

  it("should correctly render absolute reward type data", () => {
    const { component } = renderComponent(
      InitiativeRewardTypeEnum.REFUND,
      RewardValueTypeEnum.ABSOLUTE
    );

    const spendPercentageRow = within(
      component.getByTestId("spendValueTestID")
    );
    expect(
      spendPercentageRow.queryByText(
        I18n.t("idpay.initiative.beneficiaryDetails.spendValue")
      )
    ).toBeTruthy();
    expect(
      spendPercentageRow.queryByText(T_REWARD_VALUE_ABSOLUTE_STRING)
    ).toBeTruthy();
  });
  it("should correctly render type dependant entries in case of a discount initiative", () => {
    const { component } = renderComponent(InitiativeRewardTypeEnum.DISCOUNT);
    expect(component.queryByTestId("accruedTestID")).toBeTruthy();
    expect(component.queryByTestId("refundedTestID")).toBeFalsy();
  });
  it("should correctly render type dependant entries in case of a refund initiative", () => {
    const { component } = renderComponent(InitiativeRewardTypeEnum.REFUND);
    expect(component.queryByTestId("accruedTestID")).toBeTruthy();
    expect(component.queryByTestId("refundedTestID")).toBeTruthy();
  });
});

const renderComponent = (
  initiativeRewardType: InitiativeRewardTypeEnum = InitiativeRewardTypeEnum.REFUND,
  rewardValueType: RewardValueTypeEnum = RewardValueTypeEnum.PERCENTAGE
) => {
  const props: BeneficiaryDetailsProps = {
    initiativeDetails: {
      initiativeId: T_INITIATIVE_ID,
      status: InitiativeStatusEnum.REFUNDABLE,
      nInstr: 2,
      voucherEndDate: T_END_DATE,
      accruedCents: T_ACCRUED,
      amountCents: T_AMOUNT,
      refundedCents: T_REFUNDED,
      iban: T_IBAN,
      initiativeName: T_INITIATIVE_NAME,
      initiativeRewardType
    } as InitiativeDTO,
    beneficiaryDetails: {
      fruitionStartDate: T_FRUITION_START_DATE,
      fruitionEndDate: T_FRUITION_END_DATE,
      rewardRule: {
        rewardValueType,
        rewardValue:
          rewardValueType === RewardValueTypeEnum.PERCENTAGE
            ? T_REWARD_VALUE_PERCENTAGE
            : T_REWARD_VALUE
      }
    }
  };

  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  });

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <IdPayBeneficiaryDetailsContent {...props} />,
      IDPayDetailsRoutes.IDPAY_DETAILS_MAIN,
      {},
      store
    ),
    store
  };
};
