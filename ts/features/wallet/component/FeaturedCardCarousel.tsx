import { reverse } from "fp-ts/lib/Array";
import { View } from "native-base";
import * as React from "react";
import { ScrollView } from "react-native";
import I18n from "../../../i18n";
import { H3 } from "../../../components/core/typography/H3";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";
import {
  ID_BONUS_VACANZE_TYPE,
  ID_BPD_TYPE
} from "../../bonus/bonusVacanze/utils/bonus";
import { getValue, RemoteValue } from "../../bonus/bpd/model/RemoteValue";
import { BonusesAvailable } from "../../../../definitions/content/BonusesAvailable";
import FeaturedCard from "./FeaturedCard";

type Props = {
  availableBonusesList: BonusesAvailable;
  bvActive: boolean;
  bpdActive: RemoteValue<boolean, Error>;
};

const FeaturedCardCarousel: React.FunctionComponent<Props> = (props: Props) => {
  const isOneBonusActive = !props.bvActive || !getValue(props.bpdActive);
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
          switch (b.id_type) {
            case ID_BONUS_VACANZE_TYPE:
              return props.bvActive ? null : (
                <FeaturedCard
                  key={`featured_bonus_${i}`}
                  title={b[getLocalePrimaryWithFallback()].name}
                  image={b.cover}
                  isNew={false}
                />
              );
            case ID_BPD_TYPE:
              return getValue(props.bpdActive) ? null : (
                <FeaturedCard
                  key={`featured_bonus_${i}`}
                  title={I18n.t("bonus.bpd.name")}
                  image={b.cover}
                  isNew={true}
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

export default FeaturedCardCarousel;
