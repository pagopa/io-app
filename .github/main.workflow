workflow "Build and Test" {
  on = "push"
  resolves = ["Test"]
}

action "Build" {
  uses = "borales/actions-yarn@master"
  args = "install"
}

action "Test" {
  needs = "Build"
  uses = "borales/actions-yarn@master"
  args = "test"
}
