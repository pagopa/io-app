//
//  PdfHighResGenerator.swift
//  IO
//
//  Created by Emanuele Dall'Ara on 28/11/25.
//

import Foundation
import CoreGraphics
import React
import UIKit

@objc(PdfHighResGenerator)
class PdfHighResGenerator: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func generate(_ filePath: String, scale: Double, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.global(qos: .userInitiated).async {
        
        // Copy source to a temporary file to ensure safe/fast access without sandbox locks.
        let fileManager = FileManager.default
        let tempDir = fileManager.temporaryDirectory
        let tempSourceId = UUID().uuidString
        let tempSourceUrl = tempDir.appendingPathComponent("temp_source_\(tempSourceId).pdf")
        
        var sourceUrl: URL?
        if filePath.hasPrefix("file://") {
            sourceUrl = URL(string: filePath)
        } else {
            sourceUrl = URL(fileURLWithPath: filePath)
        }
        
        guard let validSourceUrl = sourceUrl else {
            reject("FILE_ERROR", "Invalid path: \(filePath)", nil)
            return
        }
        
        do {
            if fileManager.fileExists(atPath: tempSourceUrl.path) {
                try fileManager.removeItem(at: tempSourceUrl)
            }
            try fileManager.copyItem(at: validSourceUrl, to: tempSourceUrl)
        } catch {
            reject("FILE_COPY_ERROR", "Could not copy to temp: \(error.localizedDescription)", nil)
            return
        }
        // We use CGPDFDocument instead of PDFKit for maximum performance and no UI overhead.
        guard let pdfDoc = CGPDFDocument(tempSourceUrl as CFURL) else {
            try? fileManager.removeItem(at: tempSourceUrl)
            reject("PDF_OPEN_ERROR", "Could not open PDF with CoreGraphics", nil)
            return
        }
        
        var outputPaths: [String] = []
        let pageCount = pdfDoc.numberOfPages // CGPDF pages are 1-based
        
        // Maximum dimensions to prevent memory issues
        let maxWidth = 4096.0
        let maxHeight = 4096.0
        
        for i in 1...pageCount {
            autoreleasepool {
                guard let page = pdfDoc.page(at: i) else { return }
                
                // Get Box Rect (MediaBox is the physical page size)
                let pageRect = page.getBoxRect(.mediaBox)
                
                // Calculate Target Size with initial scale
                var targetWidth = pageRect.width * CGFloat(scale)
                var targetHeight = pageRect.height * CGFloat(scale)
                
                // Apply limits: scale down if exceeds max dimensions
                var finalScale = CGFloat(scale)
                if targetWidth > maxWidth || targetHeight > maxHeight {
                    let widthScale = maxWidth / targetWidth
                    let heightScale = maxHeight / targetHeight
                    let limitScale = min(widthScale, heightScale)
                    finalScale *= limitScale
                    targetWidth *= limitScale
                    targetHeight *= limitScale
                }
                
                let finalWidth = Int(targetWidth)
                let finalHeight = Int(targetHeight)
                
                // Create Bitmap Context, 8 bits per component, 4 components (ARGB), standard RGB color space
                let colorSpace = CGColorSpaceCreateDeviceRGB()
                let bitmapInfo = CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
                
                guard let context = CGContext(data: nil,
                                              width: finalWidth,
                                              height: finalHeight,
                                              bitsPerComponent: 8,
                                              bytesPerRow: 0,
                                              space: colorSpace,
                                              bitmapInfo: bitmapInfo) else { return }
                // Fill white background
                context.setFillColor(UIColor.white.cgColor)
                context.fill(CGRect(x: 0, y: 0, width: CGFloat(finalWidth), height: CGFloat(finalHeight)))
                
                context.interpolationQuality = .high
                context.saveGState()
                
                // Scale context to match the target resolution
                context.scaleBy(x: finalScale, y: finalScale)
                
                // We need to translate so the mediaBox origin (which might be non-zero) aligns with 0,0
                context.translateBy(x: -pageRect.origin.x, y: -pageRect.origin.y)
                
                context.drawPDFPage(page)
                context.restoreGState()
                
                // --- SAVE IMAGE ---
                if let cgImage = context.makeImage() {
                    let uiImage = UIImage(cgImage: cgImage)
                    if let data = uiImage.jpegData(compressionQuality: 0.9) {
                        let fileName = "pdf_render_\(UUID().uuidString)_\(i).jpg"
                        let fileURL = tempDir.appendingPathComponent(fileName)
                        
                        do {
                            try data.write(to: fileURL)
                            outputPaths.append(fileURL.absoluteString)
                        } catch {
                            print("Error saving page \(i): \(error)")
                        }
                    }
                }
            }
        }
        
        // CLEANUP
        try? fileManager.removeItem(at: tempSourceUrl)
        
        resolve(outputPaths)
    }
  }
}
