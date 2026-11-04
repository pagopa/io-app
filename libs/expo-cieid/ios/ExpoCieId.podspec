require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name = 'ExpoCieId'
  s.version = package['version']
  s.summary = package['description']
  s.description = package['description']
  s.license = { :type => 'EUPL-1.2', :file => '../../../LICENSE' }
  s.author = 'PagoPA S.p.A.'
  s.homepage = 'https://github.com/pagopa/io-app'
  s.platforms = { :ios => '15.1' }
  s.swift_version = '5.9'
  s.source = { :git => 'https://github.com/pagopa/io-app.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end