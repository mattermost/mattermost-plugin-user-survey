// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package main

import (
	"time"

	"github.com/mattermost/mattermost/server/public/pluginapi/cluster"
	"github.com/pkg/errors"
)

const (
	jobKeyStartSurveyJob = "job_start_survey"

	debugStartSurveyJobInterval = 15 * time.Second
	startSurveyJobInterval      = 15 * time.Minute

	LockExpiration = time.Hour
)

func (p *Plugin) startManageSurveyJob() error {
	interval := startSurveyJobInterval
	if DebugBuild == "true" {
		interval = debugStartSurveyJobInterval
	}

	job, err := cluster.Schedule(
		p.API,
		jobKeyStartSurveyJob,
		cluster.MakeWaitForInterval(interval),
		func() {
			_ = p.app.JobManageSurveyStatus()
		},
	)

	if err != nil {
		return errors.Wrap(err, "failed to schedule survey start job")
	}

	p.jobs = append(p.jobs, job)
	return nil
}
