// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import renderer from 'react-test-renderer';

import Button from '../button/button';

describe('Button', () => {
    it('base case', () => {
        const component = renderer.create(
            <Button/>,
        );

        expect(component).toMatchSnapshot();
    });

    it('button with props', () => {
        const component = renderer.create(
            <Button
                text='Hello World!!!'
                type='primary'
                danger={false}
            />,
        );

        expect(component).toMatchSnapshot();
    });
});
