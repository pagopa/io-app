require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "ExpoCie"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"] || "MIT"
  s.authors      = "PagoPA"
  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/pagopa/io-app.git", :tag => "#{s.version}" }
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.dependency "ExpoModulesCore"
  s.dependency "CieSDK", "~> 0.1.21"
end