import ExpoModulesCore

public class ExpoZendeskModule: Module {
  private let zendesk = ReactNativeZendesk()

  public func definition() -> ModuleDefinition {
    let initialize: AnyDefinition = Function("init") { (options: [String: Any]) in self.zendesk.initialize(options) }
    let initChat: AnyDefinition = Function("initChat") { (key: String) in self.zendesk.initChat(key) }
    let setPrimaryColor: AnyDefinition = Function("setPrimaryColor") { (color: String) in self.zendesk.setPrimaryColor(color) }
    let showHelpCenter: AnyDefinition = Function("showHelpCenter") { (options: [String: Any]) in self.zendesk.showHelpCenter(options) }
    let addTicketCustomField: AnyDefinition = Function("addTicketCustomField") { (key: String, value: String) in self.zendesk.addTicketCustomField(key, withValue: value) }
    let appendLog: AnyDefinition = Function("appendLog") { (log: String) in self.zendesk.appendLog(log) }
    let addTicketTag: AnyDefinition = Function("addTicketTag") { (tag: String) in self.zendesk.addTicketTag(tag) }
    let resetCustomFields: AnyDefinition = Function("resetCustomFields") { self.zendesk.resetCustomFields() }
    let resetTags: AnyDefinition = Function("resetTags") { self.zendesk.resetTags() }
    let resetLog: AnyDefinition = Function("resetLog") { self.zendesk.resetLog() }
    let dismiss: AnyDefinition = Function("dismiss") { self.zendesk.dismiss() }
    let openTicket: AnyDefinition = AsyncFunction("openTicket") { (promise: Promise) in
      self.zendesk.openTicket { promise.resolve(nil) }
    }
    let showTickets: AnyDefinition = AsyncFunction("showTickets") { (promise: Promise) in
      self.zendesk.showTickets { promise.resolve(nil) }
    }
    let hasOpenedTickets: AnyDefinition = AsyncFunction("hasOpenedTickets") { (promise: Promise) in
      self.zendesk.hasOpenedTickets { result, error in
        if let error {
          promise.reject(error)
        } else {
          promise.resolve(result)
        }
      }
    }
    let getTotalNewResponses: AnyDefinition = AsyncFunction("getTotalNewResponses") { (promise: Promise) in
      self.zendesk.getTotalNewResponses { result, error in
        if let error {
          promise.reject(error)
        } else {
          promise.resolve(result)
        }
      }
    }
    let setNotificationToken: AnyDefinition = Function("setNotificationToken") { (token: String) in
      self.zendesk.setNotificationToken(Data(base64Encoded: token) ?? Data(token.utf8))
    }
    let setUserIdentity: AnyDefinition = Function("setUserIdentity") { (identity: [String: Any]) in self.zendesk.setUserIdentity(identity) }
    let setVisitorInfo: AnyDefinition = Function("setVisitorInfo") { (_: [String: Any]) in }
    let resetUserIdentity: AnyDefinition = Function("resetUserIdentity") { }

    return ModuleDefinitionBuilder.buildBlock(
      Name("ExpoZendesk"),
      initialize,
      initChat,
      setPrimaryColor,
      showHelpCenter,
      addTicketCustomField,
      appendLog,
      addTicketTag,
      resetCustomFields,
      resetTags,
      resetLog,
      dismiss,
      openTicket,
      showTickets,
      hasOpenedTickets,
      getTotalNewResponses,
      setNotificationToken,
      setUserIdentity,
      setVisitorInfo,
      resetUserIdentity
    )
  }
}