import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import image from "../../../../../img/wallet/errors/payment-unknown-icon.png";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { cancelButtonProps } from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import { cdcEnrollUserToBonusSelector } from "../store/reducers/cdcBonusRequest";
import { useIOSelector } from "../../../../store/hooks";
import { isReady } from "../../bpd/model/RemoteValue";
import {
  CdcBonusEnrollmentOutcomeList,
  RequestOutcomeEnum
} from "../types/CdcBonusRequest";
import { Anno } from "../../../../../definitions/cdc/Anno";
import CdcGenericError from "./CdcGenericError";

const extractYearsPerOutcome = (
  receivedBonus: CdcBonusEnrollmentOutcomeList
): Record<RequestOutcomeEnum, ReadonlyArray<Anno>> =>
  receivedBonus.reduce<Record<RequestOutcomeEnum, ReadonlyArray<Anno>>>(
    (acc, cur) => ({ ...acc, [cur.outcome]: [...acc[cur.outcome], cur.year] }),
    {
      [RequestOutcomeEnum.OK]: [],
      [RequestOutcomeEnum.INIZIATIVA_TERMINATA]: [],
      [RequestOutcomeEnum.CIT_REGISTRATO]: [],
      [RequestOutcomeEnum.ANNO_NON_AMMISSIBILE]: [],
      [RequestOutcomeEnum.RESIDENCE_ABROAD]: []
    }
  );

const CdcRequestPartiallySuccess = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const cdcEnrollUserToBonus = useIOSelector(cdcEnrollUserToBonusSelector);

  const onExitPress = () => {
    navigation.getParent()?.goBack();
  };

  // Should never occurs
  if (
    !isReady(cdcEnrollUserToBonus) ||
    cdcEnrollUserToBonus.value.kind !== "partialSuccess"
  ) {
    return <CdcGenericError />;
  }

  const receivedBonus = cdcEnrollUserToBonus.value.value;

  const yearPerOutcome: Record<
    RequestOutcomeEnum,
    ReadonlyArray<Anno>
  > = extractYearsPerOutcome(receivedBonus);

  const possibleOutcomes: ReadonlyArray<RequestOutcomeEnum> = Object.keys(
    yearPerOutcome
  ) as ReadonlyArray<RequestOutcomeEnum>;

  const separator = I18n.t("bonus.cdc.bonusRequest.misc.conjunction");
  const outcomeMessageBody = possibleOutcomes.reduce((acc, cur) => {
    if (yearPerOutcome[cur].length === 0) {
      return acc;
    }
    switch (cur) {
      case RequestOutcomeEnum.OK:
        return `${acc}${I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.success",
          { successfulYears: yearPerOutcome[cur].join(separator) }
        )} `;
      case RequestOutcomeEnum.INIZIATIVA_TERMINATA:
        return `${acc}${I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.initiativeFinished",
          { failedYears: yearPerOutcome[cur].join(separator) }
        )} `;
      case RequestOutcomeEnum.CIT_REGISTRATO:
        return `${acc}${I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.alreadyRegistered",
          { failedYears: yearPerOutcome[cur].join(separator) }
        )} `;
      case RequestOutcomeEnum.ANNO_NON_AMMISSIBILE:
        return `${acc}${I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.notEligible",
          { failedYears: yearPerOutcome[cur].join(separator) }
        )} `;
      case RequestOutcomeEnum.RESIDENCE_ABROAD:
        return `${acc}${I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail.residenceAbroad",
          { failedYears: yearPerOutcome[cur].join(separator) }
        )} `;
    }
  }, "");

  return (
    <SafeAreaView style={IOStyles.flex} testID={"cdcRequestPartiallySuccess"}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.title"
        )}
        body={outcomeMessageBody}
      />
      <FooterWithButtons
        type="SingleButton"
        leftButton={cancelButtonProps(
          onExitPress,
          I18n.t("bonus.cdc.bonusRequest.bonusRequested.requestCompleted.cta"),
          undefined,
          "closeButton"
        )}
      />
    </SafeAreaView>
  );
};

export default CdcRequestPartiallySuccess;
