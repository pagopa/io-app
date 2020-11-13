import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Body } from "../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
import { EnableableFunctionsTypeEnum } from "../../../../../../types/pagopa";
import { WalletV2WithActivation } from "../../../store/reducers/details/combiner";
import { Link } from "../../../../../../components/core/typography/Link";
import { PaymentMethodRawList } from "./PaymentMethodRawList";
import { hasFunctionEnabled } from "../../../../../../utils/walletv2";

type Props = { paymentList: ReadonlyArray<WalletV2WithActivation> };

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" }
});

const isOtherChannel = (w: WalletV2WithActivation) =>
  w.onboardingChannel === "EXT";

const isNotActivable = (w: WalletV2WithActivation) =>
  w.activationStatus === "notActivable" ||
  !hasFunctionEnabled(w, EnableableFunctionsTypeEnum.BPD);

/**
 * A quick solution, not the best but the cardinality of the entities
 * involved doesn't requires more efficient solutions
 * @param paymentList
 */
const clusterizePaymentMethods = (
  paymentList: ReadonlyArray<WalletV2WithActivation>
) => ({
  otherChannels: paymentList.filter(isOtherChannel),
  notActivable: paymentList.filter(isNotActivable),
  activables: paymentList.filter(v => !isNotActivable(v) && !isOtherChannel(v))
});

const OtherChannelsSection = (props: {
  paymentMethods: ReadonlyArray<WalletV2WithActivation>;
}) => (
  <View>
    <View spacer={true} />
    <View style={styles.row}>
      <Body>
        {I18n.t(
          "bonus.bpd.details.paymentMethods.activateOnOthersChannel.text1"
        )}
        <H4>
          {I18n.t(
            "bonus.bpd.details.paymentMethods.activateOnOthersChannel.text2"
          )}
        </H4>
      </Body>
      <Link>{I18n.t("global.buttons.info").toLowerCase()}</Link>
    </View>
    <View spacer={true} />
    <PaymentMethodRawList paymentList={props.paymentMethods} />
  </View>
);

const NotActivablesSection = (props: {
  paymentMethods: ReadonlyArray<WalletV2WithActivation>;
}) => (
  <View>
    <View spacer={true} />
    <View style={styles.row}>
      <Body>{I18n.t("bonus.bpd.details.paymentMethods.notActivable")}</Body>
    </View>
    <View spacer={true} />
    <PaymentMethodRawList paymentList={props.paymentMethods} />
  </View>
);

/**
 * Render an array of WalletV2WithActivation, grouping different category of payment methods.
 * @param props
 * @constructor
 */
export const PaymentMethodGroupedList: React.FunctionComponent<Props> = props => {
  const { activables, otherChannels, notActivable } = clusterizePaymentMethods(
    props.paymentList
  );
  return (
    <View>
      <PaymentMethodRawList paymentList={activables} />
      {otherChannels.length > 0 && (
        <OtherChannelsSection paymentMethods={otherChannels} />
      )}
      {notActivable.length > 0 && (
        <NotActivablesSection paymentMethods={notActivable} />
      )}
    </View>
  );
};
