import React, {FC, useContext, useEffect, useState} from 'react';
import {
    Button,
    Container,
    IconButton,
    Paper,
    Stack,
    styled, Tooltip,
    useTheme
} from '@mui/material';
import {createFFmpeg, fetchFile, LogCallback} from '@ffmpeg/ffmpeg';
import {saveAs} from 'file-saver';
import Notify from './services/notistack/SnackbarUtilsConfigurator';
import TheatersIcon from '@mui/icons-material/Theaters';
import TimelineIcon from '@mui/icons-material/Timeline';
import {Funscript} from 'funscript-utils/lib/types';
import {getVideoLengthMs} from './utils/getVideoLengthMs';
import {extractVideoFramerate} from './services/ffmpeg/extractVideoFramerate';
import {LinearProgressWithEta} from './services/mui/LinearProgressWithEta';
import {extractProcessingFps} from './services/ffmpeg/extractProcessingFps';
import {extractCurrentFrame} from './services/ffmpeg/extractCurrentFrame';
import {getFunscriptFromString} from 'funscript-utils/lib/funConverter';
import {useClientConfig} from './config/useClientConfig';
import {ConverterContext} from './ConverterContext';
import SettingsIcon from '@mui/icons-material/Settings';
import {OverlayConfig} from './config/OverlayConfig';

const UploadButtonText = styled('span')(() => ({
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
}));

export const Converter: FC = () => {
    const [video, setVideo] = useState<File | null>(null);
    const [videoFramerate, setVideoFramerate] = useState<number | null>(null);

    const {
        script,
        setScript,
        toSrt,
    } = useContext(ConverterContext);

    const [videoLength, setVideoLength] = useState<number | null>(null);

    const [scriptName, setScriptName] = useState<string | null>(null);

    const [subtitleFont, setSubtitleFont] = useState<Uint8Array | null>(null);

    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [convertProgress, setConvertProgress] = useState<number>(0);
    const [processingFps, setProcessingFps] = useState<number | null>(null);
    const [currentFrame, setCurrentFrame] = useState<number | null>(null);

    const [stdout, setStdout] = useState<string[]>([]);
    const stdoutRef = React.useRef<HTMLPreElement>(null);

    const [configOpen, setConfigOpen] = useState(false);

    const theme = useTheme();

    useEffect(() => {
        if (stdoutRef.current) {
            stdoutRef.current.scrollTop = stdoutRef.current.scrollHeight;
        }
    }, [stdout]);

    useEffect(() => {
        if (video) {
            getVideoLengthMs(video).then(setVideoLength);
        }
    }, [video]);

    useEffect(() => {
        fetchSubtitleFont().catch(e => {
            console.error(e);
            Notify.error('Failed to fetch subtitle font');
        });
    }, []);

    const fetchSubtitleFont = async () => {
        const font = await fetch('/fonts/Arial.ttf');
        setSubtitleFont(new Uint8Array(await font.arrayBuffer()));
    };

    const ffmpegOutputCallback = (out: Parameters<LogCallback>[0]): void => {
        setStdout(oldStdout => [...oldStdout, `${out.type}: ${out.message}`]);

        // Some messages could be used to calculate the ETA
        const framerate = extractVideoFramerate(out);
        if (framerate) {
            setVideoFramerate(framerate);
        }

        const fps = extractProcessingFps(out);
        if (fps) {
            setProcessingFps(fps);
        }

        const frame = extractCurrentFrame(out);
        if (frame) {
            setCurrentFrame(frame);
        }
    };

    const encodeVideo = async () => {
        if (!hasRequiredFiles) {
            console.error('This should not happen');
            return;
        }

        setStdout([]);
        const ffmpeg = createFFmpeg();
        ffmpeg.setLogger(ffmpegOutputCallback);
        ffmpeg.setProgress(({ratio}) => {
            setConvertProgress(ratio * 100);
        });
        await ffmpeg.load();
        ffmpeg.FS('writeFile', 'input', await fetchFile(video));
        ffmpeg.FS('writeFile', 'subtitle.srt', toSrt());
        ffmpeg.FS('writeFile', 'tmp/arial', subtitleFont);
        await ffmpeg.run(
            '-i', 'input',
            '-vf', 'subtitles=subtitle.srt:fontsdir=/tmp:force_style=\'Fontname=Arial\'',
            'output.mp4'
        );
        const data = ffmpeg.FS('readFile', 'output.mp4');
        const blob = new Blob([data], {
            type: 'video/mp4'
        });
        saveAs(blob, 'output.mp4');
        ffmpeg.exit();
    };

    const downloadSrt = () => {
        const blob = new Blob([toSrt()], {
            type: 'text/plain'
        });
        saveAs(blob, 'overlay.srt');
    };

    const hasRequiredFiles = !!video && !!script && !!subtitleFont;

    const getEtaInSeconds = (): number | null => {
        if (processingFps && currentFrame && videoLength && videoFramerate) {
            return ((videoLength / 1000) * videoFramerate - currentFrame) / processingFps;
        }

        return null;
    };

    const convertButton = (
        <Button
            onClick={() => {
                setIsConverting(true);
                encodeVideo().catch((e) => {
                    Notify.error('Failed to convert');
                    console.log(e);
                }).finally(() => {
                    setIsConverting(false);
                });
            }}
            disabled={!hasRequiredFiles || isConverting}
            variant={'contained'}
        >
            {isConverting ? 'Converting' : 'Convert Video (slow)'}
        </Button>
    );
    return (
        <Container>
            <div>
                <h1>Layout</h1>
            </div>
            <Paper sx={{p: 2, mb: 2}}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Button
                        variant={script ? 'outlined' : 'contained'}
                        component="label"
                        startIcon={<TimelineIcon/>}
                        disabled={isConverting}
                    >
                        <UploadButtonText>
                            {scriptName ?? 'Pick Script'}
                        </UploadButtonText>
                        <input
                            hidden
                            accept=".funscript"
                            type="file"
                            onChange={event => {
                                if (!event.target.files?.length) {
                                    setScriptName(null);
                                    setScript(null);
                                    return;
                                }

                                setScriptName(event.target.files[0].name);
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    if (e.target?.result && typeof e.target.result === 'string') {
                                        setScript(getFunscriptFromString(e.target.result));
                                    }
                                };
                                reader.readAsText(event.target.files[0]);
                            }}
                        />
                    </Button>
                    <Button
                        variant={video ? 'outlined' : 'contained'}
                        startIcon={<TheatersIcon/>}
                        component="label"
                        disabled={isConverting}
                    >
                        <UploadButtonText>
                            {video?.name ?? 'Pick Video (optional)'}
                        </UploadButtonText>
                        <input
                            hidden
                            accept="video/*"
                            type="file"
                            onChange={e => {
                                if (e.target.files?.length) {
                                    setVideo(e.target.files[0]);
                                }
                            }}
                        />
                    </Button>
                </Stack>
            </Paper>
            <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                    onClick={downloadSrt}
                    disabled={!script || isConverting}
                    variant={'contained'}
                >
                    Download subtitles
                </Button>
                {!!video && convertButton}
                <Tooltip title={'Config'}>
                    <IconButton onClick={() => setConfigOpen(true)}>
                        <SettingsIcon/>
                    </IconButton>
                </Tooltip>
            </Stack>
            <LinearProgressWithEta
                variant="determinate"
                value={convertProgress}
                sx={{
                    mt: 2,
                }}
                etaSeconds={getEtaInSeconds()}
                BoxProps={{
                    sx: {
                        visibility: isConverting ? 'visible' : 'hidden',
                    }
                }}
            />
            <Paper
                sx={{p: 2}}
            >
                <h4>Converter output</h4>
                <pre
                    style={{height: '500px', overflow: 'auto'}}
                    ref={stdoutRef}
                >
                    <code>
                        {stdout.join('\n') || 'No output yet.'}
                    </code>
                </pre>
            </Paper>
            <OverlayConfig open={configOpen} onClose={() => setConfigOpen(false)}/>
        </Container>
    );
};