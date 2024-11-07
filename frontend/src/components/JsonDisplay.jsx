import React from 'react';

const JsonDisplay = ({ data }) => {
    return (
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

export default JsonDisplay;
