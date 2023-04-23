export const clientConfig = {
    'theme.darkMode': {
        defaultValue: (
            window.matchMedia
            && window.matchMedia('(prefers-color-scheme: dark)').matches
        ) as boolean,
    },
    'overlay.speed.min': {
        defaultValue: 120 as number,
    },
    'overlay.speed.max': {
        defaultValue: 300 as number,
    },
    'overlay.position.x': {
        defaultValue: 'left' as 'left' | 'center' | 'right',
    },
    'overlay.position.y': {
        defaultValue: 'bottom' as 'top' | 'center' | 'bottom',
    },
    'overlay.searchAheadMs': {
        defaultValue: 10000 as number,
    },
    'overlay.text.safe': {
        defaultValue: '' as string,
    },
    'overlay.text.warn': {
        defaultValue: 'X' as string,
    },
    'overlay.refreshRateMs': {
        defaultValue: 500 as number,
    },
    'overlay.tolerance': {
        defaultValue: 0.1 as number,
    },
    'overlay.isDebugMode': {
        defaultValue: false as boolean,
    }
} as const;
