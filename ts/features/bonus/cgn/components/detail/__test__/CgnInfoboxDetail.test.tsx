import { render } from "@testing-library/react-native";
import * as React from "react";
import { CgnStatus } from "../../../../../../../definitions/cgn/CgnStatus";
import CgnInfoboxDetail from "../CgnInfoboxDetail";
import { StatusEnum as CgnActivatedStatusEnum } from "../../../../../../../definitions/cgn/CgnActivatedStatus";
import TypedI18n from "../../../../../../i18n";
import { localeDateFormat } from "../../../../../../utils/locale";
import {
  CgnRevokedStatus,
  StatusEnum as CgnRevokedStatusEnum
} from "../../../../../../../definitions/cgn/CgnRevokedStatus";
import { StatusEnum as CgnExpiredStatusEnum } from "../../../../../../../definitions/cgn/CgnExpiredStatus";
import { StatusEnum as CgnPendingStatusEnum } from "../../../../../../../definitions/cgn/CgnPendingStatus";

const cgnStatusActivated: CgnStatus = {
  status: CgnActivatedStatusEnum.ACTIVATED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20")
};

const cgnStatusRevoked: CgnStatus = {
  status: CgnRevokedStatusEnum.REVOKED,
  revocation_date: new Date("2030-02-20"),
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20"),
  revocation_reason: "A reason to revoke" as CgnRevokedStatus["revocation_reason"]
};

const cgnStatusExpired: CgnStatus = {
  status: CgnExpiredStatusEnum.EXPIRED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20")
};

const cgnStatusPending: CgnStatus = {
  status: CgnPendingStatusEnum.PENDING
};

describe("CgnInfoboxDetail", () => {
  it("Activated status", () => {
    const component = render(
      <CgnInfoboxDetail cgnDetail={cgnStatusActivated} />
    );
    const activatedLabel = TypedI18n.t("bonus.cgn.detail.information.active", {
      date: localeDateFormat(
        cgnStatusActivated.expiration_date,
        TypedI18n.t("global.dateFormats.shortFormat")
      )
    });
    expect(component).not.toBeNull();
    expect(component.queryByTestId("infobox-text")).toHaveTextContent(
      activatedLabel
    );
  });

  it("Revoked status", () => {
    const component = render(<CgnInfoboxDetail cgnDetail={cgnStatusRevoked} />);
    const revokedLabel = TypedI18n.t("bonus.cgn.detail.information.revoked", {
      reason: cgnStatusRevoked.revocation_reason
    });

    expect(component).not.toBeNull();
    expect(component.queryByTestId("infobox-text-warning")).toBeDefined();
    expect(component.queryByTestId("infobox-text")).toHaveTextContent(
      revokedLabel
    );
  });

  it("Expired status", () => {
    const component = render(<CgnInfoboxDetail cgnDetail={cgnStatusExpired} />);
    const expiredLabel = TypedI18n.t("bonus.cgn.detail.information.expired", {
      date: localeDateFormat(
        cgnStatusExpired.expiration_date,
        TypedI18n.t("global.dateFormats.shortFormat")
      )
    });

    expect(component).not.toBeNull();
    expect(component.queryByTestId("infobox-text-warning")).toBeDefined();
    expect(component.queryByTestId("infobox-text")).toHaveTextContent(
      expiredLabel
    );
  });

  it("Pending status", () => {
    const component = render(<CgnInfoboxDetail cgnDetail={cgnStatusPending} />);

    expect(component).not.toBeNull();
    expect(component.queryByTestId("infobox-text")).toBeNull();
  });
});
