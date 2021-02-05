import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";
import View from "../../../../../../../components/ui/TextWithIcon";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { cancelButtonProps } from "../../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { useHardwareBackButton } from "../../../../../../bonus/bonusVacanze/components/hooks/useHardwareBackButton";
import { walletAddCoBadgeCancel } from "../../../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  // TODO: replace with locales
  headerTitle: "TMP Cobadge header title",
  title: "TMP KONotFound title",
  body: "TMP KONotFound body"
});

/**
 * This screen informs the user that no co-badge in his name were found.
 * @constructor
 */
const CoBadgeKoNotFound = (props: Props): React.ReactElement => {
  const { headerTitle, title, body } = loadLocales();
  // disable hardware back
  useHardwareBackButton(() => true);
  return (
    <BaseScreenComponent
      goBack={false}
      customGoBack={<View />}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps(props.cancel)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch(walletAddCoBadgeCancel())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CoBadgeKoNotFound);
