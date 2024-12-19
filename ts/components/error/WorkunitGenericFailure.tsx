import { FooterActions } from "@pagopa/io-app-design-system";

import { ReactElement } from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../img/servicesStatus/error-detail-icon.png";
import I18n from "../../i18n";
import { navigateBack } from "../../store/actions/navigation";
import { IOStyles } from "../core/variables/IOStyles";
import { InfoScreenComponent } from "../infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../infoScreen/imageRendering";
import BaseScreenComponent from "../screens/BaseScreenComponent";

type Props = ReturnType<typeof mapDispatchToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("genericError"),
  title: I18n.t("global.jserror.title"),
  close: I18n.t("global.buttons.close")
});

/**
 * This screen is displayed when an unexpected failure occurs in a work unit
 * @deprecated Use `OperationResultScreen` instead
 * @constructor
 * @param props
 */
const WorkunitGenericFailure = (props: Props): ReactElement => {
  const { headerTitle, title, close } = loadLocales();
  return (
    <BaseScreenComponent headerTitle={headerTitle} goBack={true}>
      <SafeAreaView style={IOStyles.flex} testID={"WorkunitGenericFailure"}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
        />
      </SafeAreaView>
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: close,
            onPress: props.cancel
          }
        }}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  cancel: () => navigateBack()
});

export default connect(null, mapDispatchToProps)(WorkunitGenericFailure);
