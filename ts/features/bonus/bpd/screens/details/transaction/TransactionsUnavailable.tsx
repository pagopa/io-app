import * as React from "react";
import { SafeAreaView } from "react-native";
import image from "../../../../../../../img/wallet/errors/payment-unavailable-icon.png";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";

export type Props = Pick<
  React.ComponentProps<typeof BaseScreenComponent>,
  "contextualHelp"
>;

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.details.transaction.goToButton"),
  title: I18n.t("bonus.bpd.details.transaction.error.title"),
  body: I18n.t("bonus.bpd.details.transaction.error.body")
});

/**
 * This screen informs the user that there are problems retrieving the transactions list.
 * @deprecated
 * @constructor
 */
const TransactionsUnavailable: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body } = loadLocales();

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"TransactionUnavailable"}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default TransactionsUnavailable;
