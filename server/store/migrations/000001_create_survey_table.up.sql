CREATE TABLE IF NOT EXISTS {{.prefix}}survey (
    id VARCHAR(26) UNIQUE NOT NULL,
    {{if .postgres}}excluded_team_ids jsonb DEFAULT '[]'::jsonb,{{end}}
    {{if .mysql}}excluded_team_ids json DEFAULT ('[]'),{{end}}
    create_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    start_time BIGINT NOT NULL,
    duration INT NOT NULL,
    {{if .postgres}}questions jsonb DEFAULT '[]'::jsonb,{{end}}
    {{if .mysql}}questions json DEFAULT ('[]'),{{end}}
    PRIMARY KEY (id)
) {{if .mysql}}DEFAULT CHARACTER SET utf8mb4{{end}};
