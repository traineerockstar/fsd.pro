
import { findOrCreateFolder, listFilesInFolder } from './googleDriveService';

const DB_FILENAME = 'solutions_db.json';

export interface Solution {
    errorCode: string;
    productLine?: string; // 'washing_machine', etc.
    sptoms?: string[];
    fix: string;
    successCount: number;
    lastVerified: string; // ISO Date
}

export const learningService = {

    getSolutions: async (accessToken: string): Promise<Solution[]> => {
        try {
            const rootId = await findOrCreateFolder(accessToken);
            // Search for file
            const query = `'${rootId}' in parents and name = '${DB_FILENAME}' and trashed=false`;
            const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id, name, mediaLink)`;
            const headers = { 'Authorization': `Bearer ${accessToken}` };

            const resp = await fetch(searchUrl, { headers });
            const data = await resp.json();

            if (data.files && data.files.length > 0) {
                // Download content
                const fileId = data.files[0].id;
                const fileUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
                const contentResp = await fetch(fileUrl, { headers });
                return await contentResp.json();
            }

            return []; // No DB yet
        } catch (e) {
            console.error("Failed to load solutions DB", e);
            return [];
        }
    },

    findFix: async (accessToken: string, code: string): Promise<Solution | null> => {
        const solutions = await learningService.getSolutions(accessToken);
        // Fuzzy match or exact? Exact for now.
        const match = solutions.find(s => s.errorCode.toLowerCase() === code.toLowerCase());
        return match || null;
    },

    recordFix: async (accessToken: string, solution: Solution) => {
        try {
            const solutions = await learningService.getSolutions(accessToken);
            const index = solutions.findIndex(s => s.errorCode === solution.errorCode && s.fix === solution.fix);

            if (index >= 0) {
                solutions[index].successCount += 1;
                solutions[index].lastVerified = new Date().toISOString();
            } else {
                solutions.push(solution);
            }

            // Save back to Drive
            const rootId = await findOrCreateFolder(accessToken);

            // Reuse save logic - Ideally abstracted but repeating for speed/autonomy
            const metadata = {
                name: DB_FILENAME,
                mimeType: 'application/json',
                parents: [rootId]
            };

            // We need to overwrite if exists. 
            // Simplified: find file ID first, then update.
            const query = `'${rootId}' in parents and name = '${DB_FILENAME}' and trashed=false`;
            const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
            const searchResp = await fetch(searchUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            const searchData = await searchResp.json();

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', new Blob([JSON.stringify(solutions, null, 2)], { type: 'application/json' }));

            if (searchData.files && searchData.files.length > 0) {
                const fileId = searchData.files[0].id;
                await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                    body: form
                });
            } else {
                await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                    body: form
                });
            }

        } catch (e) {
            console.error("Failed to save solution", e);
        }
    }
};
