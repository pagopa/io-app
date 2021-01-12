import { render } from "@testing-library/react-native";
import * as React from "react";
import RankPositionItem from "../RankPositionItem";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import I18n from "../../../../../../i18n";
import { formatNumberWithNoDigits } from "../../../../../../utils/stringBuilder";

describe("RankingPositionItem", () => {
  it("Expect an item representing user position with Super Cashback amount badge", () => {
    const userLabel = I18n.t("global.you");
    const rankingLabel = `${formatNumberWithNoDigits(5000)}º: Maria`;

    const component = render(
      <RankPositionItem
        superCashbackAmount={1500}
        transactionsNumber={500}
        hideBadge={false}
        currentUserPosition={true}
        boxedLabel={userLabel}
        rankingLabel={rankingLabel}
      />
    );

    expect(component).not.toBeNull();
    expect(component.queryByTestId("PositionBoxContainer")).toHaveStyle({
      backgroundColor: IOColors.blue
    });
    expect(component.queryByTestId("PositionBoxedLabel")).toHaveTextContent(
      userLabel
    );
    expect(component.queryByTestId("RankingLabel")).toHaveTextContent(
      rankingLabel
    );
    expect(component.queryByTestId("SuperCashbackAmountBadge")).toBeDefined();
  });

  it("Expect an item representing user position without Super Cashback amount badge", () => {
    const userLabel = I18n.t("global.you");
    const rankingLabel = `${formatNumberWithNoDigits(5000)}º: Maria`;

    const component = render(
      <RankPositionItem
        superCashbackAmount={1500}
        transactionsNumber={500}
        hideBadge={true}
        currentUserPosition={true}
        boxedLabel={userLabel}
        rankingLabel={rankingLabel}
      />
    );

    expect(component).not.toBeNull();
    expect(component.queryByTestId("PositionBoxContainer")).toHaveStyle({
      backgroundColor: IOColors.blue
    });
    expect(component.queryByTestId("PositionBoxedLabel")).toHaveTextContent(
      userLabel
    );
    expect(component.queryByTestId("RankingLabel")).toHaveTextContent(
      rankingLabel
    );
    expect(component.queryByTestId("SuperCashbackAmountBadge")).toBeNull();
  });

  it("Expect an item representing generic position", () => {
    const boxedLabel = "100K";

    const rankingLabel = I18n.t("bonus.bpd.details.superCashback.rankLabel", {
      position: formatNumberWithNoDigits(1000)
    });

    const component = render(
      <RankPositionItem
        superCashbackAmount={1500}
        transactionsNumber={500}
        hideBadge={true}
        boxedLabel={boxedLabel}
        rankingLabel={rankingLabel}
      />
    );

    expect(component.queryByTestId("PositionBoxedLabel")).toHaveTextContent(
      boxedLabel
    );
    expect(component.queryByTestId("RankingLabel")).toHaveTextContent(
      rankingLabel
    );
    expect(component.queryByTestId("SuperCashbackAmountBadge")).toBeNull();
  });
});
