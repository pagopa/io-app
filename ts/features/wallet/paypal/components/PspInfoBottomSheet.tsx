import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import I18n from "../../../../i18n";
import { IOColors } from "../../../../components/core/variables/IOColors";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { openWebUrl } from "../../../../utils/url";
import { Link } from "../../../../components/core/typography/Link";
import { useIOBottomSheet } from "../../../../utils/bottomSheet";
import { Body } from "../../../../components/core/typography/Body";

const styles = StyleSheet.create({
  link: {
    backgroundColor: IOColors.white,
    borderColor: IOColors.white,
    paddingRight: 0,
    paddingLeft: 0
  }
});

const findOutMore = "https://io.italia.it/cashback/faq/#n3_11";

/**
 * Explains why there are other cards
 * @constructor
 */
const WhyOtherCards = () => (
  <View>
    <View spacer={true} />
    <View style={{ flex: 1 }}>
      <Body>
        {I18n.t(
          "bonus.bpd.details.paymentMethods.activateOnOthersChannel.whyOtherCards.body"
        )}
      </Body>
      <ButtonDefaultOpacity
        onPress={() => openWebUrl(findOutMore)}
        onPressWithGestureHandler={true}
        style={styles.link}
      >
        <Link>
          {I18n.t(
            "bonus.bpd.details.paymentMethods.activateOnOthersChannel.whyOtherCards.cta"
          )}
        </Link>
      </ButtonDefaultOpacity>
    </View>
  </View>
);

type Props = {
  pspName: string;
  pspFee: NonNegativeNumber;
};
export const usePspInfoBottomSheet = (props: Props) =>
  useIOBottomSheet(
    <WhyOtherCards />,
    I18n.t("wallet.onboarding.paypal.selectPsp.infoBottomSheet.title", {
      pspName: props.pspName
    }),
    300
  );
