require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ExpoHttpClient'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = { :type => 'MIT' }
  s.author         = 'PagoPA'
  s.homepage       = 'https://github.com/pagopa/io-app'
  s.platforms      = {
    :ios => '15.1'
  }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/pagopa/io-app.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  if respond_to?(:spm_dependency, true)
    spm_dependency(s,
      url: 'https://github.com/Alamofire/Alamofire.git',
      requirement: { kind: 'exactVersion', version: '5.11.2' },
      products: ['Alamofire']
    )
  else
    raise 'ExpoHttpClient requires React Native >= 0.75 to resolve Alamofire through Swift Package Manager'
  end

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
