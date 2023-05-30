import * as pot from "@pagopa/ts-commons/lib/pot";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Toast as NBToast } from "native-base";
import * as React from "react";
import { useCallback } from "react";
import {
  View,
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  Platform
} from "react-native";
import ViewShot, { CaptureOptions } from "react-native-view-shot";
import { connect } from "react-redux";
import { BonusActivationStatusEnum } from "../../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { Label } from "../../../../components/core/typography/Label";
import { Link } from "../../../../components/core/typography/Link";
import {
  hexToRgba,
  IOColors
} from "../../../../components/core/variables/IOColors";
import { withLightModalContext } from "../../../../components/helpers/withLightModalContext";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { ContextualHelpPropsMarkdown } from "../../../../components/screens/BaseScreenComponent";
import DarkLayout from "../../../../components/screens/DarkLayout";
import { EdgeBorderComponent } from "../../../../components/screens/EdgeBorderComponent";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { LightModalContextInterface } from "../../../../components/ui/LightModal";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../../navigation/params/WalletParamsList";
import { navigateBack } from "../../../../store/actions/navigation";
import { Dispatch } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import variables from "../../../../theme/variables";
import { formatDateAsLocal } from "../../../../utils/dates";
import { useLegacyIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { withBase64Uri } from "../../../../utils/image";
import { getRemoteLocale } from "../../../../utils/messages";
import {
  isShareEnabled,
  saveImageToGallery,
  share
} from "../../../../utils/share";
import { showToast } from "../../../../utils/showToast";
import { maybeNotNullyString } from "../../../../utils/strings";
import BonusCardComponent from "../components/BonusCardComponent";
import { BonusCompositionDetails } from "../components/keyValueTable/BonusCompositionDetails";
import { FamilyComposition } from "../components/keyValueTable/FamilyComposition";
import QrModalBox from "../components/QrModalBox";
import TosBonusComponent from "../../common/components/TosBonusComponent";
import {
  cancelLoadBonusFromIdPolling,
  startLoadBonusFromIdPolling
} from "../store/actions/bonusVacanze";
import {
  bonusActiveDetailByIdSelector,
  ownedActiveOrRedeemedBonus
} from "../store/reducers/allActive";
import {
  availableBonusTypesSelectorFromId,
  bonusVacanzeLogo
} from "../store/reducers/availableBonusesTypes";
import {
  getBonusCodeFormatted,
  ID_BONUS_VACANZE_TYPE,
  isBonusActive,
  validityInterval
} from "../utils/bonus";
import { HSpacer, VSpacer } from "../../../../components/core/spacer/Spacer";
import { IOIcons, Icon } from "../../../../components/core/icons";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { Body } from "../../../../components/core/typography/Body";
import { IOBadge } from "../../../../components/core/IOBadge";
import { ActivateBonusDiscrepancies } from "./activation/request/ActivateBonusDiscrepancies";

type QRCodeContents = {
  [key: string]: string;
};

export type ActiveBonusScreenNavigationParams = Readonly<{
  bonus: BonusActivationWithQrCode;
  validFrom?: Date;
  validTo?: Date;
}>;

const QR_CODE_MIME_TYPE = "image/svg+xml";
const PNG_IMAGE_TYPE = "image/png";
const whiteBgTransparent = hexToRgba(IOColors.white, 0);
const whiteBg = hexToRgba(IOColors.white, 1);

type OwnProps = IOStackNavigationRouteProps<
  WalletParamsList,
  "BONUS_ACTIVE_DETAIL_SCREEN"
>;

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  LightModalContextInterface;

const styles = StyleSheet.create({
  imagePrintable: {
    position: "relative",
    top: 28
  },
  image: {
    position: "absolute",
    top: -144,
    height: 168,
    width: "100%",
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    zIndex: 7,
    elevation: 7,
    alignSelf: "center",
    justifyContent: "center",
    maxWidth: 327
  },
  paddedContentLeft: {
    paddingLeft: variables.contentPadding
  },
  paddedContentRight: {
    paddingRight: variables.contentPadding
  },
  viewShot: {
    flex: 1,
    backgroundColor: IOColors.white
  },
  footerButton: { flex: 1, alignItems: "center" },
  hover: {
    minWidth: "100%",
    minHeight: "100%",
    bottom: 0,
    left: 0,
    top: 0,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  },
  headerSpacer: { height: 154 }
});

async function readBase64Svg(bonusWithQrCode: BonusActivationWithQrCode) {
  return new Promise<QRCodeContents>((res, _) => {
    const qrCodes: BonusActivationWithQrCode["qr_code"] = [
      ...bonusWithQrCode.qr_code
    ];
    const content = qrCodes.reduce<QRCodeContents>(
      (acc: QRCodeContents, curr: BonusActivationWithQrCode["qr_code"][0]) => {
        // for svg we need to convert base64 content to ascii to be rendered
        if (curr.mime_type === QR_CODE_MIME_TYPE) {
          return {
            ...acc,
            [curr.mime_type]: Buffer.from(curr.content, "base64").toString(
              "ascii"
            )
          };
        } else {
          return {
            ...acc,
            [curr.mime_type]: curr.content
          };
        }
      },
      {}
    );
    res(content);
  });
}

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "bonus.bonusVacanze.detail.contextualHelp.title",
  body: "bonus.bonusVacanze.detail.contextualHelp.body"
};

const shareQR = async (content: string, code: string) => {
  const shared = await share(withBase64Uri(content, "png"), code)();
  pipe(
    shared,
    E.mapLeft(_ => showToastGenericError())
  );
};
const showToastGenericError = () => showToast(I18n.t("global.genericError"));
const startRefreshPollingAfter = 3000 as Millisecond;

// screenshot option and state
const flashAnimation = 100 as Millisecond;
const screenShotOption: CaptureOptions = { format: "jpg", quality: 0.9 };
type ScreenShotState = {
  isPrintable: boolean;
  imageStyle?: ViewStyle;
  screenShotUri?: string;
};
const screenShortInitialState: ScreenShotState = {
  imageStyle: undefined,
  isPrintable: false,
  screenShotUri: undefined
};

type FooterButtonProp = {
  label: string;
  iconName: IOIcons;
  onPress: () => void;
};

type FooterProps = {
  firstButton?: FooterButtonProp;
  secondButton?: FooterButtonProp;
  thirdButton?: FooterButtonProp;
};

// icon + text in column
const FooterButton: React.FunctionComponent<FooterButtonProp> = (
  props: FooterButtonProp
) => (
  <TouchableDefaultOpacity onPress={props.onPress} style={styles.footerButton}>
    <Icon name={props.iconName} color="blue" size={24} />
    <VSpacer size={4} />
    <Label weight={"Regular"}>{props.label}</Label>
  </TouchableDefaultOpacity>
);
// 3 buttons in a row
const ActiveBonusFooterButtons: React.FunctionComponent<FooterProps> = (
  props: FooterProps
) => (
  <View style={IOStyles.rowSpaceBetween}>
    {props.firstButton && <FooterButton {...props.firstButton} />}
    {props.secondButton && <FooterButton {...props.secondButton} />}
    {props.thirdButton && <FooterButton {...props.thirdButton} />}
  </View>
);

// eslint-disable-next-line sonarjs/cognitive-complexity
const ActiveBonusScreen: React.FunctionComponent<Props> = (props: Props) => {
  const bonusFromNav = props.route.params.bonus;
  const bonus = pot.getOrElse(props.bonus, bonusFromNav);
  const screenShotRef = React.createRef<ViewShot>();
  const [qrCode, setQRCode] = React.useState<QRCodeContents>({});
  const [screenShotState, setScreenShotState] = React.useState<ScreenShotState>(
    screenShortInitialState
  );
  const backgroundAnimation = React.useRef(new Animated.Value(0)).current;
  const backgroundInterpolation = backgroundAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [whiteBgTransparent, whiteBg]
  });

  // TODO: this hooks doesn't follow the hooks rule but this functionality will be dismissed in December 2021. Otherwise rewrite this hook following all the rules.
  React.useEffect(() => {
    // start refresh polling after startRefreshPollingAfter
    const delayedPolling = setTimeout(() => {
      // When mounting the component starts a polling to update the bonus information at runtime
      props.startPollingBonusFromId(bonusFromNav.id);
    }, startRefreshPollingAfter);

    if (bonus) {
      readBase64Svg(bonus)
        .then(cc => setQRCode(cc))
        .catch(_ => undefined);
    }
    return () => {
      // When the component unmounts demands the stop to the polling saga
      props.cancelPollingBonusFromId();
      clearTimeout(delayedPolling);
    };
  }, []);

  // return an option containing the capture function

  const captureScreenshot = useCallback(
    (): O.Option<() => Promise<string>> =>
      O.fromNullable(
        screenShotRef && screenShotRef.current && screenShotRef.current.capture
      ),
    [screenShotRef]
  );

  React.useEffect(() => {
    if (screenShotState.isPrintable) {
      {
        // start capture screenshot
        pipe(
          captureScreenshot(),
          O.map(capture => {
            capture()
              .then(screenShotUri => {
                setScreenShotState(prev => ({ ...prev, screenShotUri }));
              })
              .catch(() => {
                showToastGenericError();
                // animate fadeOut of flash light animation
                Animated.timing(backgroundAnimation, {
                  duration: flashAnimation,
                  toValue: 0,
                  useNativeDriver: false,
                  easing: Easing.cubic
                }).start();
              });
          })
        );
        return;
      }
    }
  }, [screenShotState.isPrintable, backgroundAnimation, captureScreenshot]);

  React.useEffect(() => {
    // if the screenShotUri is defined start saving image and restore default style
    // show a toast error if something went wrong
    if (screenShotState.screenShotUri) {
      saveImageToGallery(`file://${screenShotState.screenShotUri}`)()
        .then(maybeSaved => {
          E.foldW(
            () => showToastGenericError,
            () => {
              NBToast.show({
                text: I18n.t("bonus.bonusVacanze.saveScreenShotOk")
              });
            }
          )(maybeSaved);
        })
        .catch(showToastGenericError)
        .finally(() => {
          // animate fadeOut of flash light animation
          Animated.timing(backgroundAnimation, {
            duration: flashAnimation,
            toValue: 0,
            useNativeDriver: false,
            easing: Easing.cubic
          }).start();
        });
      setScreenShotState(screenShortInitialState);
    }
  }, [screenShotState.screenShotUri, backgroundAnimation]);

  // translate the bonus status. If no mapping found -> empty string
  const maybeStatusDescription = maybeNotNullyString(
    bonus
      ? I18n.t(`bonus.${bonus.status.toLowerCase()}`, {
          defaultValue: ""
        })
      : ""
  );

  // call this function to create a screenshot and save it into the device camera roll
  const saveScreenShot = () => {
    if (O.isSome(captureScreenshot())) {
      // start screen capturing when first flash light animation will be completed (screen becomes white)
      Animated.timing(backgroundAnimation, {
        duration: flashAnimation,
        toValue: 1,
        useNativeDriver: false,
        easing: Easing.cubic
      }).start(() => {
        // change some style properties to avoid some UI element will be cut out of the image (absolute position and negative offsets)
        // the ViewShot renders into a canvas all its children
        setScreenShotState(prevState => ({
          ...prevState,
          imageStyle: styles.imagePrintable,
          isPrintable: true
        }));
      });
    }
  };

  const { present: openModalBox, bottomSheet } = useLegacyIOBottomSheetModal(
    <QrModalBox
      codeToDisplay={getBonusCodeFormatted(bonus)}
      codeToCopy={bonus.id}
      qrCode={qrCode[QR_CODE_MIME_TYPE]}
      logo={props.logo}
    />,
    I18n.t("bonus.bonusVacanze.name"),
    466
  );

  const handleShare = () =>
    shareQR(
      qrCode[PNG_IMAGE_TYPE],
      `${I18n.t("bonus.bonusVacanze.shareMessage")} ${getBonusCodeFormatted(
        bonusFromNav
      )}`
    );

  const renderBonusActiveButtons = () => (
    <ActiveBonusFooterButtons
      firstButton={{
        label: I18n.t("bonus.bonusVacanze.cta.qrCode"),
        iconName: "qrCode",
        onPress: openModalBox
      }}
      secondButton={
        /**
         * If the share is not available on the device share button won't be rendered
         */
        isShareEnabled()
          ? {
              label: I18n.t("global.genericShare").toLowerCase(),
              iconName: Platform.OS === "android" ? "shareAndroid" : "shareiOs",
              onPress: handleShare
            }
          : undefined
      }
      thirdButton={{
        label: I18n.t("global.genericSave").toLowerCase(),
        iconName: "save",
        onPress: saveScreenShot
      }}
    />
  );

  const renderFooterButtons = () =>
    bonus && isBonusActive(bonus) && renderBonusActiveButtons();

  const renderInformationBlock = (
    icon: IOIcons,
    text: string,
    iconColor?: IOColors
  ) => {
    const now = new Date();
    return (
      <>
        {/* show the time when the screenshot is captured */}
        {screenShotState.isPrintable && (
          <View style={IOStyles.alignCenter}>
            <H3 weight="Bold" color="blue">
              {`${I18n.t("bonus.bonusVacanze.savedOn")}${formatDateAsLocal(
                now,
                true,
                true
              )} - ${now.toLocaleTimeString()}`}
            </H3>
          </View>
        )}
        <View
          style={[
            IOStyles.rowSpaceBetween,
            IOStyles.alignCenter,
            IOStyles.centerJustified
          ]}
        >
          <Icon name={icon} color={iconColor} size={24} />
          <HSpacer size={16} />
          <View style={IOStyles.flex}>
            <VSpacer size={8} />
            <Body color="bluegreyDark" weight="SemiBold">
              {text}
            </Body>
            <VSpacer size={8} />
          </View>
        </View>
      </>
    );
  };

  const switchInformationText = () => {
    switch (bonus.status) {
      case BonusActivationStatusEnum.ACTIVE:
        return renderInformationBlock(
          "calendar",
          I18n.t("bonus.bonusVacanze.statusInfo.validBetween", {
            from: pipe(
              bonusValidityInterval,
              O.fold(
                () => "n/a",
                v => v.e1
              )
            ),
            to: pipe(
              bonusValidityInterval,
              O.fold(
                () => "n/a",
                v => v.e2
              )
            )
          })
        );
      case BonusActivationStatusEnum.REDEEMED:
        return renderInformationBlock(
          "ok",
          I18n.t("bonus.bonusVacanze.statusInfo.redeemed", {
            date: formatDateAsLocal(
              pipe(
                bonus.redeemed_at,
                O.fromNullable,
                O.getOrElse(() => bonus.created_at)
              ),
              true
            )
          }),
          "green"
        );
      case BonusActivationStatusEnum.FAILED:
        return renderInformationBlock(
          "notice",
          I18n.t("bonus.bonusVacanze.statusInfo.bonusRejected")
        );
      default:
        return null;
    }
  };

  const handleModalPress = (tos: string) =>
    props.showModal(
      <TosBonusComponent tos_url={tos} onClose={props.hideModal} />
    );

  const maybeBonusInfo = O.fromNullable(props.bonusInfo);
  const bonusInfoFromLocale = pipe(
    maybeBonusInfo,
    O.map(b => b[getRemoteLocale()]),
    O.toUndefined
  );
  const maybeBonusTos = pipe(
    bonusInfoFromLocale,
    O.fromNullable,
    O.chain(b => maybeNotNullyString(b.tos_url))
  );

  const from = pipe(
    maybeBonusInfo,
    O.map(bi => bi.valid_from)
  );
  const to = pipe(
    maybeBonusInfo,
    O.map(bi => bi.valid_to)
  );
  const bonusValidityInterval = validityInterval(
    O.toUndefined(from),
    O.toUndefined(to)
  );
  return !props.isError && bonus ? (
    <>
      <DarkLayout
        bounces={false}
        title={I18n.t("bonus.bonusVacanze.name")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["bonus_detail"]}
        allowGoBack={true}
        topContent={<View style={styles.headerSpacer} />}
        footerContent={renderFooterButtons()}
        gradientHeader={true}
        hideHeader={true}
      >
        <ViewShot
          ref={screenShotRef}
          style={styles.viewShot}
          options={screenShotOption}
        >
          <SafeAreaView>
            <View>
              <View
                style={[styles.paddedContentLeft, styles.paddedContentRight]}
              >
                <View style={[styles.image, screenShotState.imageStyle]}>
                  <BonusCardComponent
                    bonus={bonus}
                    viewQR={openModalBox}
                    share={handleShare}
                  />
                </View>
                <VSpacer size={40} />
                {switchInformationText()}
                <VSpacer size={16} />
              </View>
              {props.hasMoreOwnedActiveBonus && (
                <ActivateBonusDiscrepancies
                  text={I18n.t("bonus.bonusVacanze.multipleBonus")}
                  attention={I18n.t(
                    "bonus.bonusVacanze.eligibility.activateBonus.discrepancies.attention"
                  )}
                />
              )}
              <View
                style={[styles.paddedContentLeft, styles.paddedContentRight]}
              >
                <ItemSeparatorComponent noPadded={true} />
                <VSpacer size={16} />
                <BonusCompositionDetails
                  bonusAmount={bonus.dsu_request.max_amount}
                  taxBenefit={bonus.dsu_request.max_tax_benefit}
                />
                <VSpacer size={16} />
                <ItemSeparatorComponent noPadded={true} />
                <VSpacer size={16} />
                <FamilyComposition
                  familyMembers={bonus.dsu_request.family_members}
                />
                <VSpacer size={16} />
                <ItemSeparatorComponent noPadded={true} />
                <VSpacer size={16} />
                {O.isSome(maybeStatusDescription) && (
                  <View style={IOStyles.rowSpaceBetween}>
                    <Body weight="SemiBold" color="bluegreyDark">
                      {I18n.t("bonus.bonusVacanze.status")}
                    </Body>
                    <IOBadge
                      text={maybeStatusDescription.value}
                      small={true}
                      variant="solid"
                      color={isBonusActive(bonus) ? "blue" : "aqua"}
                    />
                  </View>
                )}
                <VSpacer size={16} />
                {!isBonusActive(bonus) && bonus.redeemed_at && (
                  <>
                    <View style={IOStyles.rowSpaceBetween}>
                      <Body>{I18n.t("bonus.bonusVacanze.consumedAt")}</Body>
                      <Body>{formatDateAsLocal(bonus.redeemed_at, true)}</Body>
                    </View>
                    <VSpacer size={8} />
                  </>
                )}
                <View style={IOStyles.rowSpaceBetween}>
                  <Body>{I18n.t("bonus.bonusVacanze.requestedAt")}</Body>
                  <Body>{formatDateAsLocal(bonus.created_at, true)}</Body>
                </View>
                {!screenShotState.isPrintable && O.isSome(maybeBonusTos) && (
                  <>
                    <VSpacer size={16} />
                    <ItemSeparatorComponent noPadded={true} />
                    <VSpacer size={24} />
                    <Link
                      onPress={() => handleModalPress(maybeBonusTos.value)}
                      numberOfLines={1}
                    >
                      {I18n.t("bonus.tos.title")}
                    </Link>
                  </>
                )}
                {/* add extra bottom space when capturing screenshot */}
                {screenShotState.isPrintable && <VSpacer size={32} />}
                {!screenShotState.isPrintable && <EdgeBorderComponent />}
              </View>
            </View>
          </SafeAreaView>
        </ViewShot>
      </DarkLayout>
      {/* top layout animated when screenshot is captured (save button) to simulate flash effect */}
      <Animated.View
        pointerEvents={"none"}
        style={[styles.hover, { backgroundColor: backgroundInterpolation }]}
      />
      {bottomSheet}
    </>
  ) : (
    <GenericErrorComponent
      onRetry={() => props.startPollingBonusFromId(bonusFromNav.id)}
      onCancel={props.goBack}
      subText={" "}
    />
  );
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const bonusFromNav = ownProps.route.params.bonus;
  const bonus = bonusActiveDetailByIdSelector(bonusFromNav.id)(state);

  return {
    hasMoreOwnedActiveBonus: ownedActiveOrRedeemedBonus(state).length > 1,
    bonusInfo: availableBonusTypesSelectorFromId(ID_BONUS_VACANZE_TYPE)(state),
    bonus,
    isError: pot.isNone(bonus) && pot.isError(bonus), // error and no bonus data, user should retry to load
    logo: bonusVacanzeLogo(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => navigateBack(),
  startPollingBonusFromId: (id: string) =>
    dispatch(startLoadBonusFromIdPolling(id)),
  cancelPollingBonusFromId: () => dispatch(cancelLoadBonusFromIdPolling())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ActiveBonusScreen));
