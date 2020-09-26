terraform {
  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "secret-traitor"

    workspaces {
      name = "secret-traitor"
    }
  }
}
