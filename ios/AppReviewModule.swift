//
//  AppReviewModule.swift
//  ItaliaApp
//
//  Created by Cristiano Tofani on 19/03/25.
//

import Foundation
import UIKit
import StoreKit
import SwiftUICore


/** `@objc` attribute exposes Swift methods to the Objective-C runtime**/
@objc(AppReviewModule)
class AppReviewModule: NSObject {
  @MainActor @objc
  func requestReview () -> Void {
    if #available(iOS 16.0, *) {
      let activeWindowScene = UIApplication.shared.connectedScenes.first { scene in
        return scene.activationState == .foregroundActive && scene is UIWindowScene
      }
      
      if let scene = activeWindowScene as? UIWindowScene {
        AppStore.requestReview(in: scene)
        return
      }
    }
    
    if #available(iOS 14.0, *) {
      let activeWindowScene = UIApplication.shared.connectedScenes.first { scene in
        return scene.activationState == .foregroundActive && scene is UIWindowScene
      }
      
      if let scene = activeWindowScene as? UIWindowScene {
        SKStoreReviewController.requestReview(in: scene)
        return
      }
    }
  }
}
