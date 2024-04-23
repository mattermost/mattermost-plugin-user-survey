// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package main

import (
	"github.com/mattermost/mattermost/server/public/pluginapi/cluster"
	"github.com/pkg/errors"
	"time"
)

const (
	jobKeyStartSurveyJob = "job_start_survey"

	// TODO - update this to 15 minutes once ready for production
	startSurveyJonInterval = 15 * time.Second
)

func (p *Plugin) startScheduledJobs() error {
	if err := p.startSurveyStartJob(); err != nil {
		return err
	}

	return nil
}

func (p *Plugin) startSurveyStartJob() error {
	job, err := cluster.Schedule(
		p.API,
		jobKeyStartSurveyJob,
		cluster.MakeWaitForInterval(startSurveyJonInterval),
		p.app.JobManageSurveyStatus,
	)

	if err != nil {
		return errors.Wrap(err, "failed to schedule survey start job")
	}

	p.jobs = append(p.jobs, job)
	return nil
}
