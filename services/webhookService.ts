import type { WebhookPayload } from '../types';

export const sendToWebhook = async (payload: WebhookPayload, webhookUrl: string, authToken: string): Promise<void> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Per Make.com documentation, API keys should be sent in the 'x-make-apikey' header.
    if (authToken) {
      headers['x-make-apikey'] = authToken;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to get more info from the response body if available
      let errorBody = 'No additional error info from webhook.';
      try {
        errorBody = await response.text();
      } catch (e) {
        // ignore if body can't be read
      }
      throw new Error(`Webhook request failed with status ${response.status}. Body: ${errorBody}`);
    }

    console.log('Successfully sent data to webhook.');
  } catch (error) {
    console.error('Error sending data to webhook:', error);
    
    // Provide a more specific error for CORS issues, which often manifest as a TypeError.
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        `Network Error: The request could not be completed. This is often due to a CORS (Cross-Origin Resource Sharing) configuration issue on the destination server. ` +
        `Please ensure the webhook at ${webhookUrl} is configured to accept requests from this application's origin.`
      );
    }
    
    if (error instanceof Error) {
      throw new Error(`Webhook Service Error: ${error.message}`);
    }
    
    throw new Error('An unexpected error occurred while sending data to the webhook.');
  }
};