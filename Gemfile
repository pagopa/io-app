# frozen_string_literal: true
source "https://rubygems.org"

# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby '>=2.6.10'

# Exclude problematic versions of cocoapods and activesupport that causes build failures.
gem 'cocoapods', '>= 1.13', '!= 1.15.1', '!= 1.15.0'
gem 'activesupport', '>= 6.1.7.5', '!= 7.1.0'
gem 'xcodeproj', '< 1.26.0'
gem 'concurrent-ruby', '< 1.3.4'
gem "fastlane", "~> 2.223.1"

# fixes an issue on linux env for android release
# see https://github.com/ffi/ffi/issues/1103#issuecomment-2186974923
gem "ffi", "< 1.17.0"

# Ruby 3.4.0 has removed some libraries from the standard library.
gem 'bigdecimal'
gem 'logger'
gem 'benchmark'
gem 'mutex_m'
