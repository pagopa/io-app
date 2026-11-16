require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoLoginUtils'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = 'EUPL'
  s.author         = 'IO app team'
  s.homepage       = 'https://github.com/pagopa/io-app'
  s.platforms      = {
    :ios => min_ios_version_supported
  }
  s.source         = { git: 'https://github.com/pagopa/io-app.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,swift}"
end
