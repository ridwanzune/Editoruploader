// Default values for the application. These will be used if no values are found in local storage.
export const DEFAULT_QUEUE_WEBHOOK_URL = 'https://hook.eu2.make.com/mvsz33n18i6dl18xynls7ie9gnoxzghl';
export const DEFAULT_POST_NOW_WEBHOOK_URL = 'https://hook.eu2.make.com/mvsz33n18i6dl18xynls7ie9gnoxzghl';
export const DEFAULT_AUTH_TOKEN = 'xR@7!pZ2#qLd$Vm8^tYe&WgC*oUeXsKv'; // Shared auth token for both webhooks

// The Gemini API key is now managed via the `API_KEY` environment variable for security.

// --- Cloudinary Configuration ---
// IMPORTANT: For security, we use an UNSIGNED upload preset. 
// Your API Secret should NEVER be in client-side code.
// Please follow these steps:
// 1. Log in to your Cloudinary account.
// 2. Go to Settings (gear icon) -> Upload tab.
// 3. Scroll to "Upload presets", click "Add upload preset".
// 4. Change "Signing Mode" to "Unsigned".
// 5. Save and copy the "Preset name" here.
export const CLOUDINARY_CLOUD_NAME = 'dukaroz3u';
export const CLOUDINARY_API_KEY = '151158368369834';
export const CLOUDINARY_UPLOAD_PRESET = 'News_App'; // <-- PASTE YOUR UNSIGNED PRESET NAME HERE
export const CLOUDINARY_FOLDER = 'news-automation-hub'; // Folder to store images in Cloudinary