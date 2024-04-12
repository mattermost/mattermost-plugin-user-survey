package store

import (
	"database/sql"
	"fmt"
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
	mmmodel "github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin/plugintest"
	"github.com/stretchr/testify/mock"
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
func SetupTests(t *testing.T) (*SQLStore, func()) {
	dbType, connectionString, err := prepareNewTestDatabase()
	require.NoError(t, err)

	db, err := sql.Open(dbType, connectionString)
	require.NoError(t, err)

	err = db.Ping()
	require.NoError(t, err)

	mockPluginAPI := mockAPIWithBasicMocks(dbType)

	storeParams := Params{
		DBType:           dbType,
		ConnectionString: connectionString,
		TablePrefix:      "test_" + TablePrefix,
		DB:               db,
		PluginAPI:        mockPluginAPI,
		SkipMigrations:   false,
	}

	sqlStore, err := New(storeParams)
	require.NoError(t, err)

	tearDown := func() {
		err := sqlStore.Shutdown()
		require.NoError(t, err)
	}

	return sqlStore, tearDown
}

func prepareNewTestDatabase() (string, string, error) {
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

	testDBName, err := generateDatabase(dbType, rootConnectionString, rootUsername)
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
		template = "postgres://%s:%s@localhost:%s/%s?sslmode=disable\u0026connect_timeout=10"
	case model.DBTypeMySQL:
		template = "%s:%s@tcp(localhost:%s)/%s?charset=utf8mb4,utf8&writeTimeout=30s"
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

	dbName := "user_survey_testdb_" + utils.NewId()
	if _, err := db.Exec("CREATE DATABASE " + dbName); err != nil {
		return "", fmt.Errorf("failed to create test database, dbType: '%s', connection string: '%s', dbName: %s, err: %w", dbType, rootConnectionString, dbName, err)
	}

	if dbType == model.DBTypeMySQL {
		_, err := db.Exec(fmt.Sprintf("GRANT ALL PRIVILEGES ON %s.* TO %s", dbName, rootUsername))
		if err != nil {
			return "", fmt.Errorf("failed to grant permission on test database to root user, dbType: '%s', connection string: '%s', dbName: %s, err: %w", dbType, rootConnectionString, dbName, err)
		}
	}

	return dbName, nil
}

func mockAPIWithBasicMocks(dbType string) *plugintest.API {
	mockAPI := &plugintest.API{}
	MockLogs(mockAPI)

	// these mocks are required for database migrations to run
	mockAPI.On("KVSetWithOptions", "mutex_user_survey_migration_db_mutex", mock.Anything, mock.Anything).Return(true, nil)

	mmConfig := &mmmodel.Config{
		SqlSettings: mmmodel.SqlSettings{},
	}

	mmConfig.SqlSettings.DriverName = &dbType
	mmConfig.SqlSettings.MaxIdleConns = mmmodel.NewInt(10)
	mmConfig.SqlSettings.MaxOpenConns = mmmodel.NewInt(100)
	mmConfig.SqlSettings.ConnMaxLifetimeMilliseconds = mmmodel.NewInt(3600000)
	mmConfig.SqlSettings.ConnMaxIdleTimeMilliseconds = mmmodel.NewInt(300000)

	mockAPI.On("GetUnsanitizedConfig").Return(mmConfig)

	return mockAPI
}

func MockLogs(mockAPI *plugintest.API) {
	mockAPI.On("LogDebug", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Maybe()
	mockAPI.On("LogInfo", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Maybe()
	mockAPI.On("LogWarn", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Maybe()
	mockAPI.On("LogError", mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything, mock.Anything).Return(nil).Maybe()
}
