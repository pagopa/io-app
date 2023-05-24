import { render } from "@testing-library/react-native";
import * as React from "react";
import {
  InitiativeRewardTypeEnum,
  StatusEnum
} from "../../../../../../../definitions/idpay/InitiativeDTO";
import TypedI18n from "../../../../../../i18n";
import {
  BeneficiaryDetailsContent,
  BeneficiaryDetailsProps
} from "../BeneficiaryDetailsContent";

const mockDiscountActiveInitiative: BeneficiaryDetailsProps = {
  initiativeDetails: {
    initiativeId: "a",
    status: StatusEnum.REFUNDABLE,
    nInstr: 0,
    endDate: new Date(),
    accrued: 0,
    amount: 0,
    refunded: 0,
    iban: "a",
    initiativeName: "test",
    initiativeRewardType: InitiativeRewardTypeEnum.DISCOUNT
  },
  beneficiaryDetails: {}
};

const mockRefundActiveInitiative: BeneficiaryDetailsProps = {
  initiativeDetails: {
    ...mockDiscountActiveInitiative.initiativeDetails,
    initiativeRewardType: InitiativeRewardTypeEnum.REFUND
  },
  beneficiaryDetails: {}
};

describe("Test BeneficiaryDetailsContent component", () => {
  it("should render a BeneficiaryDetailsContent component with props correctly", () => {
    const component = renderComponent({ ...mockDiscountActiveInitiative });
    expect(component).toBeTruthy();
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
