import { reverse } from "fp-ts/lib/Array";
import { constUndefined } from "fp-ts/lib/function";
import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { BonusAvailable } from "../../../../definitions/content/BonusAvailable";
import cashbackLogo from "../../../../img/bonus/bpd/logo_cashback_blue.png";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { bpdEnabled } from "../../../config";
import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import { GlobalState } from "../../../store/reducers/types";
import { availableBonusTypesSelector } from "../../bonus/bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_BPD_TYPE } from "../../bonus/bonusVacanze/utils/bonus";
import { bpdOnboardingStart } from "../../bonus/bpd/store/actions/onboarding";
import { bpdEnabledSelector } from "../../bonus/bpd/store/reducers/details/activation";
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
const FeaturedCardCarousel: React.FunctionComponent<Props> = (props: Props) => {
  const bonusMap: Map<number, BonusUtils> = new Map<number, BonusUtils>([]);

  if (bpdEnabled) {
    bonusMap.set(ID_BPD_TYPE, {
      logo: cashbackLogo,
      handler: _ => props.startBpdOnboarding()
    });
  }

  const anyBonusNotActive = !pot.getOrElse(props.bpdActiveBonus, false);
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
            case ID_BPD_TYPE:
              return (
                !pot.getOrElse(props.bpdActiveBonus, false) && (
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
  startBpdOnboarding: () => dispatch(bpdOnboardingStart())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedCardCarousel);
