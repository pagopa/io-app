//
//  PdfHighResGenerator.swift
//  IO
//
//  Created by Emanuele Dall'Ara on 28/11/25.
//


import Foundation
import PDFKit
import React

@objc(PdfHighResGenerator)
class PdfHighResGenerator: NSObject {

  // Initialize on background thread to avoid blocking main thread on startup
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func generate(_ filePath: String, scale: Double, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    // Handle URL string (add file:// prefix if missing)
    var fileUrl: URL?
    if filePath.hasPrefix("file://") {
        fileUrl = URL(string: filePath)
    } else {
        fileUrl = URL(fileURLWithPath: filePath)
    }

    guard let url = fileUrl, let document = PDFDocument(url: url) else {
        reject("FILE_ERROR", "Unable to open PDF at path: \(filePath)", nil)
        return
    }

    var outputPaths: [String] = []
    let pageCount = document.pageCount

    // Run rendering in a background queue to keep UI responsive
    DispatchQueue.global(qos: .userInitiated).async {
        for i in 0..<pageCount {
            guard let page = document.page(at: i) else { continue }
            
            // physical page size
            let pageRect = page.bounds(for: .mediaBox)
            
            // Apply Scale
            let targetSize = CGSize(width: pageRect.width * CGFloat(scale),
                                    height: pageRect.height * CGFloat(scale))
            
            let renderer = UIGraphicsImageRenderer(size: targetSize)
            let image = renderer.image { ctx in
                // Fill background with white
                UIColor.white.set()
                ctx.fill(CGRect(origin: .zero, size: targetSize))
                // Configure graphics context quality
                ctx.cgContext.interpolationQuality = .high
                
                // --- COORDINATE FLIP ---
                // PDFKit uses a bottom-up coordinate system, while UIKit uses top-down.
                // We must translate and scale Y by -1 to prevent the image from being upside down.
                ctx.cgContext.translateBy(x: 0, y: targetSize.height)
                ctx.cgContext.scaleBy(x: 1.0, y: -1.0)
                
                // Apply the zoom scale
                ctx.cgContext.scaleBy(x: CGFloat(scale), y: CGFloat(scale))
                page.draw(with: .mediaBox, to: ctx.cgContext)
            }
            
            // Save to temporary file
            if let data = image.jpegData(compressionQuality: 0.9) {
                let fileName = "pdf_render_\(UUID().uuidString)_\(i).jpg"
                let tempDir = FileManager.default.temporaryDirectory
                let fileURL = tempDir.appendingPathComponent(fileName)
                
                do {
                    try data.write(to: fileURL)
                    outputPaths.append(fileURL.absoluteString)
                } catch {
                    print("Error saving page \(i): \(error)")
                }
            }
        }
        // Return results to JS thread
        resolve(outputPaths)
    }
  }
}
