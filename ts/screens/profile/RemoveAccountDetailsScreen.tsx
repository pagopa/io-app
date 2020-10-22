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
import {
  RemoveAccountMotivation,
  removeAccountMotivation,
  RemoveAccountMotivationPayload
} from "../../store/actions/profile";
import { identificationRequest } from "../../store/actions/identification";
import { shufflePinPadOnPayment } from "../../config";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import { LoadingErrorComponent } from "../../features/bonus/bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

type Props = ReduxProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * A screen that ask user the motivation of the account removal
 * Here user can ask to delete his account
 */
const RemoveAccountDetails: React.FunctionComponent<Props> = (props: Props) => {
  // Initially no motivation is selected
  const [selectedMotivation, setSelectedMotivation] = React.useState<
    RemoveAccountMotivation | undefined
  >(undefined);

  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: () => {
      if (selectedMotivation !== undefined) {
        props.requestIdentification({ reason: selectedMotivation });
      }
    },
    title: I18n.t("profile.main.privacy.removeAccount.info.cta")
  };

  const loadingCaption = I18n.t(
    "bonus.bpd.onboarding.loadingActivationStatus.title"
  );
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.main.title")}
    >
      {props.isLoading ||
      pot.isError(
        props.userDataProcessing[UserDataProcessingChoiceEnum.DELETE]
      ) ? (
        <LoadingErrorComponent
          isLoading={props.isLoading}
          loadingCaption={loadingCaption}
          onRetry={() => true}
        ></LoadingErrorComponent>
      ) : (
        <SafeAreaView style={IOStyles.flex}>
          <Content>
            <H1>{I18n.t("profile.main.privacy.removeAccount.title")}</H1>
            <H4 weight="Regular">
              {I18n.t("profile.main.privacy.removeAccount.details.body")}
            </H4>
            <View style={{ paddingTop: 25 }}>
              <RadioButtonList<RemoveAccountMotivation>
                head="Qual'è il motivo della cancellazione?"
                key="delete_reason"
                items={[
                  { label: "Non ritengo più utile IO", id: "notUtils" },
                  { label: "Non mi sento al sicuro su IO", id: "notSafe" },
                  { label: "Non ho mai usato l'app", id: "neverUsed" },
                  { label: "Nessuno dei precedenti", id: "others" }
                ]}
                selectedItem={selectedMotivation}
                onPress={motivationIndex => {
                  setSelectedMotivation(motivationIndex);
                }}
              />
            </View>
          </Content>
          <FooterWithButtons
            type={"SingleButton"}
            leftButton={continueButtonProps}
          />
        </SafeAreaView>
      )}
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  const onIdentificationSuccess = (
    motivationPayload: RemoveAccountMotivationPayload
  ) => dispatch(removeAccountMotivation(motivationPayload));

  return {
    requestIdentification: (
      motivationPayload: RemoveAccountMotivationPayload
    ) =>
      dispatch(
        identificationRequest(
          false,
          true,
          {
            message: I18n.t("wallet.ConfirmPayment.identificationMessage")
          },
          {
            label: I18n.t("wallet.ConfirmPayment.cancelPayment"),
            onCancel: () => undefined
          },
          {
            onSuccess: () => onIdentificationSuccess(motivationPayload)
          },
          shufflePinPadOnPayment
        )
      )
  };
};

const mapStateToProps = (state: GlobalState) => {
  const userDataProcessing = userDataProcessingSelector(state);
  const isLoading =
    pot.isLoading(userDataProcessing.DOWNLOAD) ||
    pot.isUpdating(userDataProcessing.DOWNLOAD);
  return {
    userDataProcessing,
    isLoading
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemoveAccountDetails);
