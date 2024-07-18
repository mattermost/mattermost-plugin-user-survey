{{- /* you annot add a new colum with not null constraint without a default value */ -}}
{{- /* so, we're adding the column and setting the default value we need to set in existing rows */ -}}
{{- /* then removing the default value from column as its no longer needed */ -}}

{{ addColumnIfNeeded "survey" "team_filter_type" "varchar(128)" "NOT NULL DEFAULT 'exclude_selected'"}}

ALTER TABLE {{.prefix}}survey ALTER COLUMN team_filter_type DROP default;
