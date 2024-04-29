{{ addConstraintIfNeeded "survey_responses" "unique_user_survey_response" "UNIQUE" "UNIQUE(user_id, survey_id)" }}
