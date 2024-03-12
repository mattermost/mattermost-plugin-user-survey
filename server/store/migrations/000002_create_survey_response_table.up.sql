CREATE TABLE IF NOT EXISTS {{.prefix}}survey_responses (
	id VARCHAR(26) UNIQUE NOT NULL,
    user_id VARCHAR(26) NOT NULL,
    survey_id VARCHAR(26) NOT NULL,
    {{if .postgres}}response jsonb DEFAULT '{}'::jsonb,{{end}}
    {{if .mysql}}response json DEFAULT ('{}'),{{end}}
    PRIMARY KEY (id),
    CONSTRAINT single_user_response_per_survey UNIQUE (user_id, survey_id)
) {{if .mysql}}DEFAULT CHARACTER SET utf8mb4{{end}};
