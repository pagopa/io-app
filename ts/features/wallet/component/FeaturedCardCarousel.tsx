import { reverse } from "fp-ts/lib/Array";
import { constUndefined } from "fp-ts/lib/function";
import { fromNullable } from "fp-ts/lib/Option";
import { View } from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { BonusAvailable } from "../../../../definitions/content/BonusAvailable";
import cashbackLogo from "../../../../img/bonus/bpd/logo_cashback_blue.png";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import { supportedAvailableBonusSelector } from "../../bonus/bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_BPD_TYPE, ID_CGN_TYPE } from "../../bonus/bonusVacanze/utils/bonus";
import { bpdOnboardingStart } from "../../bonus/bpd/store/actions/onboarding";
import { bpdEnabledSelector } from "../../bonus/bpd/store/reducers/details/activation";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";
import { cgnActivationStart } from "../../bonus/cgn/store/actions/activation";
import { bpdEnabled, cgnEnabled } from "../../../config";
import { isStrictSome } from "../../../utils/pot";
import { isCGNBonusActiveSelector } from "../../bonus/cgn/store/reducers/activation";
import FeaturedCard from "./FeaturedCard";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type BonusUtils = {
  logo?: typeof cashbackLogo;
  handler: (bonus: BonusAvailable) => void;
};

const styles = StyleSheet.create({
  container: { backgroundColor: "white", paddingTop: 14 },
  scrollViewPadding: { paddingVertical: 15 }
});

/**
 * this component shows an horizontal scrollview of items
 * an item represents a bonus that the app can handle (relative feature flag enabled and handler set) and its
 * visibility is 'visible' or 'experimental'
 */
const FeaturedCardCarousel: React.FunctionComponent<Props> = (props: Props) => {
  const bonusMap: Map<number, BonusUtils> = new Map<number, BonusUtils>([]);

  if (bpdEnabled) {
    bonusMap.set(ID_BPD_TYPE, {
      logo: cashbackLogo,
      handler: _ => props.startBpdOnboarding()
    });
  }

  if (cgnEnabled) {
    bonusMap.set(ID_CGN_TYPE, {
      // FIXME Replace the logo when it has been approved
      logo: cashbackLogo,
      handler: _ => props.startCgnActivation()
    });
  }

  const hasBpdActive: boolean | undefined = isStrictSome(props.bpdActiveBonus)
    ? props.bpdActiveBonus.value
    : undefined;

  // are there any bonus to activate?
  const anyBonusNotActive =
    hasBpdActive === false || props.cgnActiveBonus === false;
  return props.availableBonusesList.length > 0 && anyBonusNotActive ? (
    <View style={styles.container} testID={"FeaturedCardCarousel"}>
      <View style={[IOStyles.horizontalContentPadding]}>
        <H3 weight={"SemiBold"} color={"bluegreyDark"}>
          {I18n.t("wallet.featured")}
        </H3>
      </View>
      <ScrollView
        horizontal={true}
        style={[IOStyles.horizontalContentPadding, styles.scrollViewPadding]}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {reverse([...props.availableBonusesList]).map((b, i) => {
          const handler = fromNullable(bonusMap.get(b.id_type)).fold(
            () => constUndefined,
            bu => bu.handler
          );
          const logo = fromNullable(bonusMap.get(b.id_type)).fold(
            undefined,
            bu => bu.logo
          );
          const currentLocale = getLocalePrimaryWithFallback();

          switch (b.id_type) {
            case ID_BPD_TYPE:
              return (
                hasBpdActive === false && (
                  <FeaturedCard
                    testID={"FeaturedCardBPDTestID"}
                    key={`featured_bonus_${i}`}
                    title={I18n.t("bonus.bpd.name")}
                    image={logo}
                    isNew={true}
                    onPress={() => handler(b)}
                  />
                )
              );
            case ID_CGN_TYPE:
              return (
                props.cgnActiveBonus === false && (
                  <FeaturedCard
                    testID={"FeaturedCardCGNTestID"}
                    key={`featured_bonus_${i}`}
                    title={b[currentLocale].name}
                    image={logo}
                    isNew={true}
                    onPress={() => handler(b)}
                  />
                )
              );
            default:
              return null;
          }
        })}
      </ScrollView>
    </View>
  ) : null;
};

const mapStateToProps = (state: GlobalState) => ({
  bpdActiveBonus: bpdEnabledSelector(state),
  cgnActiveBonus: isCGNBonusActiveSelector(state),
  availableBonusesList: supportedAvailableBonusSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startBpdOnboarding: () => dispatch(bpdOnboardingStart()),
  startCgnActivation: () => dispatch(cgnActivationStart())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedCardCarousel);
