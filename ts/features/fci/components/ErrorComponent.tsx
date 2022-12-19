import * as React from "react";
import { SafeAreaView } from "react-native";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { WithTestID } from "../../../types/WithTestID";

type Props = WithTestID<{
  title: string;
  subTitle: string;
  image: number;
  onPress: () => void;
}>;

const ErrorComponent = (props: Props) => (
  <BaseScreenComponent goBack={false}>
    <SafeAreaView style={IOStyles.flex} testID={props.testID}>
      <InfoScreenComponent
        image={renderInfoRasterImage(props.image)}
        title={props.title}
        body={props.subTitle}
      />

      <FooterWithButtons
        type={"SingleButton"}
        leftButton={cancelButtonProps(
          props.onPress,
          I18n.t("global.buttons.close"),
          undefined,
          "closeButton"
        )}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

export default ErrorComponent;
