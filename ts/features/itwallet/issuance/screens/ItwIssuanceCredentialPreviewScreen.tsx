import {
  ContentWrapper,
  H3,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import { sequenceS } from "fp-ts/lib/Apply";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { SafeAreaView, View } from "react-native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { LoadingIndicator } from "../../../../components/ui/LoadingIndicator";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import {
  CredentialType,
  itwCredentialNameByCredentialType
} from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import {
  selectCredential,
  selectCredentialType,
  selectIsLoading
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";

export const ItwIssuanceCredentialPreviewScreen = () => {
  const maybeCredential =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredential);
  const maybeCredentialType =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialType);
  const isLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);

  if (isLoading) {
    return <LoadingView />;
  }

  return pipe(
    sequenceS(O.Monad)({
      credentialType: O.fromNullable(maybeCredentialType),
      credential: O.fromNullable(maybeCredential)
    }),
    O.fold(constNull, props => <ContentView {...props} />)
  );
};

type ContentViewProps = {
  credentialType: CredentialType;
  credential: StoredCredential;
};

/**
 * Renders the content of the screen if the credential is decoded.
 */
const ContentView = ({ credentialType, credential }: ContentViewProps) => {
  const navigation = useIONavigation();
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const dispatch = useIODispatch();
  const dismissDialog = useItwDismissalDialog(() =>
    machineRef.send({ type: "close" })
  );

  const handleSaveToWallet = () => {
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: () => machineRef.send({ type: "add-to-wallet" })
        }
      )
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);

  return (
    <IOScrollViewWithLargeHeader
      excludeEndContentMargin
      title={{
        label: I18n.t("features.itWallet.issuance.credentialPreview.title", {
          credential: itwCredentialNameByCredentialType[credentialType]
        })
      }}
      goBack={dismissDialog.show}
    >
      <ContentWrapper>
        <ItwCredentialClaimsList data={credential} isPreview={true} />
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            icon: "add",
            iconPosition: "end",
            label: I18n.t(
              "features.itWallet.issuance.credentialPreview.actions.primary"
            ),
            onPress: handleSaveToWallet
          },
          secondary: {
            label: I18n.t(
              "features.itWallet.issuance.credentialPreview.actions.secondary"
            ),
            onPress: dismissDialog.show
          }
        }}
      />
    </IOScrollViewWithLargeHeader>
  );
};

/**
 * Renders a loading spinner if the credential obtaines takes too long
 */
const LoadingView = () => {
  const navigation = useIONavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  });

  return (
    <SafeAreaView style={[IOStyles.flex, IOStyles.centerJustified]}>
      <ContentWrapper>
        <View style={IOStyles.alignCenter}>
          <LoadingIndicator />
          <VSpacer size={24} />
          <H3 style={{ textAlign: "center" }}>
            Attendi ancora qualche secondo, senza uscire dall’app
          </H3>
        </View>
      </ContentWrapper>
    </SafeAreaView>
  );
};
