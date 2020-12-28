import { reverse } from "fp-ts/lib/Array";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { constUndefined } from "fp-ts/lib/function";
import { getValue } from "../../bonus/bpd/model/RemoteValue";
import {
  ID_BONUS_VACANZE_TYPE,
  ID_BPD_TYPE
} from "../../bonus/bonusVacanze/utils/bonus";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H3 } from "../../../components/core/typography/H3";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import { Dispatch } from "../../../store/actions/types";
import { bonusVacanzeEnabled, bpdEnabled } from "../../../config";
import { bpdEnabledSelector } from "../../bonus/bpd/store/reducers/details/activation";
import { bpdOnboardingStart } from "../../bonus/bpd/store/actions/onboarding";
import { BonusAvailable } from "../../../../definitions/content/BonusAvailable";
import { navigateToBonusRequestInformation } from "../../bonus/bonusVacanze/navigation/action";
import { availableBonusTypesSelector } from "../../bonus/bonusVacanze/store/reducers/availableBonusesTypes";
import bonusVacanzeLogo from "../../../../img/bonus/bonusVacanze/logo_bonusvacanze_blue.png";
import cashbackLogo from "../../../../img/bonus/bpd/logo_cashback_blue.png";
import FeaturedCard from "./FeaturedCard";

type Props = {
  bvActive: boolean;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type BonusUtils = {
  logo?: typeof bonusVacanzeLogo | typeof cashbackLogo;
  handler: (bonus: BonusAvailable) => void;
};

const styles = StyleSheet.create({
  container: { backgroundColor: "white", paddingTop: 14 },
  scrollViewPadding: { paddingVertical: 15 }
});
const FeaturedCardCarousel: React.FunctionComponent<Props> = (props: Props) => {
  const bonusMap: Map<number, BonusUtils> = new Map<number, BonusUtils>([]);

  if (bpdEnabled) {
    bonusMap.set(ID_BPD_TYPE, {
      logo: cashbackLogo,
      handler: _ => props.startBpdOnboarding()
    });
  }
  if (bonusVacanzeEnabled) {
    bonusMap.set(ID_BONUS_VACANZE_TYPE, {
      logo: bonusVacanzeLogo,
      handler: bonus => props.navigateToBonusRequest(bonus)
    });
  }

  const anyBonusNotActive =
    !props.bvActive || getValue(props.bpdActiveBonus) === false;
  return anyBonusNotActive ? (
    <View style={styles.container}>
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
          switch (b.id_type) {
            case ID_BONUS_VACANZE_TYPE:
              return (
                !props.bvActive && (
                  <FeaturedCard
                    key={`featured_bonus_${i}`}
                    title={b[getLocalePrimaryWithFallback()].name}
                    image={logo}
                    isNew={false}
                    onPress={() => handler(b)}
                  />
                )
              );
            case ID_BPD_TYPE:
              return (
                getValue(props.bpdActiveBonus) === false && (
                  <FeaturedCard
                    key={`featured_bonus_${i}`}
                    title={I18n.t("bonus.bpd.name")}
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
  availableBonusesList: pot.getOrElse(availableBonusTypesSelector(state), [])
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startBpdOnboarding: () => dispatch(bpdOnboardingStart()),
  navigateToBonusRequest: (bonusItem: BonusAvailable) => {
    dispatch(navigateToBonusRequestInformation({ bonusItem }));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedCardCarousel);
