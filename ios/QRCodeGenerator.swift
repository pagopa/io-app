//
//  QRCodeGenerator.swift
//  IO
//

import CoreImage
import CoreImage.CIFilterBuiltins
import Foundation
import React
import UIKit

@objc(QRCodeGenerator)
class QRCodeGenerator: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc
  func generate(
    _ data: String,
    size: Double,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.global(qos: .userInitiated).async {
      guard let inputData = data.data(using: .isoLatin1) else {
        reject("QR_ERROR", "Failed to encode data as ISO Latin-1", nil); return
      }

      let filter = CIFilter.qrCodeGenerator()
      filter.message = inputData
      filter.correctionLevel = "H"

      guard let rawQR = filter.outputImage else {
        reject("QR_ERROR", "CIQRCodeGenerator produced no output", nil); return
      }

      let px = CGFloat(size)
      let scale = px / rawQR.extent.width
      let scaled = rawQR.transformed(by: CGAffineTransform(scaleX: scale, y: scale))

      let context = CIContext(options: [.useSoftwareRenderer: false])
      guard
        let cgImage = context.createCGImage(scaled, from: scaled.extent),
        let pngData = UIImage(cgImage: cgImage).pngData()
      else {
        reject("QR_ERROR", "Failed to render QR image", nil); return
      }

      resolve("data:image/png;base64,\(pngData.base64EncodedString())")
    }
  }
}
