export const getVideoLengthMs = (file: File): Promise<number> =>
    new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration * 1000);
        };
        video.onerror = (e) => {
            window.URL.revokeObjectURL(video.src);
            reject(e);
        };
        video.src = URL.createObjectURL(file);
    });
