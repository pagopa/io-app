import ExpoModulesCore

public class ExpoZendeskModule: Module {
  private let zendesk = ReactNativeZendesk()

  public func definition() -> ModuleDefinition {
    Name("ExpoZendesk")

    Function("init") { (options: [String: Any]) in self.zendesk.initialize(options) }
    Function("initChat") { (key: String) in self.zendesk.initChat(key) }
    Function("setPrimaryColor") { (color: String) in self.zendesk.setPrimaryColor(color) }
    Function("showHelpCenter") { (options: [String: Any]) in self.zendesk.showHelpCenter(options) }
    Function("addTicketCustomField") { (key: String, value: String) in self.zendesk.addTicketCustomField(key, withValue: value) }
    Function("appendLog") { (log: String) in self.zendesk.appendLog(log) }
    Function("addTicketTag") { (tag: String) in self.zendesk.addTicketTag(tag) }
    Function("resetCustomFields") { self.zendesk.resetCustomFields() }
    Function("resetTags") { self.zendesk.resetTags() }
    Function("resetLog") { self.zendesk.resetLog() }
    Function("dismiss") { self.zendesk.dismiss() }
    AsyncFunction("openTicket") { (promise: Promise) in
      self.zendesk.openTicket { _ in promise.resolve(nil) }
    }
    AsyncFunction("showTickets") { (promise: Promise) in
      self.zendesk.showTickets { _ in promise.resolve(nil) }
    }
    AsyncFunction("hasOpenedTickets") { (promise: Promise) in
      self.zendesk.hasOpenedTickets(promise.resolve, rejecter: promise.reject)
    }
    AsyncFunction("getTotalNewResponses") { (promise: Promise) in
      self.zendesk.getTotalNewResponses(promise.resolve, rejecter: promise.reject)
    }
    Function("setNotificationToken") { (token: Data) in self.zendesk.setNotificationToken(token) }
    Function("setUserIdentity") { (identity: [String: Any]) in self.zendesk.setUserIdentity(identity) }
    Function("setVisitorInfo") { (_: [String: Any]) in }
    Function("resetUserIdentity") { }
  }
}