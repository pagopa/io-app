import { render } from "@testing-library/react-native";
import * as React from "react";
import { Card } from "../../../../../../../definitions/cgn/Card";
import { StatusEnum as CgnActivatedStatusEnum } from "../../../../../../../definitions/cgn/CardActivated";
import I18n from "../../../../../../i18n";
import { localeDateFormat } from "../../../../../../utils/locale";
import {
  CardRevoked,
  StatusEnum as CgnRevokedStatusEnum
} from "../../../../../../../definitions/cgn/CardRevoked";
import { StatusEnum as CgnExpiredStatusEnum } from "../../../../../../../definitions/cgn/CardExpired";
import { StatusEnum as CgnPendingStatusEnum } from "../../../../../../../definitions/cgn/CardPending";
import CgnStatusDetail from "../CgnStatusDetail";

const cgnStatusActivated: Card = {
  status: CgnActivatedStatusEnum.ACTIVATED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20")
};

const cgnStatusRevoked: Card = {
  status: CgnRevokedStatusEnum.REVOKED,
  revocation_date: new Date("2030-02-20"),
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20"),
  revocation_reason: "A reason to revoke" as CardRevoked["revocation_reason"]
};

const cgnStatusExpired: Card = {
  status: CgnExpiredStatusEnum.EXPIRED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20")
};

const cgnStatusPending: Card = {
  status: CgnPendingStatusEnum.PENDING
};

describe("CgnStatusDetail", () => {
  it("Activated status", () => {
    const component = render(
      <CgnStatusDetail cgnDetail={cgnStatusActivated} />
    );
    expect(component).not.toBeNull();
    expect(component.queryByTestId("status-badge")).toHaveTextContent(
      I18n.t("bonus.cgn.detail.status.badge.active")
    );
    expect(
      component.queryByText(I18n.t("bonus.cgn.detail.status.date.activated"))
    ).not.toBeNull();
    expect(
      component.queryByText(
        localeDateFormat(
          cgnStatusActivated.activation_date,
          I18n.t("global.dateFormats.shortFormat")
        )
      )
    ).not.toBeNull();
    expect(
      component.queryByText(I18n.t("bonus.cgn.detail.status.expiration.cgn"))
    ).not.toBeNull();
    expect(
      component.queryByText(
        localeDateFormat(
          cgnStatusActivated.expiration_date,
          I18n.t("global.dateFormats.shortFormat")
        )
      )
    ).not.toBeNull();
    expect(
      component.queryByText(I18n.t("bonus.cgn.detail.status.date.revoked"))
    ).toBeNull();
  });

  it("Revoked status", () => {
    const component = render(<CgnStatusDetail cgnDetail={cgnStatusRevoked} />);
    expect(component).not.toBeNull();
    expect(component.queryByTestId("status-badge")).toHaveTextContent(
      I18n.t("bonus.cgn.detail.status.badge.revoked")
    );
    expect(
      component.queryByText(I18n.t("bonus.cgn.detail.status.date.activated"))
    ).not.toBeNull();
    expect(
      component.queryByText(
        localeDateFormat(
          cgnStatusRevoked.activation_date,
          I18n.t("global.dateFormats.shortFormat")
        )
      )
    ).not.toBeNull();
    expect(
      component.queryByText(I18n.t("bonus.cgn.detail.status.expiration.cgn"))
    ).toBeNull();
    expect(
      component.queryByText(
        localeDateFormat(
          cgnStatusRevoked.expiration_date,
          I18n.t("global.dateFormats.shortFormat")
        )
      )
    ).toBeNull();
    expect(
      component.queryByText(I18n.t("bonus.cgn.detail.status.date.revoked"))
    ).not.toBeNull();
    expect(
      component.queryByText(
        localeDateFormat(
          cgnStatusRevoked.revocation_date,
          I18n.t("global.dateFormats.shortFormat")
        )
      )
    ).not.toBeNull();
  });

  it("Expired status", () => {
    const component = render(<CgnStatusDetail cgnDetail={cgnStatusExpired} />);
    expect(component).not.toBeNull();
    expect(component.queryByTestId("status-badge")).toHaveTextContent(
      I18n.t("bonus.cgn.detail.status.badge.expired")
    );
    expect(
      component.queryByText(I18n.t("bonus.cgn.detail.status.date.activated"))
    ).not.toBeNull();
    expect(
      component.queryByText(
        localeDateFormat(
          cgnStatusExpired.activation_date,
          I18n.t("global.dateFormats.shortFormat")
        )
      )
    ).not.toBeNull();
    expect(
      component.queryByText(I18n.t("bonus.cgn.detail.status.date.revoked"))
    ).toBeNull();
    expect(
      component.queryByText(I18n.t("bonus.cgn.detail.status.date.expired"))
    ).not.toBeNull();
    expect(
      component.queryByText(
        localeDateFormat(
          cgnStatusExpired.expiration_date,
          I18n.t("global.dateFormats.shortFormat")
        )
      )
    ).not.toBeNull();
  });

  it("Pending status", () => {
    const component = render(<CgnStatusDetail cgnDetail={cgnStatusPending} />);
    expect(component).not.toBeNull();
    expect(component.queryByTestId("status-badge")).toBeNull();

    expect(component.queryByTestId("activation-date-label")).toBeNull();
    expect(component.queryByTestId("activation-date-value")).toBeNull();
    expect(component.queryByTestId("expiration-date-label")).toBeNull();
    expect(component.queryByTestId("expiration-date-value")).toBeNull();
    expect(component.queryByTestId("revocation-date-label")).toBeNull();
    expect(component.queryByTestId("revocation-date-value")).toBeNull();
  });
});
