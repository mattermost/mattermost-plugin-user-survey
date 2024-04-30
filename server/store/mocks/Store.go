// Code generated by mockery v2.42.3. DO NOT EDIT.

// Regenerate this file using make mocks

package mocks

import (
	sql "database/sql"

	model "github.com/mattermost/mattermost-plugin-user-survey/server/model"
	mock "github.com/stretchr/testify/mock"

	template "text/template"
)

// Store is an autogenerated mock type for the Store type
type Store struct {
	mock.Mock
}

// GetSchemaName provides a mock function with given fields:
func (_m *Store) GetSchemaName() (string, error) {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for GetSchemaName")
	}

	var r0 string
	var r1 error
	if rf, ok := ret.Get(0).(func() (string, error)); ok {
		return rf()
	}
	if rf, ok := ret.Get(0).(func() string); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(string)
	}

	if rf, ok := ret.Get(1).(func() error); ok {
		r1 = rf()
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetSurveyResponse provides a mock function with given fields: userID, surveyID
func (_m *Store) GetSurveyResponse(userID string, surveyID string) (*model.SurveyResponse, error) {
	ret := _m.Called(userID, surveyID)

	if len(ret) == 0 {
		panic("no return value specified for GetSurveyResponse")
	}

	var r0 *model.SurveyResponse
	var r1 error
	if rf, ok := ret.Get(0).(func(string, string) (*model.SurveyResponse, error)); ok {
		return rf(userID, surveyID)
	}
	if rf, ok := ret.Get(0).(func(string, string) *model.SurveyResponse); ok {
		r0 = rf(userID, surveyID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*model.SurveyResponse)
		}
	}

	if rf, ok := ret.Get(1).(func(string, string) error); ok {
		r1 = rf(userID, surveyID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetSurveysByStatus provides a mock function with given fields: status
func (_m *Store) GetSurveysByStatus(status string) ([]*model.Survey, error) {
	ret := _m.Called(status)

	if len(ret) == 0 {
		panic("no return value specified for GetSurveysByStatus")
	}

	var r0 []*model.Survey
	var r1 error
	if rf, ok := ret.Get(0).(func(string) ([]*model.Survey, error)); ok {
		return rf(status)
	}
	if rf, ok := ret.Get(0).(func(string) []*model.Survey); ok {
		r0 = rf(status)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*model.Survey)
		}
	}

	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(status)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetTemplateHelperFuncs provides a mock function with given fields:
func (_m *Store) GetTemplateHelperFuncs() template.FuncMap {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for GetTemplateHelperFuncs")
	}

	var r0 template.FuncMap
	if rf, ok := ret.Get(0).(func() template.FuncMap); ok {
		r0 = rf()
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(template.FuncMap)
		}
	}

	return r0
}

// Migrate provides a mock function with given fields:
func (_m *Store) Migrate() error {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for Migrate")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func() error); ok {
		r0 = rf()
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveSurvey provides a mock function with given fields: survey
func (_m *Store) SaveSurvey(survey *model.Survey) error {
	ret := _m.Called(survey)

	if len(ret) == 0 {
		panic("no return value specified for SaveSurvey")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(*model.Survey) error); ok {
		r0 = rf(survey)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SaveSurveyResponse provides a mock function with given fields: response
func (_m *Store) SaveSurveyResponse(response *model.SurveyResponse) error {
	ret := _m.Called(response)

	if len(ret) == 0 {
		panic("no return value specified for SaveSurveyResponse")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(*model.SurveyResponse) error); ok {
		r0 = rf(response)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Shutdown provides a mock function with given fields:
func (_m *Store) Shutdown() error {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for Shutdown")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func() error); ok {
		r0 = rf()
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// SurveysFromRows provides a mock function with given fields: rows
func (_m *Store) SurveysFromRows(rows *sql.Rows) ([]*model.Survey, error) {
	ret := _m.Called(rows)

	if len(ret) == 0 {
		panic("no return value specified for SurveysFromRows")
	}

	var r0 []*model.Survey
	var r1 error
	if rf, ok := ret.Get(0).(func(*sql.Rows) ([]*model.Survey, error)); ok {
		return rf(rows)
	}
	if rf, ok := ret.Get(0).(func(*sql.Rows) []*model.Survey); ok {
		r0 = rf(rows)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*model.Survey)
		}
	}

	if rf, ok := ret.Get(1).(func(*sql.Rows) error); ok {
		r1 = rf(rows)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// UpdateSurveyResponse provides a mock function with given fields: response
func (_m *Store) UpdateSurveyResponse(response *model.SurveyResponse) error {
	ret := _m.Called(response)

	if len(ret) == 0 {
		panic("no return value specified for UpdateSurveyResponse")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(*model.SurveyResponse) error); ok {
		r0 = rf(response)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// UpdateSurveyStatus provides a mock function with given fields: surveyID, status
func (_m *Store) UpdateSurveyStatus(surveyID string, status string) error {
	ret := _m.Called(surveyID, status)

	if len(ret) == 0 {
		panic("no return value specified for UpdateSurveyStatus")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(string, string) error); ok {
		r0 = rf(surveyID, status)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// NewStore creates a new instance of Store. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewStore(t interface {
	mock.TestingT
	Cleanup(func())
}) *Store {
	mock := &Store{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
