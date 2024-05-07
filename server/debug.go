// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package main

import (
	"strings"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/pkg/errors"
)

const (
	resetDataCommand = "resetdata"
)

func (p *Plugin) registerDebugCommands() error {
	err := p.API.RegisterCommand(&model.Command{
		Trigger:      resetDataCommand,
		AutoComplete: false,
	})

	if err != nil {
		p.API.LogError("registerDebugCommands: failed to register reset data command", "error", err.Error())
		return errors.Wrap(err, "registerDebugCommands: failed to register reset data command")
	}

	return nil
}
func (p *Plugin) ExecuteCommand(ctx *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	split := strings.Fields(args.Command)
	if len(split) == 0 {
		return nil, nil
	}

	command := split[0]

	if command == "/"+resetDataCommand {
		return p.executeResetDataCommand(ctx, args)
	}

	return nil, nil
}

func (p *Plugin) executeResetDataCommand(_ *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	p.API.LogWarn("Processing request to reset all user survey data. Requested by user ID: " + args.UserId)

	var message string

	err := p.app.ResetData()
	if err != nil {
		message = err.Error()
	} else {
		message = "Successfully reset survey data"
	}

	return &model.CommandResponse{
		Text: message,
	}, nil
}
