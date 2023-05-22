import { render } from "@testing-library/react-native";
import * as React from "react";
import { StatusEnum } from "../../../../../../../definitions/idpay/InitiativeDTO";
import I18n from "../../../../../../i18n";
import { formatDateAsLocal } from "../../../../../../utils/dates";
import { InitiativeStatusLabel } from "../InitiativeStatusLabel";

type Props = {
  status: StatusEnum;
  endDate: Date;
};

describe("Test InitiativeStatusLabel component", () => {
  it("should render a InitiativeStatusLabel component with props correctly", () => {
    const props: Props = {
      status: StatusEnum.REFUNDABLE,
      endDate: new Date(2023, 1, 10)
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should render a InitiativeBonusCounter component with correct data", () => {
    const status = StatusEnum.REFUNDABLE;
    const endDate = new Date(2023, 1, 10);

    const props: Props = {
      status,
      endDate
    };

    const dateString = formatDateAsLocal(endDate, true);

    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.queryByText(
        I18n.t(`idpay.initiative.details.initiativeCard.statusLabels.${status}`)
      )
    ).toBeTruthy();
    expect(
      component.queryByText(
        I18n.t(`idpay.initiative.details.initiativeCard.validUntil`, {
          expiryDate: dateString
        })
      )
    ).toBeTruthy();
  });

  it("should render a InitiativeBonusCounter component without end date", () => {
    const status = StatusEnum.UNSUBSCRIBED;
    const endDate = new Date(2023, 1, 10);

    const props: Props = {
      status,
      endDate
    };

    const dateString = formatDateAsLocal(endDate, true);

    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.queryByText(
        I18n.t(`idpay.initiative.details.initiativeCard.statusLabels.${status}`)
      )
    ).toBeTruthy();
    expect(
      component.queryByText(
        I18n.t(`idpay.initiative.details.initiativeCard.validUntil`, {
          expiryDate: dateString
        })
      )
    ).not.toBeTruthy();
  });
});

const renderComponent = (props: Props) =>
  render(<InitiativeStatusLabel {...props} />);
