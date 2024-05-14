# Mattermost Plugin User Survey

### An on-prem plugin for managing surveys withing a Mattermost installation

This plugin allows admins to configure, customise, schedule and manage surveys for Mattermost users.
The responses are stored on the Mattermost installation itself, completely on-premise. A CSV report can be generated
for a survey to review the feedback received and analyze trends in NPS scores.

## Features

* Admins can schedule surveys to start after a specific date and time
* Admins can configure how long does a survey last
* Members of specific teams can be excluded from a survey
* Welcome message of the survey can be customised
* Currently only one question can be customised with ability to add more questions of different kinds soon to follow.
* A report can generated for each survey that includes the NPS score of the survey and all the responses which the users submitted.

<img src="docs/readme/demo_image.png?raw=true" alt="user survey demo screenshot"/>

## Development

### Setup

Make sure you have the following components installed:

- Go - v1.21 - [Getting Started](https://golang.org/doc/install)
  > **Note:** If you have installed Go to a custom location, make sure the `$GOROOT` variable is set properly.
  Refer [Installing to a custom location](https://golang.org/doc/install#install).

- Node.JS - v18.18

- Make

You also want to have the environment variable `MM_SERVICESETTINGS_ENABLEDEVELOPER="true"` set as otherwise the plugin
will be compiled for Linux, Windows and Darwin ARM64 and x64 architecture every single time. Setting
the `MM_SERVICESETTINGS_ENABLEDEVELOPER` to `true` makes the plugin compile and build only for the OS and architecture
you are building on.

In your mattermost config, make sure that `PluginSettings.EnableUploads` is `true`, and `FileSettings.MaxFileSize` is
large enough to accept the plugin bundle (eg `256000000`)

### Building the plugin

Run the following command in the plugin repo to prepare a compiled, distributable plugin zip:

```bash
make dist
```

After a successful build, a `.tar.gz` file in the `/dist` folder will be created which can be uploaded to Mattermost. To
avoid having to manually install your plugin, deploy your plugin using one of the following options.

### Deploying with Local Mode

If your Mattermost server is running locally, you can
enable [local mode](https://docs.mattermost.com/administration/mmctl-cli-tool.html#local-mode) to streamline deploying
your plugin. Edit your server configuration as follows:

```
{
    "ServiceSettings": {
        ...
        "EnableLocalMode": true,
        "LocalModeSocketLocation": "/var/tmp/mattermost_local.socket"
     }
}
```

and then deploy your plugin:

```bash
make deploy
```

You may also customize the Unix socket path:

```bash
export MM_LOCALSOCKETPATH=/var/tmp/alternate_local.socket
make deploy
```

If developing a plugin with a web app, watch for changes and deploy those automatically:

```bash
export MM_SERVICESETTINGS_SITEURL=http://localhost:8065
export MM_ADMIN_TOKEN=j44acwd8obn78cdcx7koid4jkr
make watch
```

### Deploying with credentials

Alternatively, you can authenticate with the server's API with credentials:

```bash
export MM_SERVICESETTINGS_SITEURL=http://localhost:8065
export MM_ADMIN_USERNAME=admin
export MM_ADMIN_PASSWORD=password
make deploy
```

or with a [personal access token](https://docs.mattermost.com/developer/personal-access-tokens.html):

```bash
export MM_SERVICESETTINGS_SITEURL=http://localhost:8065
export MM_ADMIN_TOKEN=j44acwd8obn78cdcx7koid4jkr
make deploy
```
