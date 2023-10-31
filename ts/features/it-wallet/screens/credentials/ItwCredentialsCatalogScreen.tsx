import React from "react";
import * as O from "fp-ts/lib/Option";
import { FlatList, SafeAreaView, View } from "react-native";
import {
  Badge,
  H2,
  IOStyles,
  Icon,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import ItwSearchBar from "../../components/ItwSearchBar";
import I18n from "../../../../i18n";
import {
  CREDENTIALS_CATALOG,
  CredentialCatalogAvailableItem,
  CredentialCatalogItem
} from "../../utils/mocks";
import ListItemLoadingItw from "../../components/ListItems/ListItemLoadingItw";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  itwIssuancePreliminaryChecksSelector,
  itwIssuanceDataSelector,
  IssuanceData
} from "../../store/reducers/new/itwIssuanceReducer";
import { itwStartIssuanceFlow } from "../../store/actions/new/itwIssuanceActions";
import ItwContinueScreen from "../../components/ItwResultComponent";
import { showCancelAlert } from "../../utils/alert";
import { ItWalletError } from "../../utils/errors/itwErrors";
import { getItwGenericMappedError } from "../../utils/errors/itwErrorsMapping";
import ItwKoView from "../../components/ItwKoView";

// Seach which index a credential has in the catalog
const getCatalogIndex = (issuanceData: IssuanceData): O.Option<number> =>
  CREDENTIALS_CATALOG.filter(
    (e): e is CredentialCatalogAvailableItem => e.incoming === false
  ).reduce(
    (maybeIndex, e, i) =>
      O.isSome(maybeIndex)
        ? maybeIndex
        : e.type === issuanceData.credentialType &&
          e.issuerUrl === issuanceData.issuerUrl
        ? O.some(i)
        : O.none,
    O.none as O.Option<number>
  );

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwCredentialsCatalogScreen = () => {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();

  const preliminaryChecks = useIOSelector(itwIssuancePreliminaryChecksSelector);
  // will be populated once the flow has started
  const maybeIssuanceData = useIOSelector(itwIssuanceDataSelector);

  const onUserConfirmIssuance = () =>
    navigation.navigate(ITW_ROUTES.CREDENTIALS.ISSUING_INFO);

  const onCredentialSelect = ({
    type: credentialType,
    issuerUrl,
    ...displayData
  }: CredentialCatalogAvailableItem) => {
    // Start the issuance flow by selecting the credential to be issued
    dispatch(
      itwStartIssuanceFlow.request({
        displayData,
        issuerUrl,
        credentialType
      })
    );
  };

  /**
   * Renders a single credential catalog item in a FlatList.
   * @param catalogItem: the catalog item to render.
   */
  const CatalogItem = ({
    catalogItem,
    loading = false
  }: {
    catalogItem: CredentialCatalogItem;
    loading: boolean;
  }) => (
    <>
      <ListItemLoadingItw
        onPress={() => !catalogItem.incoming && onCredentialSelect(catalogItem)}
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

  const ConfirmView = ({ issuanceData }: { issuanceData: IssuanceData }) => (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <ItwContinueScreen
          title={I18n.t(
            "features.itWallet.issuing.credentialsChecksScreen.success.title",
            { credentialName: issuanceData.displayData.title }
          )}
          pictogram="identityAdd"
          action={{
            label: I18n.t("global.buttons.confirm"),
            accessibilityLabel: I18n.t("global.buttons.confirm"),
            onPress: onUserConfirmIssuance
          }}
          secondaryAction={{
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: () =>
              showCancelAlert(() => {
                toast.info(
                  I18n.t(
                    "features.itWallet.issuing.credentialsChecksScreen.toast.cancel"
                  )
                );
                dispatch(itwStartIssuanceFlow.cancel());
              })
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );

  const ContentView = ({ loadingIndex = -1 }: { loadingIndex?: number }) => (
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
              data={CREDENTIALS_CATALOG}
              renderItem={({ item, index }) => (
                <CatalogItem
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

  // Checks failed
  const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
    // TODO: handle contextual error
    const mappedError = getItwGenericMappedError(() => navigation.goBack());
    return <ItwKoView {...mappedError} />;
  };

  // A generic erro view for cases not mapped
  const Panic = ({ label: _ = "unknown" }: { label?: string }) => <ErrorView />;

  const RenderMask = () =>
    pot.fold(
      preliminaryChecks,
      /* initial catalog */ () => <ContentView />,
      /* loading */ () =>
        pipe(
          maybeIssuanceData,
          O.chain(getCatalogIndex),
          O.fold(
            () => <Panic label="unexpected empty catalog index" />,
            loadingIndex => <ContentView loadingIndex={loadingIndex} />
          )
        ),
      /* ! loading */ () => <Panic label="unexpected foldNoneUpdating" />,
      /* ! checks failed */ () => <Panic label="unexpected foldNoneError" />,
      /* checks terminated */ _ =>
        pipe(
          maybeIssuanceData,
          O.fold(
            () => <Panic label="unexpected empty issuance data" />,
            issuanceData => <ConfirmView issuanceData={issuanceData} />
          )
        ),
      /* ! loading */ () => <Panic label="unexpected foldSomeLoading" />,
      /* ! loading */ () => <Panic label="unexpected foldSomeUpdating" />,
      /* checks failed */ (_, error) => <ErrorView error={error} />
    );

  return <RenderMask></RenderMask>;
};

export default ItwCredentialsCatalogScreen;
