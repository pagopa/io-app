import React, { useEffect } from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import {
  Badge,
  H2,
  IOStyles,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import ItwSearchBar from "../../../components/ItwSearchBar";
import I18n from "../../../../../i18n";
import {
  getCredentialsCatalog,
  CredentialCatalogAvailableItem,
  CredentialCatalogItem
} from "../../../utils/mocks";
import ListItemLoadingItw from "../../../components/ListItems/ListItemLoadingItw";
import { IOStackNavigationProp } from "../../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { itwIssuanceCredentialChecksSelector } from "../../../store/reducers/issuance/credential/itwIssuanceCredentialReducer";
import { itwIssuanceCredentialChecks } from "../../../store/actions/issuing/credential/itwIssuanceCredentialActions";

const NONE_LOADING = -1;

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwIssuingCredentialCatalogScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();
  const preliminaryChecks = useIOSelector(itwIssuanceCredentialChecksSelector);
  const [loadingIndex, setLoadingIndex] = React.useState<number>(NONE_LOADING);
  const catalog = getCredentialsCatalog();

  /**
   * Side effect to navigate to the credential checks screen when the preliminaryChecks pot
   * transitions to a non loading state and not none state.
   * This is necessary because folding the pot in this screen would cause too many rerenders
   * due to the base screen component being contained in the ContentView component which is
   * rerendered when the pot transitions from a none state to a non none state.
   * Thus, the pot is folded in the credential checks screen.
   * This screen dispatches the action which starts the checks process and shows a local loading spinner
   * besides the catalog item which has been selected. It's not connected to the pot loading state.
   * The loadingIndex check is necessary to avoid navigating to the credential checks screen
   * when the user goes back from the credential checks screen.
   */
  useEffect(() => {
    if (loadingIndex !== NONE_LOADING && !pot.isLoading(preliminaryChecks)) {
      navigation.navigate(ITW_ROUTES.ISSUING.CREDENTIAL.CHECKS);
      setLoadingIndex(NONE_LOADING);
    }
  }, [loadingIndex, navigation, preliminaryChecks]);

  const onCredentialSelect = ({
    type: credentialType,
    issuerUrl,
    index,
    ...displayData
  }: CredentialCatalogAvailableItem & { index: number }) => {
    setLoadingIndex(index);
    dispatch(
      itwIssuanceCredentialChecks.request({
        displayData,
        issuerUrl,
        credentialType
      })
    );
  };

  /**
   * Renders a single credential catalog item in a FlatList.
   * @param catalogItem - the catalog item to render.
   * @param loading - the loading state of the catalog item.
   * @param index - the index of the catalog item.
   */
  const CatalogItem = ({
    catalogItem,
    loading = false,
    index
  }: {
    catalogItem: CredentialCatalogItem;
    loading: boolean;
    index: number;
  }) => (
    <>
      <ListItemLoadingItw
        onPress={() =>
          !catalogItem.incoming && onCredentialSelect({ ...catalogItem, index })
        }
        accessibilityLabel={catalogItem.title}
        title={catalogItem.title}
        icon={catalogItem.icon}
        rightNode={
          catalogItem.incoming ? (
            <Badge
              text={I18n.t(
                "features.itWallet.issuing.credentialsCatalogScreen.incomingFeature"
              )}
              variant="success"
            />
          ) : (
            <Icon name="chevronRight" />
          )
        }
        disabled={catalogItem.incoming}
        loading={loading}
      />
    </>
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={{ ...IOStyles.flex }}>
        <View
          style={{ ...IOStyles.flex, ...IOStyles.horizontalContentPadding }}
        >
          <H2>
            {I18n.t("features.itWallet.issuing.credentialsCatalogScreen.title")}
          </H2>
          <View style={IOStyles.flex}>
            <VSpacer />
            <ItwSearchBar />
            <VSpacer />
            <FlatList
              data={catalog}
              renderItem={({ item, index }) => (
                <CatalogItem
                  index={index}
                  catalogItem={item}
                  loading={index === loadingIndex}
                />
              )}
              keyExtractor={(item, index) => `${index}_${item.title}`}
              ItemSeparatorComponent={() => <VSpacer size={8} />}
            />
          </View>
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwIssuingCredentialCatalogScreen;
