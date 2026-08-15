import type { Plugin } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']);
const MIME_TYPES: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
};

function buildManifest(audioDir: string) {
    const files = readdirSync(audioDir)
        .filter((f) => AUDIO_EXT.has(extname(f).toLowerCase()))
        .sort((a, b) => a.localeCompare(b));

    const tracks = files.map((filename) => {
        const stat = statSync(join(audioDir, filename));
        return {
            filename,
            title: filename.replace(extname(filename), '').replace(/[-_]/g, ' ').trim(),
            url: `/audio/${encodeURIComponent(filename)}`,
            bytes: stat.size,
            mimeType: MIME_TYPES[extname(filename).toLowerCase()] ?? 'application/octet-stream',
        };
    });

    return JSON.stringify({ generatedAt: new Date().toISOString(), count: tracks.length, tracks }, null, 2);
}

// Serves /audio/manifest.json, always reflecting whatever is currently in
// public/audio — read live in dev, snapshotted into the output at build time.
export default function audioManifestPlugin(): Plugin {
    let audioDir = '';
    return {
        name: 'audio-manifest',
        configResolved(config) {
            audioDir = join(config.publicDir, 'audio');
        },
        configureServer(server) {
            server.middlewares.use('/audio/manifest.json', (_req, res) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(buildManifest(audioDir));
            });
        },
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: 'audio/manifest.json',
                source: buildManifest(audioDir),
            });
        },
    };
}
