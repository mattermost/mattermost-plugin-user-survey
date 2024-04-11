package store

import (
	"database/sql"
	"fmt"
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
	"github.com/mattermost/mattermost/server/public/plugin/plugintest"
	"github.com/stretchr/testify/require"
	"os"
	"strings"
	"testing"
)

const (
	testEnvVarPrefix = "USER_SURVEY_TEST_"
)

// SetupTests initializes test database. It creates the test database,
// runs all the migrations and generates a tearDown function.
// Returns the generated sqlstore instance and a tear down function.
func SetupTests(t *testing.T) (SQLStore, func()) {
	dbType, connectionString, err := prepareNewTestDatabase()
	require.NoError(t, err)

	db, err := sql.Open(dbType, connectionString)
	require.NoError(t, err)

	err = db.Ping()
	require.NoError(t, err)

	storeParams := Params{
		DBType:           dbType,
		ConnectionString: connectionString,
		TablePrefix:      "test_" + TablePrefix,
		DB:               db,
		PluginAPI:        &plugintest.API{},
		SkipMigrations:   false,
	}

	sqlStore, err := New(storeParams)
	require.NoError(t, err)

	tearDown := func() {
		err := sqlStore.shut
	}
}

func prepareNewTestDatabase() (string, string, error) {
	var dbName string

	dbType := strings.TrimSpace(os.Getenv(testEnvVarPrefix + "DB_TYPE"))
	if dbType == "" {
		dbType = model.DBTypePostgres
	}
	port := strings.TrimSpace(os.Getenv(testEnvVarPrefix + "DATABASE_PORT"))

	rootUsername := strings.TrimSpace(os.Getenv(testEnvVarPrefix + "ROOT_USERNAME"))
	rootPassword := strings.TrimSpace(os.Getenv(testEnvVarPrefix + "ROOT_PASSWORD"))

	testUsername := strings.TrimSpace(os.Getenv(testEnvVarPrefix + "TEST_USERNAME"))
	testPassword := strings.TrimSpace(os.Getenv(testEnvVarPrefix + "TEST_PASSWORD"))

	rootConnectionString, err := generateConnectionString(dbType, rootUsername, rootPassword, port, "")
	if err != nil {
		return "", "", err
	}

	testDBName, err := generateDatabase(dbName, rootConnectionString, rootUsername)
	if err != nil {
		return "", "", err
	}

	testConnectionString, err := generateConnectionString(dbType, testUsername, testPassword, port, testDBName)
	if err != nil {
		return "", "", err
	}

	return dbType, testConnectionString, nil
}

func generateConnectionString(dbType, username, password, port, dbName string) (string, error) {
	var template string

	switch dbType {
	case model.DBTypePostgres:
		template = "%s:%s@tcp(localhost:%s)/%s?charset=utf8mb4,utf8&writeTimeout=30s"
	case model.DBTypeMySQL:
		template = "postgres://%s:%s@localhost:%s/%s?sslmode=disable\u0026connect_timeout=10"
	default:
		return "", fmt.Errorf("invalid database type encountered, dbType: '%s'", dbType)
	}

	return fmt.Sprintf(template, username, password, port, dbName), nil
}

func generateDatabase(dbType, rootConnectionString, rootUsername string) (string, error) {
	db, err := sql.Open(dbType, rootConnectionString)
	if err != nil {
		return "", fmt.Errorf("failed to connect to dataabse, dbType: '%s', connection string: '%s', err: %w", dbType, rootConnectionString, err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		return "", fmt.Errorf("failed to ping database after connecting to it, dbType: '%s', connection string: '%s', err: %w", dbType, rootConnectionString, err)
	}

	dbName := "testdb_" + utils.NewId()
	if _, err := db.Exec("CREATE DATABASE " + dbName); err != nil {
		return "", fmt.Errorf("failed to create test database, dbType: '%s', connection string: '%s', dbName: %s, err: %w", dbType, rootConnectionString, dbName, err)
	}

	if dbType == model.DBTypeMySQL {
		_, err := db.Exec(fmt.Sprintf("GRANT ALL PRIVILEGES ON %S.* TO %S", dbName, rootUsername))
		if err != nil {
			return "", fmt.Errorf("failed to grant permission on test database to root user, dbType: '%s', connection string: '%s', dbName: %s, err: %w", dbType, rootConnectionString, dbName, err)
		}
	}

	return dbName, nil
}
