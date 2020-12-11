import { View } from "native-base";
import * as React from "react";
import { Body } from "../../../../../../components/core/typography/Body";
import Markdown from "../../../../../../components/ui/Markdown";
import I18n from "../../../../../../i18n";

const BpdEmptyTransactionsList: React.FunctionComponent = () => (
  <>
    <Body>{I18n.t("bonus.bpd.details.transaction.detail.empty")}</Body>
    <View spacer={true} large={true} />
    <Markdown>
      {I18n.t("bonus.bpd.details.transaction.detail.summary.bottomSheet.body")}
    </Markdown>
  </>
);

export default BpdEmptyTransactionsList;
