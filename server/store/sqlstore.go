package store

import (
	"database/sql"
	"net/url"

	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/mattermost/mattermost/server/public/pluginapi/cluster"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

const (
	TablePrefix = "user_survey_"
)

type SQLStore struct {
	db               *sql.DB
	dbType           string
	tablePrefix      string
	connectionString string
	pluginAPI        plugin.API
	isBinaryParams   bool
	skipMigrations   bool
}

func New(params Params) (*SQLStore, error) {
	if err := params.IsValid(); err != nil {
		return nil, err
	}

	params.PluginAPI.LogInfo("initializing SQLStore...")
	store := &SQLStore{
		db:               params.DB,
		dbType:           params.DBType,
		tablePrefix:      params.TablePrefix,
		connectionString: params.ConnectionString,
		pluginAPI:        params.PluginAPI,
		skipMigrations:   params.SkipMigrations,
	}

	var err error

	store.isBinaryParams, err = store.checkBinaryParams()
	if err != nil {
		return nil, err
	}

	if !store.skipMigrations {
		if err := store.Migrate(); err != nil {
			params.PluginAPI.LogError(`Table creation / migration failed`, "error", err.Error())
			return nil, err
		}
	}

	return store, nil
}

func (s *SQLStore) checkBinaryParams() (bool, error) {
	if s.dbType != model.DBTypePostgres {
		return false, nil
	}

	parsedURL, err := url.Parse(s.connectionString)
	if err != nil {
		s.pluginAPI.LogError("failed to parse database connection string URL", "error", err.Error())
		return false, err
	}

	return parsedURL.Query().Get("binary_parameters") == "yes", nil
}

func (s *SQLStore) newMutex(name string) (*cluster.Mutex, error) {
	return cluster.NewMutex(s.pluginAPI, name)
}

func (s *SQLStore) Shutdown() error {
	return s.db.Close()
}
