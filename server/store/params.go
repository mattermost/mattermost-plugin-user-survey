package store

import (
	"database/sql"
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/pkg/errors"
)

type Params struct {
	DBType           string
	ConnectionString string
	TablePrefix      string
	DB               *sql.DB
	PluginAPI        plugin.API
	SkipMigrations   bool
	Driver           plugin.Driver
}

func (p Params) IsValid() error {
	if p.ConnectionString == "" {
		return errors.New("SQLStore Params.IsValid: invalid param: ConnectionString cannot be empty")
	}

	return nil
}
