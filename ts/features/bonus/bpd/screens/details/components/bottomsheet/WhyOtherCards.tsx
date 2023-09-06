import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import ButtonDefaultOpacity from "../../../../../../../components/ButtonDefaultOpacity";
import { Body } from "../../../../../../../components/core/typography/Body";
import { Link } from "../../../../../../../components/core/typography/Link";
import I18n from "../../../../../../../i18n";
import { useLegacyIOBottomSheetModal } from "../../../../../../../utils/hooks/bottomSheet";
import { openWebUrl } from "../../../../../../../utils/url";

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
export const WhyOtherCards = () => (
  <View>
    <VSpacer size={16} />
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

export const useWhyOtherCardsBottomSheet = () =>
  useLegacyIOBottomSheetModal(
    <WhyOtherCards />,
    I18n.t(
      "bonus.bpd.details.paymentMethods.activateOnOthersChannel.whyOtherCards.title"
    ),
    300
  );
