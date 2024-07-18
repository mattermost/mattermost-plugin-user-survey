{{ addColumnIfNeeded "survey" "team_filter_type" "varchar(128)" "NOT NULL DEFAULT 'exclude_selected'"}}

ALTER TABLE {{.prefix}}survey ALTER COLUMN team_filter_type DROP default;
