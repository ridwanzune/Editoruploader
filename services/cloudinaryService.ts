import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_FOLDER } from '../constants';

/**
 * Uploads an image to Cloudinary using its URL.
 * IMPORTANT: This uses an UNSIGNED upload preset for security. You MUST create an
 * unsigned upload preset in your Cloudinary account settings (under Upload -> Upload Presets)
 * and update the CLOUDINARY_UPLOAD_PRESET constant. Do NOT expose your API Secret in the frontend code.
 *
 * @param imageUrl The URL of the image to upload.
 * @returns The secure URL of the uploaded image from Cloudinary.
 */
export const uploadImage = async (imageUrl: string): Promise<string> => {
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', imageUrl);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);

    try {
        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }

        const data = await response.json();
        return data.secure_url;

    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        if (error instanceof Error) {
            throw new Error(`Cloudinary Service Error: ${error.message}`);
        }
        throw new Error('An unexpected error occurred during image upload.');
    }
};
