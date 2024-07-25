import { Typography } from '@mui/material';
import React from 'react';
import {Link} from 'react-router-dom';

const NotLoggedIn = () => {
    return (
        <div>
            <h3>
                There is no user currently signed in. Please proceed to <Link to="/">   Sign In </Link>
            </h3>
        </div>
    )
}

export default NotLoggedIn