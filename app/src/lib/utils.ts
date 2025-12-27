export const getApiUrl = (path: string): string => {
    const baseUrl = 'http://localhost:7860';
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}/${cleanPath}`;
};

export const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
