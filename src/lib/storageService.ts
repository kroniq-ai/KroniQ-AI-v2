/**
 * Supabase Storage Service
 * Handles file uploads/downloads for TTS audio and other media
 */

import { supabase, getCurrentUser } from './supabaseClient';

/**
 * Upload any studio asset to Supabase Storage
 */
export const uploadStudioAsset = async (
    projectId: string,
    blob: Blob,
    assetType: 'audio' | 'video' | 'image' | 'ppt' | 'other' = 'other'
): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
        const user = await getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        // Determine file extension based on asset type
        const extensions: Record<string, string> = {
            audio: 'mp3',
            video: 'mp4',
            image: 'png',
            ppt: 'pptx',
            other: 'bin'
        };
        const ext = extensions[assetType] || 'bin';

        const fileName = `${projectId}_${Date.now()}.${ext}`;
        const filePath = `${userId}/${assetType}/${fileName}`;

        console.log('📤 Uploading studio asset to Supabase Storage...', {
            userId,
            projectId,
            assetType,
            blobSize: blob.size
        });

        const { data, error } = await supabase.storage
            .from('studio-assets')
            .upload(filePath, blob, {
                contentType: blob.type || 'application/octet-stream',
                upsert: false
            });

        if (error) {
            console.error('❌ Error uploading studio asset:', error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('studio-assets')
            .getPublicUrl(filePath);

        console.log('✅ Studio asset uploaded successfully');
        return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
        console.error('❌ Error uploading studio asset:', error);
        return { success: false, error: error.message || 'Failed to upload asset' };
    }
};

/**
 * Upload TTS audio to Supabase Storage
 */
export const uploadTTSAudio = async (
    projectId: string,
    audioBlob: Blob
): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
        const user = await getCurrentUser();
        const userId = user?.id;
        if (!userId) {
            return { success: false, error: 'Not authenticated' };
        }

        const fileName = `${projectId}_${Date.now()}.mp3`;
        const filePath = `${userId}/tts/${fileName}`;

        console.log('📤 Uploading TTS audio to Supabase Storage...', {
            userId,
            projectId,
            blobSize: audioBlob.size
        });

        // Create a timeout promise to prevent indefinite hanging
        const timeoutMs = 10000; // 10 seconds
        const uploadPromise = (async () => {
            const { data, error } = await supabase.storage
                .from('studio-assets')
                .upload(filePath, audioBlob, {
                    contentType: 'audio/mpeg',
                    upsert: false
                });

            if (error) throw error;

            const { data: urlData } = supabase.storage
                .from('studio-assets')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        })();

        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Upload timeout')), timeoutMs);
        });

        // Race between upload and timeout
        const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
        console.log('✅ TTS audio uploaded successfully');

        return { success: true, url: downloadUrl };
    } catch (error: any) {
        console.error('❌ Error uploading TTS audio:', error);
        return { success: false, error: error.message || 'Failed to upload audio' };
    }
};

/**
 * Delete file from Supabase Storage
 */
export const deleteTTSAudio = async (audioUrl: string): Promise<boolean> => {
    try {
        // Extract the storage path from the URL
        const urlParts = audioUrl.split('/storage/v1/object/public/studio-assets/');
        if (urlParts.length !== 2) {
            console.error('Invalid audio URL format');
            return false;
        }

        const filePath = urlParts[1];

        const { error } = await supabase.storage
            .from('studio-assets')
            .remove([filePath]);

        if (error) {
            console.error('Error deleting audio:', error);
            return false;
        }

        console.log('🗑️ TTS audio deleted from storage');
        return true;
    } catch (error) {
        console.error('Error deleting TTS audio:', error);
        return false;
    }
};

/**
 * Fetch audio blob from URL (for playback)
 */
export const fetchAudioBlob = async (url: string): Promise<Blob | null> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status}`);
        }
        return await response.blob();
    } catch (error) {
        console.error('Error fetching audio blob:', error);
        return null;
    }
};
