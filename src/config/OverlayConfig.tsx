import React, {FC, useEffect, useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle, InputAdornment,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText, Switch,
    TextField
} from '@mui/material';
import {ClientConfigKey, ClientConfigType, useClientConfig} from './useClientConfig';
import {clientConfig} from './clientConfig';
import ErrorIcon from '@mui/icons-material/Error';

interface IProps {
    open: boolean,
    onClose: () => void,
}

interface IConfigEntry<K extends ClientConfigKey> {
    configKey: K,
    primaryText: string,
    secondaryText: string,
    input: FC<{
        value: ClientConfigType<K>,
        onChange: (value: ClientConfigType<K>) => void,
        hasErrors: boolean,
    }>,
    validate?: (value: ClientConfigType<K>) => boolean,
    cast?: (value: unknown) => ClientConfigType<K>,
}


const configEntries: IConfigEntry<ClientConfigKey>[] = [
    {
        configKey: 'overlay.speed.max',
        primaryText: 'Max acceptable speed',
        secondaryText: '0 means no limit',
        input: p => (
            <TextField
                value={p.value}
                onChange={e => p.onChange(e.target.value)}
                autoComplete={'off'}
                error={p.hasErrors}
                sx={{width: 120}}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {p.value === 0 ? 'disabled' : 'units/s'}
                        </InputAdornment>
                    ),
                }}
            />
        ),
        validate: v => v >= 0 && v < 1000,
        cast: Number,
    },
    {
        configKey: 'overlay.speed.min',
        primaryText: 'Min acceptable speed',
        secondaryText: '0 means no limit',
        input: p => (
            <TextField
                value={p.value}
                onChange={e => p.onChange(e.target.value)}
                autoComplete={'off'}
                error={p.hasErrors}
                sx={{width: 120}}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {p.value === 0 ? 'disabled' : 'units/s'}
                        </InputAdornment>
                    ),
                }}
            />
        ),
        validate: v => v >= 0 && v < 1000,
        cast: Number,
    },
    {
        configKey: 'overlay.tolerance',
        primaryText: 'Tolerance',
        secondaryText: '0-1, higher value allows more fluctuations in speed',
        input: p => (
            <TextField
                value={p.value}
                autoComplete={'off'}
                onChange={e => p.onChange(e.target.value)}
                error={p.hasErrors}
                sx={{width: 100}}
            />
        ),
        validate: v => v >= 0 && v <= 1,
        cast: Number,
    },
    {
        configKey: 'overlay.searchAheadMs',
        primaryText: 'Search ahead time',
        secondaryText: 'For example, 5000 means that all actions within the next 5 seconds will be used to calculate the status',
        input: p => (
            <TextField
                value={p.value}
                autoComplete={'off'}
                onChange={e => p.onChange(e.target.value)}
                error={p.hasErrors}
                sx={{width: 120}}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            ms
                        </InputAdornment>
                    ),
                }}
            />
        ),
        validate: v => v >= 100 && v <= 60000,
        cast: Number,
    },
    {
        configKey: 'overlay.refreshRateMs',
        primaryText: 'Refresh rate',
        secondaryText: 'How often is the overlay updated',
        input: p => (
            <TextField
                value={p.value}
                onChange={e => p.onChange(e.target.value)}
                autoComplete={'off'}
                error={p.hasErrors}
                sx={{width: 120}}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            ms
                        </InputAdornment>
                    ),
                }}
            />
        ),
        validate: v => v >= 100 && v <= 10000,
        cast: Number,
    },
    {
        configKey: 'overlay.text.safe',
        primaryText: 'Safe text',
        secondaryText: 'Text to display when the speed is acceptable',
        input: p => (
            <TextField
                sx={{width: 100}}
                value={p.value}
                onChange={e => p.onChange(e.target.value)}
                autoComplete={'off'}
            />
        ),
    },
    {
        configKey: 'overlay.text.warn',
        primaryText: 'Warning text',
        secondaryText: 'Text to display for unacceptable speed',
        input: p => (
            <TextField
                sx={{width: 100}}
                value={p.value}
                onChange={e => p.onChange(e.target.value)}
                autoComplete={'off'}
            />
        ),
    },
    {
        configKey: 'overlay.isDebugMode',
        primaryText: 'Debug mode',
        secondaryText: 'Display actual avg speed and tolerance points instead of safe/warn text',
        input: p => (
            <Switch
                checked={!!p.value}
                onChange={e => p.onChange(e.target.checked)}
                color={'primary'}
            />
        ),
        cast: Boolean,
    },
];

const OverlayConfigEntry = <K extends ClientConfigKey>(props: IConfigEntry<K>) => {
    const [configValue, setConfigValue] = useClientConfig(props.configKey);
    const [value, setValue] = useState(configValue);

    const hasErrors: boolean = !!props.validate && !props.validate(value);

    useEffect(() => {
        if (hasErrors) {
            return;
        }

        const casted = props.cast ? props.cast(value) : value;
        setConfigValue(casted);
    }, [value]);

    return (
        <ListItem>
            <ListItemText
                primary={props.primaryText}
                secondary={props.secondaryText}
                secondaryTypographyProps={{style: {width: '80%'}}} // Prevent overlapping with input
            />
            <ListItemSecondaryAction>
                {props.input({
                    value,
                    onChange: setValue,
                    hasErrors,
                })}
            </ListItemSecondaryAction>
        </ListItem>
    );
};
export const OverlayConfig: FC<IProps> = props => {
    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            fullWidth
            maxWidth={'sm'}
        >
            <DialogTitle>Overlay Config</DialogTitle>
            <DialogContent>
                <List>
                    {configEntries.map(entry => (
                        <OverlayConfigEntry
                            key={entry.configKey}
                            {...entry}
                        />
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
};