// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"path"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
)

const (
	rawResponsePerPage = 500
)

func (a *UserSurveyApp) GenerateSurveyReport(userID, surveyID string) (*os.File, error) {
	reportFilePath, err := a.generateSurveyReport(surveyID)
	if err != nil {
		return nil, errors.Wrapf(err, "GenerateSurveyReport: userID: %s, surveyID: %s", userID, surveyID)
	}

	file, err := os.Open(reportFilePath)
	if err != nil {
		a.api.LogError("GenerateSurveyReport: failed to open survey report zip file for reading", "filePath", reportFilePath, "error", err.Error())
		return nil, errors.Wrapf(err, "GenerateSurveyReport: failed to open survey report zip file for reading, filePath: %s", reportFilePath)
	}

	return file, nil
}

func (a *UserSurveyApp) generateSurveyReport(surveyID string) (string, error) {
	survey, err := a.store.GetSurveysByID(surveyID)
	if err != nil {
		return "", errors.Wrapf(err, "generateSurveyReport: failed to get survey by ID, surveyID: %s", surveyID)
	}

	key := utils.NewID()

	rawResponseCSVFilePath, err := a.generateRawResponseCSV(survey, key)
	if err != nil {
		return "", err
	}

	surveyMetadataFilePath, err := a.generateSurveyMetadataFile(survey, key)
	if err != nil {
		return "", err
	}

	serverMetadataFilePath, err := a.generateServerMetadataFile(key)
	if err != nil {
		return "", err
	}

	zipPath := path.Join(os.TempDir(), "survey_report", key, "survey_report.zip")
	files := []string{rawResponseCSVFilePath, surveyMetadataFilePath, serverMetadataFilePath}
	err = utils.CreateZip(zipPath, files)
	if err != nil {
		a.api.LogError("generateSurveyReport: failed to generate report zip file", "surveyID", surveyID, "error", err.Error())
		return "", errors.Wrapf(err, "generateSurveyReport: failed to generate report zip file, surveyID: %s", surveyID)
	}

	// delete the unneeded files now
	for _, filePath := range files {
		a.api.LogDebug("generateSurveyReport: deleting file", "filePath", filePath)
		err = os.Remove(filePath)
		if err != nil {
			// not a critical error, no need to break
			a.api.LogWarn("generateSurveyReport: failed to delete file path", "filePath", filePath, "error", err.Error())
		}
	}

	return zipPath, nil
}

func (a *UserSurveyApp) generateRawResponseCSV(survey *model.Survey, key string) (string, error) {
	var lastResponseID string

	headers := []string{"User ID", "Submitted At"}
	for _, question := range survey.SurveyQuestions.Questions {
		headers = append(headers, question.Text)
	}

	part := 0
	for {
		// get a page worth of results
		data, err := a.store.GetAllResponses(survey.ID, lastResponseID, rawResponsePerPage)
		if err != nil {
			return "", err
		}

		if len(data) == 0 {
			break
		}

		lastResponseID = data[len(data)-1].ID

		// save them in a temp CSV
		if err := a.saveTempCSVData(key, part, data, survey); err != nil {
			return "", errors.Wrapf(err, "generateRawResponseCSV: surveyID: %s", survey.ID)
		}

		part++

		if len(data) < rawResponsePerPage {
			break
		}
	}

	mergedFilePath, err := a.mergeParts(key, headers, part)
	if err != nil {
		return "", errors.Wrapf(err, "generateRawResponseCSV: failed to merge report parts, surveyID: %s", survey.ID)
	}

	// now that the parts have been merged, we can delete the
	// dir where we were storing the parts
	partDir := path.Join(os.TempDir(), "survey_report", key, "parts")
	a.api.LogDebug("generateRawResponseCSV: deleting the part dir", "partDir", partDir)
	if err := os.RemoveAll(partDir); err != nil {
		a.api.LogError("generateRawResponseCSV: failed to delete part dir", "partDir", partDir, "error", err.Error())
		// no need to break here, this is not a critical error
	}

	return mergedFilePath, nil
}

func (a *UserSurveyApp) saveTempCSVData(key string, part int, surveyResponses []*model.SurveyResponse, survey *model.Survey) error {
	var buf bytes.Buffer
	csvWriter := csv.NewWriter(&buf)

	for _, response := range surveyResponses {
		err := csvWriter.Write(response.ToReportRow(survey.SurveyQuestions.Questions))
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
		return errors.Wrapf(err, "saveTempCSVData: failed to save report part key: %s, part: %d, filePath: %s", key, part, filePath)
	}

	return nil
}

func (a *UserSurveyApp) generateChunkFilePath(key string, partNumber int) string {
	return path.Join(os.TempDir(), "survey_report", key, "parts", "raw_responses", fmt.Sprintf("part_%d.csv", partNumber))
}

func (a *UserSurveyApp) mergeParts(key string, headerRow []string, totalParts int) (string, error) {
	var compiledBuf bytes.Buffer
	compiledCSVWriter := csv.NewWriter(&compiledBuf)

	// writing the header row
	if err := compiledCSVWriter.Write(headerRow); err != nil {
		a.api.LogError("mergeParts: failed to write header row to compiled CSV", "key", key, "headerRow", headerRow, "error", err.Error())
		return "", errors.Wrapf(err, "mergeParts: failed to write header row to compiled CSV, key: %s, headerRow: %v", key, headerRow)
	}

	compiledCSVWriter.Flush()
	if err := compiledCSVWriter.Error(); err != nil {
		a.api.LogError("mergeParts: error occurred while flushing combined CSV writer after writing header row", "error", err.Error())
		return "", errors.Wrap(err, "mergeParts: error occurred while flushing combined CSV writer after writing header row")
	}

	for partNumber := 0; partNumber < totalParts; partNumber++ {
		chunkFilePath := a.generateChunkFilePath(key, partNumber)
		chunk, err := a.readFile(chunkFilePath)
		if err != nil {
			a.api.LogError("mergeParts: failed to read chunk", "key", key, "partNumber", partNumber, "error", err.Error())
			return "", errors.Wrapf(err, "mergeParts: failed to read chunk, key: %s, partNumber: %d", key, partNumber)
		}

		if _, err := compiledBuf.Write(chunk); err != nil {
			a.api.LogError("mergeParts: failed to write chunk to compiled CSV buffer", key, "partNumber", partNumber, "error", err.Error())
			return "", errors.Wrapf(err, "mergeParts: failed to write chunk to compiled CSV buffer, key: %s, partNumber: %d", key, partNumber)
		}
	}

	compiledCSVFilePath := path.Join(os.TempDir(), "survey_report", key, "responses.csv")
	if _, err := a.writeFileLocally(&compiledBuf, compiledCSVFilePath); err != nil {
		a.api.LogError("mergeParts: failed to write compiled CSV file", "filePath", compiledCSVFilePath, "totalParts", totalParts, "error", err.Error())
		return "", errors.Wrapf(err, "mergeParts: failed to write compiled CSV file, filePath: %s totalParts: %d", compiledCSVFilePath, totalParts)
	}

	return compiledCSVFilePath, nil
}

func (a *UserSurveyApp) generateSurveyMetadataFile(survey *model.Survey, key string) (string, error) {
	surveyStat, err := a.store.GetSurveyStat(survey.ID)
	if err != nil {
		return "", errors.Wrapf(err, "generateSurveyMetadataFile: failed to get survey stat for survey, surveyID: %s", survey.ID)
	}
	metadata := surveyStat.ToMetadata()
	jsonData, err := json.MarshalIndent(metadata, "", "\t")
	if err != nil {
		a.api.LogError("generateSurveyMetadataFile: failed to marshal survey stat metadata", "surveyID", survey.ID, "key", key, "error", err.Error())
		return "", errors.Wrapf(err, "generateSurveyMetadataFile: failed to marshal survey stat metadata, surveyID: %s, key: %s", survey.ID, key)
	}

	filePath := path.Join(os.TempDir(), "survey_report", key, "survey_metadata.json")
	file, err := os.Create(filePath)
	if err != nil {
		a.api.LogError("generateSurveyMetadataFile: failed to create metadata JSON file", "surveyID", survey.ID, "key", key, "filePath", filePath, "error", err.Error())
		return "", errors.Wrapf(err, "generateSurveyMetadataFile: failed to create metadata JSON file, surveyID: %s, key: %s, filePath: %s", survey.ID, key, filePath)
	}

	defer file.Close()

	if _, err := file.Write(jsonData); err != nil {
		a.api.LogError("generateSurveyMetadataFile: failed to write data to survey metadata file", "surveyID", survey.ID, "key", key, "filePath", filePath, "error", err.Error())
		return "", errors.Wrapf(err, "generateSurveyMetadataFile: failed to write data to survey metadata file, surveyID: %s, key: %s, filePath: %s", survey.ID, key, filePath)
	}

	return filePath, nil
}

func (a *UserSurveyApp) generateServerMetadataFile(key string) (string, error) {
	fileDir := path.Join(os.TempDir(), "survey_report", key)

	filePath, err := a.apiClient.System.GeneratePacketMetadata(fileDir, nil)
	if err != nil {
		a.api.LogError("generateServerMetadataFile: failed to generate packet metadata", "error", err.Error())
		return "", errors.Wrap(err, "generateServerMetadataFile: failed to generate packet metadata")
	}

	return filePath, nil
}
