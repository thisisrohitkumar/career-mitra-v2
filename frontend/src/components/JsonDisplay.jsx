import React from 'react';

const JsonDisplay = ({ data, cl }) => {
    return (
        <pre className={cl}>
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

export default JsonDisplay;
