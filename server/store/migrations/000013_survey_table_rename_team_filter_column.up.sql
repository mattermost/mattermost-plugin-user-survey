{{if .postgres}} {{ renameColumnIfNeeded "survey" "excluded_team_ids" "filter_team_ids" "jsonb DEFAULT '[]'::jsonb" }} {{end}}
{{if .mysql}} {{ renameColumnIfNeeded "survey" "excluded_team_ids" "filter_team_ids" "json DEFAULT ('[]')" }} {{end}}
