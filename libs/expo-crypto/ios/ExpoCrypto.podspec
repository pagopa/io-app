require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name = 'ExpoCrypto'
  s.version = package['version']
  s.summary = package['description']
  s.description = package['description']
  s.license = { :type => 'MIT', :file => '../LICENSE' }
  s.author = 'PagoPA'
  s.homepage = 'https://github.com/pagopa/io-app'
  s.source = { :git => 'https://github.com/pagopa/io-app.git' }
  s.platforms = { :ios => '15.1' }
  s.swift_version = '5.9'
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.dependency 'OpenSSL-Universal'
  s.source_files = '*.{h,mm,swift}'
  s.public_header_files = 'CRLChecker.h'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end