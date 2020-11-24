import { View } from "native-base";
import * as React from "react";
import I18n from "../../../../../../i18n";
import { Body } from "../../../../../../components/core/typography/Body";

const BpdEmptyTransactionsList: React.FunctionComponent = () => (
  <>
    <Body>{I18n.t("bonus.bpd.details.transaction.detail.empty")}</Body>
    <View spacer={true} large={true} />
    <Body>
      {I18n.t("bonus.bpd.details.transaction.detail.summary.bottomSheet.body")}
    </Body>
  </>
);

export default BpdEmptyTransactionsList;
