// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
	"github.com/pkg/errors"
	"os"
	"path"
)

const (
	rawResponsePerPage = 500
)

func (a *UserSurveyApp) GenerateSurveyReport(surveyID string) error {
	if err := a.generateRawResponseCSV(surveyID); err != nil {
		return err
	}

	return nil
}

func (a *UserSurveyApp) generateRawResponseCSV(surveyID string) error {
	var lastResponseID string
	key := utils.NewID()

	headers := []string{"User ID", "Submitted At"}

	part := 0
	for {
		// get a page worth of results
		data, err := a.store.GetAllResponses(surveyID, lastResponseID, rawResponsePerPage)
		if err != nil {
			return err
		}

		// save them in a temp CSV
		if err := a.saveTempCSVData(key, part, data); err != nil {
			return errors.Wrapf(err, "generateRawResponseCSV: surveyID: %s", surveyID)
		}

		part++

		if len(data) < rawResponsePerPage {
			break
		}
	}

	if err := a.mergeParts(key, headers, part); err != nil {
		return errors.Wrapf(err, "generateRawResponseCSV: failed to merge report parts, surveyID: %s", surveyID)
	}

	return nil
}

func (a *UserSurveyApp) saveTempCSVData(key string, part int, surveyResponses []*model.SurveyResponse) error {
	var buf bytes.Buffer

	// TODO set important CSV attributes here
	csvWriter := csv.NewWriter(&buf)

	for _, response := range surveyResponses {
		err := csvWriter.Write(response.ToReportRow())
		if err != nil {
			a.api.LogError("saveTempCSVData: failed to write response row to CSV writer", "error", err.Error())
			return errors.Wrap(err, "saveTempCSVData: failed to write response row to CSV writer")
		}
	}

	csvWriter.Flush()
	if err := csvWriter.Error(); err != nil {
		a.api.LogError("saveTempCSVData: csv writer reported some errors after flushing", "error", err.Error())
		return errors.Wrap(err, "saveTempCSVData: csv writer reported some errors after flushing")
	}

	filePath := a.generateChunkFilePath(key, part)
	if _, err := a.writeFileLocally(&buf, filePath); err != nil {
		return errors.Wrapf(err, "saveTempCSVData: failed to save report part key: %s, part: %s, filePath: %s", key, part, filePath)
	}

	return nil
}

func (a *UserSurveyApp) generateChunkFilePath(key string, partNumber int) string {
	return path.Join(os.TempDir(), "survey_report", key, "parts", "raw_responses", fmt.Sprintf("part_%d.csv", partNumber))
}

func (a *UserSurveyApp) mergeParts(key string, headerRow []string, totalParts int) error {
	var compiledBuf bytes.Buffer
	compiledCSVWriter := csv.NewWriter(&compiledBuf)

	// writing the header row
	if err := compiledCSVWriter.Write(headerRow); err != nil {
		a.api.LogError("mergeParts: failed to write header row to compiled CSV", "key", key, "headerRow", headerRow, "error", err.Error())
		return errors.Wrapf(err, "mergeParts: failed to write header row to compiled CSV, key: %s, headerRow: %v", key, headerRow)
	}

	compiledCSVWriter.Flush()
	if err := compiledCSVWriter.Error(); err != nil {
		a.api.LogError("mergeParts: error occurred while flushing combined CSV writer after writing header row", "error", err.Error())
		return errors.Wrap(err, "mergeParts: error occurred while flushing combined CSV writer after writing header row")
	}

	for partNumber := 0; partNumber < totalParts; partNumber++ {
		chunkFilePath := a.generateChunkFilePath(key, partNumber)
		chunk, err := a.readFile(chunkFilePath)
		if err != nil {
			a.api.LogError("mergeParts: failed to read chunk", "key", key, "partNumber", partNumber, "error", err.Error())
			return errors.Wrapf(err, "mergeParts: failed to read chunk, key: %s, partNumber: %d", key, partNumber)
		}

		if _, err := compiledBuf.Write(chunk); err != nil {
			a.api.LogError("mergeParts: failed to write chunk to compiled CSV buffer", key, "partNumber", partNumber, "error", err.Error())
			return errors.Wrapf(err, "mergeParts: failed to write chunk to compiled CSV buffer, key: %s, partNumber: %d", key, partNumber)
		}
	}

	compiledCSVFilePath := path.Join(os.TempDir(), "survey_report", key, "responses.csv")
	if _, err := a.writeFileLocally(&compiledBuf, compiledCSVFilePath); err != nil {
		a.api.LogError("mergeParts: failed to write compiled CSV file", "filePath", compiledCSVFilePath, "totalParts", totalParts, "error", err.Error())
		return errors.Wrapf(err, "mergeParts: failed to write compiled CSV file, filePath: %s totalParts: %d", compiledCSVFilePath, totalParts)
	}

	return nil
}
