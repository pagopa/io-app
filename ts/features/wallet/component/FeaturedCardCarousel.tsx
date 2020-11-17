import { reverse } from "fp-ts/lib/Array";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { ScrollView } from "react-native";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { nullType } from "io-ts";
import { BonusesAvailable } from "../../../../definitions/content/BonusesAvailable";
import { getValue, RemoteValue } from "../../bonus/bpd/model/RemoteValue";
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
import { bpdEnabled } from "../../../config";
import { bpdEnabledSelector } from "../../bonus/bpd/store/reducers/details/activation";
import { bpdOnboardingStart } from "../../bonus/bpd/store/actions/onboarding";
import { BonusAvailable } from "../../../../definitions/content/BonusAvailable";
import { navigateToBonusRequestInformation } from "../../bonus/bonusVacanze/navigation/action";
import { navigationHistoryPop } from "../../../store/actions/navigationHistory";
import { availableBonusTypesSelector } from "../../bonus/bonusVacanze/store/reducers/availableBonusesTypes";
import FeaturedCard from "./FeaturedCard";

type Props = {
  bvActive: boolean;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const FeaturedCardCarousel: React.FunctionComponent<Props> = (props: Props) => {
  const handlersMap: Map<number, (bonus: BonusAvailable) => void> = new Map<
    number,
    (bonus: BonusAvailable) => void
  >([[ID_BONUS_VACANZE_TYPE, bonus => props.navigateToBonusRequest(bonus)]]);

  if (bpdEnabled) {
    handlersMap.set(ID_BPD_TYPE, _ => props.startBpdOnboarding());
  }

  const isOneBonusActive = !props.bvActive || !getValue(props.bpdActiveBonus);
  return isOneBonusActive ? (
    <>
      <View
        style={[
          IOStyles.horizontalContentPadding,
          { paddingTop: 14, paddingBottom: 4 }
        ]}
      >
        <H3 weight={"SemiBold"} color={"bluegreyDark"}>
          {"In evidenza"}
        </H3>
      </View>
      <ScrollView
        horizontal={true}
        style={[IOStyles.horizontalContentPadding, { paddingVertical: 10 }]}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        {reverse([...props.availableBonusesList]).map((b, i) => {
          const handler = fromNullable(handlersMap.get(b.id_type)).getOrElse(
            () => nullType
          );
          switch (b.id_type) {
            case ID_BONUS_VACANZE_TYPE:
              return props.bvActive ? null : (
                <FeaturedCard
                  key={`featured_bonus_${i}`}
                  title={b[getLocalePrimaryWithFallback()].name}
                  image={b.cover}
                  isNew={false}
                  onPress={() => handler(b)}
                />
              );
            case ID_BPD_TYPE:
              return getValue(props.bpdActiveBonus) ? null : (
                <FeaturedCard
                  key={`featured_bonus_${i}`}
                  title={I18n.t("bonus.bpd.name")}
                  image={b.cover}
                  isNew={true}
                  onPress={() => handler(b)}
                />
              );
            default:
              return null;
          }
        })}
      </ScrollView>
    </>
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
    dispatch(navigationHistoryPop(1));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedCardCarousel);
