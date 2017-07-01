const APPSTATE_CHANGE = 'APPSTATE'

exports.APPSTATE_CHANGE = APPSTATE_CHANGE

exports.appStateChange = function(appState) {
  return {
    type: APPSTATE_CHANGE,
    data: appState,
  }
}
