require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name = 'ExpoIntegrity'
  s.version = package['version']
  s.summary = package['description']
  s.description = package['description']
  s.license = { :type => 'MIT' }
  s.author = 'PagoPA'
  s.homepage = 'https://github.com/pagopa/io-app'
  s.source = { :git => 'https://github.com/pagopa/io-app.git' }
  s.platforms = { :ios => '15.1' }
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'SwiftCBOR'
  s.frameworks = 'DeviceCheck', 'CryptoKit'
  s.source_files = '*.swift'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end