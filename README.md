# Mattermost User Survey Plugin

### A self-hosted plugin for managing surveys withing a Mattermost installation

This plugin allows admins to configure, customize, schedule, and manage surveys for their Mattermost users.
All responses are stored within your Mattermost deployment. You can generate a CSV report
for a survey to review the feedback received and analyze trends in NPS scores.

## Features

* Admins can schedule surveys to begin on a specific date and a specific time.
* Admins can configure how long each survey lasts.
* Members of specific teams can be excluded from a survey.
* Admins can customize the Welcome message for each survey.
* Admins can customize one question. Additional question customization is planned in a future iteration. 
* Admins can generate a report for each survey that includes NPS scores and user responses.

<img src="docs/readme/demo_image.png?raw=true" alt="user survey demo screenshot"/>

## Development

### Technical Architecture

The tech docs are located [here](/docs/architecture/architecture.md).

### Setup

Make sure you have the following components installed:

- Go - v1.21 - [Getting Started](https://golang.org/doc/install)
  > **Note:** If you have installed Go to a custom location, make sure the `$GOROOT` variable is set properly.
  Refer [Installing to a custom location](https://golang.org/doc/install#install).

- Node.JS - v18.18

- Make

You also want to have the environment variable `MM_SERVICESETTINGS_ENABLEDEVELOPER="true"` set, otherwise the plugin
will be compiled for Linux, Windows, and Darwin ARM64 and x64 architecture every single time. Setting
the `MM_SERVICESETTINGS_ENABLEDEVELOPER` to `true` makes the plugin compile and build only for the OS and architecture
you are building on.

In your Mattermost configuration file, ensure that `PluginSettings.EnableUploads` is set to `true`, and `FileSettings.MaxFileSize` is
set to a large enough value to accept the plugin bundle (eg `256000000`).

### Building the plugin

Run the following command in the plugin repository to prepare a compiled, distributable plugin ZIP file:

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

## How to Release

To trigger a release, follow these steps:

1. **For Patch Release:** Run the following command:
    ```
    make patch
    ```
   This will release a patch change.

2. **For Minor Release:** Run the following command:
    ```
    make minor
    ```
   This will release a minor change.

3. **For Major Release:** Run the following command:
    ```
    make major
    ```
   This will release a major change.

4. **For Patch Release Candidate (RC):** Run the following command:
    ```
    make patch-rc
    ```
   This will release a patch release candidate.

5. **For Minor Release Candidate (RC):** Run the following command:
    ```
    make minor-rc
    ```
   This will release a minor release candidate.

6. **For Major Release Candidate (RC):** Run the following command:
    ```
    make major-rc
    ```
   This will release a major release candidate.
