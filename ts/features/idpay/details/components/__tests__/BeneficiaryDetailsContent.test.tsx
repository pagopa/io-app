import { render } from "@testing-library/react-native";
import * as React from "react";
import {
  InitiativeRewardTypeEnum,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import TypedI18n from "../../../../../i18n";
import {
  BeneficiaryDetailsContent,
  BeneficiaryDetailsProps
} from "../BeneficiaryDetailsContent";
import { StatusEnum as OnboardingStatusEnum } from "../../../../../../definitions/idpay/OnboardingStatusDTO";

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

jest.mock("../../../../../store/hooks", () => {
  const actualUseIOSelector = jest.requireActual("../../../../../store/hooks");
  return {
    ...actualUseIOSelector,
    useIOSelector: () => undefined
  };
});

const mockDiscountActiveInitiative: BeneficiaryDetailsProps = {
  initiativeDetails: {
    initiativeId: "a",
    status: InitiativeStatusEnum.REFUNDABLE,
    nInstr: 0,
    endDate: new Date(2023, 1, 1),
    accrued: 0,
    amount: 0,
    refunded: 0,
    iban: "a",
    initiativeName: "test",
    initiativeRewardType: InitiativeRewardTypeEnum.DISCOUNT
  },
  beneficiaryDetails: {},
  onboardingStatus: {
    status: OnboardingStatusEnum.ONBOARDING_OK,
    statusDate: new Date(2023, 1, 1),
    onboardingOkDate: new Date(2023, 1, 1)
  }
};

const mockRefundActiveInitiative: BeneficiaryDetailsProps = {
  initiativeDetails: {
    ...mockDiscountActiveInitiative.initiativeDetails,
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND
  },
  beneficiaryDetails: {},
  onboardingStatus: {
    status: OnboardingStatusEnum.ONBOARDING_OK,
    statusDate: new Date(2023, 1, 1),
    onboardingOkDate: new Date(2023, 1, 1)
  }
};

describe("Test BeneficiaryDetailsContent component", () => {
  it("should render a BeneficiaryDetailsContent component with props correctly", () => {
    const component = renderComponent({ ...mockDiscountActiveInitiative });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
  it("should correctly render type dependant entries in case of a discount initiative", () => {
    const component = renderComponent({ ...mockDiscountActiveInitiative });
    expect(
      component.queryByText(
        TypedI18n.t("idpay.initiative.beneficiaryDetails.spentUntilNow")
      )
    ).toBeTruthy();
  });
  it("should correctly render type dependant entries in case of a refund initiative", () => {
    const component = renderComponent({ ...mockRefundActiveInitiative });
    expect(
      component.queryByText(
        TypedI18n.t("idpay.initiative.beneficiaryDetails.toBeRefunded")
      )
    ).toBeTruthy();
    expect(
      component.queryByText(
        TypedI18n.t("idpay.initiative.beneficiaryDetails.refunded")
      )
    ).toBeTruthy();
  });
});

const renderComponent = (props: BeneficiaryDetailsProps) =>
  render(<BeneficiaryDetailsContent {...props} />);
