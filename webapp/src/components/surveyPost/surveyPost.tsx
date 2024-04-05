// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useState} from 'react';

import './style.scss';
import LinearScaleQuestion from 'components/surveyPost/linearScaleQuestion/linearScaleQuestion';
import type {Question} from 'components/systemConsole/questions/questions';

import type {CustomPostTypeComponentProps, MattermostWindow, SurveyQuestionsConfig} from 'types/mattermost-webapp';
import TextQuestion from 'components/surveyPost/textQuestion/textQuestion';

function SurveyPost(props: CustomPostTypeComponentProps) {
    console.log(props);
    const {post, isRHS} = props;

    const [surveyQuestions, setSurveyQuestions] = useState<Question[]>([]);

    useEffect(() => {
        const surveyJSON = post.props?.surveyQuestions as string;
        if (surveyJSON) {
            setSurveyQuestions(JSON.parse(surveyJSON));
        }
    }, [post.props?.surveyQuestions]);

    const renderedMessage = useMemo(() => {
        // @ts-expect-error window is definitely MattermostWindow in plugins
        const mmWindow = window as MattermostWindow;
        const htmlString = mmWindow.PostUtils.formatText(post.message, {markdown: true});
        return mmWindow.PostUtils.messageHtmlToComponent(htmlString, isRHS);
    }, [post.message, isRHS]);

    const renderQuestions = useMemo(() => {
        return surveyQuestions.map((question) => {
            let questionComponent: React.ReactNode;

            switch (question.type) {
            case 'linear_scale':
                questionComponent = <LinearScaleQuestion question={question}/>;
                break;
            case 'text':
                questionComponent = <TextQuestion question={question}/>;
                break;
            }

            return (
                <div
                    key={question.id}
                    className='question'
                >
                    {questionComponent}
                </div>
            );
        });
    }, [surveyQuestions]);

    return (
        <div className='CustomSurveyPost vertical'>
            {renderedMessage}

            <div className='CustomSurveyPost_survey'>
                {renderQuestions}
            </div>
        </div>
    );
}

export default SurveyPost;
