import { View } from "native-base";
import * as React from "react";
import { InfoBox } from "../../../../components/box/InfoBox";
import { Body } from "../../../../components/core/typography/Body";
import { H4 } from "../../../../components/core/typography/H4";
import { IOColors } from "../../../../components/core/variables/IOColors";
import I18n from "../../../../i18n";

/**
 * Display generic information on bancomat and a cta to start the onboarding of a new
 * payment method.
 * TODO: this will be also visualized inside a bottomsheet after an addition of satispay
 * @constructor
 */

const SatispayInformation: React.FunctionComponent = () => (
  <View>
    <InfoBox iconColor={IOColors.black}>
      <Body>
        {I18n.t("wallet.satispay.details.infobox.one")}
        <H4>{I18n.t("wallet.satispay.details.infobox.two")}</H4>
        {I18n.t("wallet.satispay.details.infobox.three")}
      </Body>
    </InfoBox>
  </View>
);

export default SatispayInformation;
