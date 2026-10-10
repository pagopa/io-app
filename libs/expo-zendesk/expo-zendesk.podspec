require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name = "expo-zendesk"
  s.version = package["version"]
  s.summary = package["description"]
  s.authors = "PagoPA S.p.A."
  s.license = { :type => "EUPL-1.2" }
  s.homepage = "https://github.com/pagopa/io-app"
  s.platforms = { :ios => "13.0" }
  s.source = { :git => "https://github.com/pagopa/io-app.git", :tag => s.version }
  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.dependency "ExpoModulesCore"
  s.dependency "ZendeskAnswerBotSDK"
  s.dependency "ZendeskSupportSDK"
  s.dependency "ZendeskChatSDK"
  s.dependency "ZendeskMessagingAPISDK"
end