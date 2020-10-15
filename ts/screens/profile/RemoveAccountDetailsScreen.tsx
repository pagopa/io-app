import * as pot from "italia-ts-commons/lib/pot";
import { Content, View } from "native-base";
import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import I18n from "../../i18n";
import { ReduxProps } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";

import { IOStyles } from "../../components/core/variables/IOStyles";
import { H1 } from "../../components/core/typography/H1";
import { H4 } from "../../components/core/typography/H4";
import { RadioButtonList } from "../../components/core/selection/RadioButtonList";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { removeAccountMotivation } from "../../store/actions/profile";

type Props = ReduxProps & ReturnType<typeof mapDispatchToProps>;

/**
 * A screen that ask user the motivation of the account removal
 * Here user can ask to delete his account
 */
const RemoveAccountDetails: React.FunctionComponent<Props> = (props: Props) => {
  // Initially no motivation is selected
  const [selectedMotivation, setSelectedMotivation] = React.useState(-1);
  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => props.sendMotivation(),
    title: I18n.t("profile.main.privacy.removeAccount.info.cta")
  };

  const footerComponent = (
    <FooterWithButtons type={"SingleButton"} leftButton={continueButtonProps} />
  );
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.main.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content>
          <H1>{I18n.t("profile.main.privacy.removeAccount.title")}</H1>
          <H4 weight="Regular">
            {I18n.t("profile.main.privacy.removeAccount.details.body")}
          </H4>
          <View style={{ paddingTop: 25 }}>
            <RadioButtonList
              head="Qual'è il motivo della cancellazione?"
              key="delete_reason"
              items={[
                { label: "Non ritengo più utile IO", id: 0 },
                { label: "Non mi sento al sicuro su IO", id: 1 },
                { label: "Non ho mai usato l'app", id: 2 },
                { label: "Nessuno dei precedenti", id: 3 }
              ]}
              selectedItem={selectedMotivation}
              onPress={motivationIndex => {
                setSelectedMotivation(motivationIndex);
              }}
            />
          </View>
        </Content>
        {footerComponent}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  sendMotivation: () => dispatch(removeAccountMotivation())
});

export default connect(undefined, mapDispatchToProps)(RemoveAccountDetails);
