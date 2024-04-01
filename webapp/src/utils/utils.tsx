// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// Source: https://www.robots.ox.ac.uk/~adutta/blog/standalone_uuid_generator_in_javascript.html
function uuid() {
    const tempURL = URL.createObjectURL(new Blob());
    const uuid = tempURL.toString();
    URL.revokeObjectURL(tempURL);

    // remove prefix (e.g. blob:null/, blob:www.test.com/, ...)
    return uuid.substring(uuid.lastIndexOf('/') + 1);
}

export default {
    uuid,
};
