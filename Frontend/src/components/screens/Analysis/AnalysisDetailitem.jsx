import React, {useState} from 'react';
import {ListItem, Typography, Container, Box} from '@mui/material';
import PropTypes from 'prop-types';
import { width } from '@mui/system';

const AnalysisDetailItem = props => {
    const [hovered, setHovered] = useState(false);
    const toggleHover = () => setHovered(!hovered);

    console.log(props)
    return (
        <ListItem
        sx={{
            borderBottom: '2px solid lightgrey'
        }}
        className={hovered ? 'hoverElement hovered' : 'hoverElement'}
        onMouseEnter={toggleHover}
        onMouseLeave={toggleHover}
     
     
        >    
            <Container className='d-flex flex-row p-0'
            sx={{
                margin: '0',
                maxWidth: 'initial !important'
            }}>
                <Box className='d-flex flex-column mt-6 col-6 col-sm-6 me-6'>
                        <Typography
                    className='align-self-start fw-bold px-1'
                    component='span'
                    noWrap
                    fontSize={{
                        md: 14,
                        xs: 12
                    }}
                    sx={{
                        alignItems: 'flex-end'
                    }}
                    >
                            {props.asset}
                    </Typography>
                </Box>
                <Box className='d-flex flex-row-reverse mt-6 col-6 col-sm-6 me-6'>
                    <Typography
                    className='align-self-start fw-bold px-1'
                    component='span'
                    noWrap
                    fontSize={{
                        md: 14,
                        xs: 12
                    }}
                    >
                        {props.percentage} %
                    </Typography>
                </Box>
            </Container>
        </ListItem>
        
    );
}

AnalysisDetailItem.propTypes = {
    asset: PropTypes.string,
    percentage: PropTypes.string,
};

export default AnalysisDetailItem;