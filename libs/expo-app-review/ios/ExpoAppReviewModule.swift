import ExpoModulesCore
import StoreKit

public class ExpoAppReviewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoAppReview")

    // Runs on the main actor: SKStoreReviewController/AppStore review APIs require the active window scene.
    AsyncFunction("requestReview") {
      await MainActor.run {
        let activeWindowScene = UIApplication.shared.connectedScenes.first { scene in
          scene.activationState == .foregroundActive && scene is UIWindowScene
        }

        guard let scene = activeWindowScene as? UIWindowScene else {
          return
        }

        if #available(iOS 16.0, *) {
          AppStore.requestReview(in: scene)
        } else {
          SKStoreReviewController.requestReview(in: scene)
        }
      }
    }
  }
}
