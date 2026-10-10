require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))
sdk_enabled = ENV['NO_INTERNAL_MODULE'] != '1'

Pod::Spec.new do |s|
  s.name = 'ExpoCieSdk'
  s.version = package['version']
  s.summary = package['description']
  s.description = package['description']
  s.license = 'MIT'
  s.author = 'PagoPA'
  s.homepage = 'https://github.com/pagopa/io-app'
  s.source = { :git => 'https://github.com/pagopa/io-app.git' }
  s.platform = :ios, '15.1'
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '*.{h,m,swift}'
  s.public_header_files = 'CieSdkClient.h'
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'GCC_PREPROCESSOR_DEFINITIONS' => "$(inherited) CIE_SDK_ENABLED=#{sdk_enabled ? 1 : 0}"
  }
  if sdk_enabled
    s.vendored_frameworks = 'iociesdkios.framework'
  end
end