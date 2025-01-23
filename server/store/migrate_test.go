// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package store

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

const testMigrationTimeoutSeconds = 10

func TestMigrations(t *testing.T) {
	tests := []StoreTests{
		testMigration,
	}

	testWithSupportedDatabases(t, tests)
}

func testMigration(t *testing.T, namePrefix string, sqlStore *SQLStore, tearDown func()) {
	t.Run(namePrefix+" Running migration twice shouldn't cause error", func(t *testing.T) {
		defer tearDown()

		// check number of entries in schema migration table.
		// we'll match this row count with new row count after running migrations for the second time
		//nolint: gosec
		query := fmt.Sprintf("SELECT COUNT(version) FROM %sschema_migrations", sqlStore.tablePrefix)
		row := sqlStore.db.QueryRow(query)
		var oldCount int
		err := row.Scan(&oldCount)
		require.NoError(t, err)

		// now ru-run the migrations
		err = sqlStore.Migrate(testMigrationTimeoutSeconds)
		require.NoError(t, err)

		// now lets check the row count again.
		// It should be the same as before.
		newRow := sqlStore.db.QueryRow(query)
		var newCount int
		err = newRow.Scan(&newCount)
		require.NoError(t, err)

		require.Equal(t, oldCount, newCount)
	})
}
