import { render } from "@testing-library/react-native";
import { format } from "date-fns";
import * as React from "react";
import I18n from "../../../../../i18n";
import { CgnCard } from "../CgnCard";

describe("CgnCard", () => {
  it("should match the snapshot", () => {
    const component = render(
      <CgnCard expireDate={new Date(2023, 11, 2)} withEycaLogo={true} />
    );
    expect(component).toMatchSnapshot();
  });
  it("should correctly render a valid card with EYCA logo", () => {
    const expireDate = new Date(2023, 11, 2);
    const { queryByTestId, queryByText } = render(
      <CgnCard expireDate={expireDate} withEycaLogo={true} />
    );
    expect(queryByTestId("cgnLogoTestID")).not.toBeNull();
    expect(queryByTestId("cgnExpiredTagTestID")).toBeNull();
    expect(queryByTestId("cgnEycaLogoTestID")).not.toBeNull();
    expect(queryByText(I18n.t("bonus.cgn.name"))).not.toBeNull();
    expect(queryByText(I18n.t("bonus.cgn.departmentName"))).not.toBeNull();
    expect(
      queryByText(
        I18n.t("bonusCard.validUntil", {
          endDate: format(expireDate, "MM/YY")
        })
      )
    ).not.toBeNull();
  });
  it("should correctly render a valid card without EYCA logo", () => {
    const expireDate = new Date(2023, 11, 2);
    const { queryByTestId, queryByText } = render(
      <CgnCard expireDate={expireDate} />
    );
    expect(queryByTestId("cgnLogoTestID")).not.toBeNull();
    expect(queryByTestId("cgnExpiredTagTestID")).toBeNull();
    expect(queryByTestId("cgnEycaLogoTestID")).toBeNull();
    expect(queryByText(I18n.t("bonus.cgn.name"))).not.toBeNull();
    expect(queryByText(I18n.t("bonus.cgn.departmentName"))).not.toBeNull();
    expect(
      queryByText(
        I18n.t("bonusCard.validUntil", {
          endDate: format(expireDate, "MM/YY")
        })
      )
    ).not.toBeNull();
  });
  it("should correctly render an expired card with EYCA logo", () => {
    const { queryByTestId, queryByText } = render(
      <CgnCard withEycaLogo={true} />
    );
    expect(queryByTestId("cgnLogoTestID")).toBeNull();
    expect(queryByTestId("cgnExpiredTagTestID")).not.toBeNull();
    expect(queryByTestId("cgnEycaLogoTestID")).not.toBeNull();
    expect(queryByText(I18n.t("bonus.cgn.name"))).not.toBeNull();
    expect(queryByText(I18n.t("bonus.cgn.departmentName"))).not.toBeNull();
  });
  it("should correctly render an expired card without EYCA logo", () => {
    const { queryByTestId, queryByText } = render(<CgnCard />);
    expect(queryByTestId("cgnLogoTestID")).toBeNull();
    expect(queryByTestId("cgnExpiredTagTestID")).not.toBeNull();
    expect(queryByTestId("cgnEycaLogoTestID")).toBeNull();
    expect(queryByText(I18n.t("bonus.cgn.name"))).not.toBeNull();
    expect(queryByText(I18n.t("bonus.cgn.departmentName"))).not.toBeNull();
  });
});
