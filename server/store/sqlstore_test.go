package store

import (
	"context"
	"database/sql"
	"log"
	"testing"
	"time"

	sqlUtils "github.com/mattermost/mattermost/server/public/utils/sql"

	mmmodel "github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin/plugintest"
	"github.com/pkg/errors"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/mysql"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

var (
	// databaseTypes = []string{model.DBTypePostgres, model.DBTypeMySQL}
	databaseTypes = []string{model.DBTypeMySQL}
)

type StoreTests func(t *testing.T, namePrefix string, sqlStore *SQLStore, tearDown func())

func SetupTests(t *testing.T, dbType string) (*SQLStore, func()) {
	var connectionString string
	var tearDown func()
	var err error

	switch dbType {
	case model.DBTypePostgres:
		connectionString, tearDown, err = preparePostgresDatabase()
	case model.DBTypeMySQL:
		connectionString, tearDown, err = prepareMySQLDatabase()
	default:
		t.Fatalf("Unknown database type encountered: " + dbType)
	}

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
	return sqlStore, tearDown
}

func testWithSupportedDatabases(t *testing.T, tests []StoreTests) {
	for _, dbType := range databaseTypes {
		sqlStore, tearDown := SetupTests(t, dbType)

		for _, test := range tests {
			t.Run(dbType, func(_ *testing.T) {
				test(t, dbType, sqlStore, tearDown)
			})
		}
	}
}

func preparePostgresDatabase() (string, func(), error) {
	ctx := context.Background()
	container, err := postgres.RunContainer(ctx,
		testcontainers.WithImage("docker.io/postgres:15.2-alpine"),
		postgres.WithUsername("username"),
		postgres.WithPassword("password"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(5*time.Second)),
	)

	if err != nil {
		return "", nil, errors.Wrap(err, "failed to create Postgres test container")
	}

	container.MustConnectionString(ctx, "sslmode=disable")
	connectionString, err := container.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		return "", nil, errors.Wrap(err, "failed to generate Postgres connection string")
	}

	tearDown := func() {
		if err := container.Terminate(ctx); err != nil {
			log.Fatalf("failed to terminate container: %s", err.Error())
		}
	}

	return connectionString, tearDown, nil
}

func prepareMySQLDatabase() (string, func(), error) {
	ctx := context.Background()
	container, err := mysql.RunContainer(ctx,
		testcontainers.WithImage("mysql:8.0.32"),
		mysql.WithUsername("username"),
		mysql.WithPassword("password"),
	)

	if err != nil {
		return "", nil, errors.Wrap(err, "failed to create MySQL test container")
	}

	connectionString, err := container.ConnectionString(ctx)
	if err != nil {
		return "", nil, errors.Wrap(err, "failed to generate MySQL connection string")
	}

	connectionString, err = sqlUtils.AppendMultipleStatementsFlag(connectionString)
	if err != nil {
		return "", nil, errors.Wrap(err, "failed to append multi statement flag to MySQL connection string")
	}

	tearDown := func() {
		if err := container.Terminate(ctx); err != nil {
			log.Fatalf("failed to terminate container: %s", err.Error())
		}
	}

	return connectionString, tearDown, nil
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
