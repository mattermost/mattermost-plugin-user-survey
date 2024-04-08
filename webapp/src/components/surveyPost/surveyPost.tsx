// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import './style.scss';
import LinearScaleQuestion from 'components/surveyPost/linearScaleQuestion/linearScaleQuestion';
import TextQuestion from 'components/surveyPost/textQuestion/textQuestion';
import type {Question} from 'components/systemConsole/questions/questions';

import type {CustomPostTypeComponentProps, MattermostWindow} from 'types/mattermost-webapp';
import Button from 'components/common/button/button';

function SurveyPost(props: CustomPostTypeComponentProps) {
    const {post, isRHS} = props;

    const [surveyQuestions, setSurveyQuestions] = useState<Question[]>([]);
    const [locked, setLocked] = useState<boolean>(false);

    useEffect(() => {
        setSurveyQuestions([
            {
                id: '49fc9a85-b4d8-424e-b13f-40344b168123',
                mandatory: true,
                system: true,
                text: 'How likely are you to recommend Mattermost?',
                type: 'linear_scale',
            },
            {
                id: 'aa026055-c97c-48d7-a025-c44590078963',
                mandatory: true,
                system: true,
                text: 'How can we make your experience better?',
                type: 'text',
            },
            {
                id: '0eee4429-5083-41ef-bda7-2ee9c5ece929',
                mandatory: false,
                system: false,
                text: 'option question text',
                type: 'text',
            },
        ]);
    }, []);

    const submitSurveyHandler = useCallback(() => {
        if (locked) {
            return;
        }

        // make API call here...
        setLocked(true);
    }, []);

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

            <div className={`CustomSurveyPost_survey vertica ${locked ? 'locked' : ''}`}>
                <div className='questions'>
                    {renderQuestions}
                </div>
                <div>
                    <Button
                        text='Submit'
                        type='primary'
                        disabled={locked}
                        onClick={submitSurveyHandler}
                    />
                </div>
            </div>
        </div>
    );
}

export default SurveyPost;
