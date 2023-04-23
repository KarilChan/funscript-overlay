import React, {FC} from 'react';
import {Box, BoxProps, LinearProgress, LinearProgressProps, Typography} from '@mui/material';

interface IProps extends LinearProgressProps {
    etaSeconds: number | null,
    BoxProps?: Partial<BoxProps>,
}

export const LinearProgressWithEta: FC<IProps> = (
    {etaSeconds, BoxProps: boxProps, ...linearProgressProps}
) => {
    return (
        <Box
            {...boxProps}
            sx={{
                display: 'flex',
                alignItems: 'center',
                ...boxProps?.sx,
            }}
        >
            <Box sx={{width: '100%', mr: 1}}>
                <LinearProgress variant="determinate" {...linearProgressProps} />
            </Box>
            <Box
                sx={{
                    minWidth: 80,
                    visibility: etaSeconds ? 'visible' : 'hidden',
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    {`ETA: ${Math.round(etaSeconds ?? 0)}s`}
                </Typography>
            </Box>
        </Box>
    );
};
