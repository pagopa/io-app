// Stolen from this PR: https://github.com/Instabug/Instabug-React-Native/pull/159

declare module "instabug-reactnative" {
  type InvocationEventKey =
    | "none"
    | "shake"
    | "screenshot"
    | "twoFingersSwipe"
    | "floatingButton";
  type InvocationEvent = any;
  type InvocationEventEnum = { [key in InvocationEventKey]: InvocationEvent };
  const invocationEvent: InvocationEventEnum;

  type ReproStepsModeKey = "enabled" | "disabled" | "enabledWithNoScreenshots";
  type ReproStepsMode = any;
  type ReproStepsModeEnum = { [key in ReproStepsModeKey]: ReproStepsMode };
  const reproStepsMode: ReproStepsModeEnum;

  type DismissTypeKey = "submit" | "cancel" | "addAttachment";
  type DismissType = any;
  type DismissTypeEnum = { [key in DismissTypeKey]: DismissType };
  const dismissType: DismissTypeEnum;

  type ReportTypeKey = "bug" | "feedback";
  type ReportType = any;
  type ReportTypeEnum = { [key in ReportTypeKey]: ReportType };
  const reportType: ReportTypeEnum;

  type InvocationModeKey =
    | "NA"
    | "newBug"
    | "newFeedback"
    | "newChat"
    | "chatsList";
  type InvocationMode = any;
  type InvocationModeEnum = { [key in InvocationModeKey]: InvocationMode };
  const invocationMode: InvocationModeEnum;

  type ExtendedBugReportModeKey =
    | "enabledWithRequiredFields"
    | "enabledWithOptionalFields"
    | "disabled";
  type ExtendedBugReportMode = any;
  type ExtendedBugReportModeEnum = {
    [key in ExtendedBugReportModeKey]: ExtendedBugReportMode
  };
  const extendedBugReportMode: ExtendedBugReportModeEnum;

  type LocaleKey =
    | "arabic"
    | "chineseSimplified"
    | "chineseTraditional"
    | "czech"
    | "danish"
    | "dutch"
    | "english"
    | "french"
    | "german"
    | "italian"
    | "japanese"
    | "polish"
    | "portugueseBrazil"
    | "russian"
    | "spanish"
    | "swedish"
    | "turkish";
  type Locale = any;
  type LocaleEnum = { [key in LocaleKey]: Locale };
  const locale: LocaleEnum;

  type ColorThemeKey = "light" | "dark";
  type ColorTheme = any;
  type ColorThemeEnum = { [key in ColorThemeKey]: ColorTheme };
  const colorTheme: ColorThemeEnum;

  type FloatingButtonEdgeKey = "left" | "right";
  type FloatingButtonEdge = any;
  type FloatingButtonEdgeEnum = {
    [key in FloatingButtonEdgeKey]: FloatingButtonEdge
  };
  const floatingButtonEdge: FloatingButtonEdgeEnum;

  type IBGPositionKey = "bottomRight" | "topRight" | "bottomLeft" | "topLeft";
  type IBGPosition = any;
  type IBGPositionEnum = { [key in IBGPositionKey]: IBGPosition };
  const IBGPosition: IBGPositionEnum;

  type ActionTypesKey =
    | "allActions"
    | "reportBug"
    | "requestNewFeature"
    | "addCommentToFeature";
  type ActionTypes = any;
  type ActionTypesEnum = { [key in ActionTypesKey]: ActionTypes };
  const actionTypes: ActionTypesEnum;

  type StringsKey =
    | "shakeHint"
    | "swipeHint"
    | "edgeSwipeStartHint"
    | "startAlertText"
    | "invalidEmailMessage"
    | "invalidEmailTitle"
    | "invalidCommentMessage"
    | "invalidCommentTitle"
    | "invocationHeader"
    | "talkToUs"
    | "reportBug"
    | "reportFeedback"
    | "emailFieldHint"
    | "commentFieldHintForBugReport"
    | "commentFieldHintForFeedback"
    | "addVideoMessage"
    | "addVoiceMessage"
    | "addImageFromGallery"
    | "addExtraScreenshot"
    | "audioRecordingPermissionDeniedTitle"
    | "audioRecordingPermissionDeniedMessage"
    | "microphonePermissionAlertSettingsButtonText"
    | "recordingMessageToHoldText"
    | "recordingMessageToReleaseText"
    | "conversationsHeaderTitle"
    | "screenshotHeaderTitle"
    | "chatsNoConversationsHeadlineText"
    | "doneButtonText"
    | "okButtonText"
    | "cancelButtonText"
    | "thankYouText"
    | "audio"
    | "video"
    | "image"
    | "chatsHeaderTitle"
    | "team"
    | "messageNotification"
    | "messagesNotificationAndOthers"
    | "conversationTextFieldHint"
    | "collectingDataText"
    | "thankYouAlertText";
  type Strings = any;
  type StringsEnum = { [key in StringsKey]: Strings };
  const strings: StringsEnum;

  function startWithToken(
    token: string,
    invocationEvent: InvocationEvent
  ): void;

  function invoke(): void;

  function invokeWithInvocationMode(invocationMode: InvocationMode): void;

  function dismiss(): void;

  function setUserData(userData: string): void;

  function setAutoScreenRecordingEnabled(
    autoScreenRecordingEnabled: boolean
  ): void;

  function setAutoScreenRecordingMaxDuration(
    autoScreenRecordingMaxDuration: number
  ): void;

  function IBGLog(log: string): void;

  function setUserStepsEnabled(isUserStepsEnabled: boolean): void;

  function setCrashReportingEnabled(enableCrashReporter: boolean): void;

  function setPreSendingHandler(preSendingHandler: Function): void;

  function showSurveyWithToken(surveyToken: string): void;

  function hasRespondedToSurveyWithToken(
    surveyToken: string,
    surveyTokenCallback: Function
  ): void;

  function setSessionProfilerEnabled(sessionProfilerEnabled: boolean): void;

  function setPreInvocationHandler(preInvocationHandler: Function): void;

  function setPostInvocationHandler(postInvocationHandler: Function): void;

  function showIntroMessage(): void;

  function setUserEmail(userEmail: string): void;

  function setUserName(userName: string): void;

  function setWillSkipScreenshotAnnotation(
    willSkipScreenshotAnnotation: boolean
  ): void;

  function getUnreadMessagesCount(messageCountCallback: Function): void;

  function setInvocationEvent(invocationEvent: InvocationEvent): void;

  function setPushNotificationsEnabled(
    isPushNotificationEnabled: boolean
  ): void;

  function setEmailFieldRequired(isEmailFieldRequired: boolean): void;

  function setEmailFieldRequiredForActions(
    isEmailFieldRequired: boolean,
    actionTypes: Partial<ActionTypes>
  ): void;

  function setCommentFieldRequired(isCommentFieldRequired: boolean): void;

  function setShakingThresholdForIPhone(
    iPhoneShakingThreshold: number,
    iPadShakingThreshold: number
  ): void;

  function setShakingThresholdForAndroid(androidThreshold: number): void;

  function setFloatingButtonEdge(
    floatingButtonEdge: FloatingButtonEdge,
    offsetFromTop: number
  ): void;

  function setLocale(locale: Locale): void;

  function setIntroMessageEnabled(isIntroMessageEnabled: boolean): void;

  function setColorTheme(colorTheme: ColorTheme): void;

  function setPrimaryColor(primaryColor: number): void;

  function appendTags(tags: string[]): void;

  function resetTags(): void;

  function getTags(tagsCallback: Function): void;

  function setStringToKey(string: string, key: Strings): void;

  function setAttachmentTypesEnabled(
    screenshot: boolean,
    extraScreenshot: boolean,
    galleryImage: boolean,
    voiceNote: boolean,
    screenRecording: boolean
  ): void;

  function setEnabledAttachmentTypes(
    screenshot: boolean,
    extraScreenshot: boolean,
    galleryImage: boolean,
    voiceNote: boolean,
    screenRecording: boolean
  ): void;

  function setChatNotificationEnabled(isChatNotificationEnabled: boolean): void;

  function setOnNewMessageHandler(onNewMessageHandler: Function): void;

  function isInstabugNotification(
    dict: Object,
    isInstabugNotificationCallback: Function
  ): void;

  function identifyUserWithEmail(email: string, name: string): void;

  function logOut(): void;

  function setReportCategories(titles: any[]): void;

  function setExtendedBugReportMode(
    extendedBugReportMode: ExtendedBugReportMode
  ): void;

  function logUserEventWithName(name: string): void;

  function logUserEventWithNameAndParams(name: string, params: Object): void;

  function logVerbose(message: string): void;

  function logInfo(message: string): void;

  function logDebug(message: string): void;

  function logError(message: string): void;

  function logWarn(message: string): void;

  function setReproStepsMode(reproStepsMode: ReproStepsMode): void;

  function setUserAttribute(key: string, value: string): void;

  function getUserAttribute(key: string, userAttributeCallback: Function): void;

  function removeUserAttribute(key: string): void;

  function getAllUserAttributes(userAttributesCallback: Function): void;

  function clearAllUserAttributes(): void;

  function setViewHierarchyEnabled(viewHierarchyEnabled: boolean): void;

  function setSurveysEnabled(surveysEnabled: boolean): void;

  function showSurveysIfAvailable(): void;

  function setWillShowSurveyHandler(willShowSurveyHandler: Function): void;

  function setDidDismissSurveyHandler(didDismissSurveyHandler: Function): void;

  function setPromptOptionsEnabled(
    chat: boolean,
    bug: boolean,
    feedback: boolean
  ): void;

  function setDebugEnabled(isDebugEnabled: boolean): void;

  function enable(): void;

  function disable(): void;

  function isRunningLive(runningLiveCallBack: Function): void;

  function setSuccessDialogEnabled(enabled: boolean): void;

  function setEnableInAppNotificationSound(shouldPlaySound: boolean): void;

  function reportJSException(errorObject: Object): void;

  function setVideoRecordingFloatingButtonPosition(position: IBGPosition): void;

  function setThresholdForReshowingSurveyAfterDismiss(
    sessionCount: number,
    daysCount: number
  ): void;

  function setAutoShowingSurveysEnabled(
    autoShowingSurveysEnabled: boolean
  ): void;

  function showFeatureRequests(): void;

  function setShouldShowSurveysWelcomeScreen(
    shouldShowWelcomeScreen: boolean
  ): void;
}
