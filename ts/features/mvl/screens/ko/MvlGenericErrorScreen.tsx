import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import image from "../../../../../img/servicesStatus/error-detail-icon.png";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { useIODispatch } from "../../../../store/hooks";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { confirmButtonProps } from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { mvlDetailsLoad } from "../../store/actions";

type Props = {
  id: UIMessageId;
};

/**
 * A generic error has occurred during the loading of the MVL details
 * @constructor
 */
export const MvlGenericErrorScreen = (props: Props): React.ReactElement => {
  const dispatch = useIODispatch();
  const retry = () => dispatch(mvlDetailsLoad.request(props.id));

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex} testID={"MvlGenericErrorScreen"}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <VSpacer size={40} />
          <VSpacer size={40} />
          <InfoScreenComponent
            image={renderInfoRasterImage(image)}
            title={I18n.t("features.mvl.ko.genericError.title")}
            body={
              <Body style={{ textAlign: "center" }}>
                {I18n.t("features.mvl.ko.genericError.subtitle")}
              </Body>
            }
          />
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={confirmButtonProps(retry, I18n.t("global.buttons.retry"))}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
