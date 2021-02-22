import { pot } from "italia-ts-commons";
import React from "react";
import { ImageSourcePropType, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import I18n from "../../i18n";
import View from "../ui/TextWithIcon";
import { GlobalState } from "../../store/reducers/types";
import { lastPaymentOutcomeCodeSelector } from "../../store/reducers/wallet/outcomeCode";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { IOStyles } from "../core/variables/IOStyles";
import BaseScreenComponent from "../screens/BaseScreenComponent";
import { InfoScreenComponent } from "../infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../infoScreen/imageRendering";

type Props = ReturnType<typeof mapStateToProps>;
const OutcomeCodeMessageComponent: React.FC<Props> = (props: Props) => {
  const locale = I18n.currentLocale() === "en" ? "en-EN" : "it-IT";
  return (
    <>
      {pot.map(props.outcomeCode.outcomeCode, oC => {
        return (
          <BaseScreenComponent
            goBack={false}
            customGoBack={<View />}
            contextualHelp={emptyContextualHelp}
          >
            <SafeAreaView style={IOStyles.flex} testID={"OutcomeCode"}>
              <InfoScreenComponent
                image={renderInfoRasterImage(oC.icon as ImageSourcePropType)}
                title={oC.title[locale]}
                body={oC.description[locale]}
              />
            </SafeAreaView>
          </BaseScreenComponent>
        );
      })}
    </>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  outcomeCode: lastPaymentOutcomeCodeSelector(state)
});
export default connect(mapStateToProps)(OutcomeCodeMessageComponent);
