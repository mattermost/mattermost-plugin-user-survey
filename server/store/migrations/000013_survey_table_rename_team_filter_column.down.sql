{{if .postgres}} {{ renameColumnIfNeeded "survey" "filter_team_ids" "excluded_team_ids" "jsonb DEFAULT '[]'::jsonb" }} {{end}}
{{if .mysql}} {{ renameColumnIfNeeded "survey" "filter_team_ids" "excluded_team_ids" "json DEFAULT ('[]')" }} {{end}}
