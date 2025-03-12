import Airtable from 'airtable';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configure environment variables
dotenv.config();

// Configure Airtable
const base = new Airtable({
    apiKey: process.env.AIRTABLE_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
const URL_FIELD = 'imageUrl';  // The field containing your image URLs
const ATTACHMENT_FIELD = 'Image';  // The field where you want the attachments

// Supported image types
const SUPPORTED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

function isValidImageUrl(url) {
    try {
        const urlObj = new URL(url);
        const extension = urlObj.pathname.split('.').pop().toLowerCase();
        return SUPPORTED_IMAGE_TYPES.includes(extension);
    } catch (e) {
        return false;
    }
}

async function fetchImageAsBuffer(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            throw new Error(`Invalid content type: ${contentType}`);
        }

        const buffer = await response.buffer();
        return buffer;
    } catch (error) {
        console.error(`Error fetching image from ${url}:`, error);
        return null;
    }
}

async function updateRecord(record) {
    const imageUrl = record.get(URL_FIELD);
    if (!imageUrl) {
        console.log(`No image URL found for record ${record.id}`);
        return;
    }

    if (!isValidImageUrl(imageUrl)) {
        console.log(`Invalid image URL format or unsupported file type: ${imageUrl}`);
        return;
    }

    try {
        const imageBuffer = await fetchImageAsBuffer(imageUrl);
        if (!imageBuffer) return;

        // Get filename from URL and ensure it has an extension
        const fileName = imageUrl.split('/').pop() || 'image.jpg';

        // Update record with attachment
        await base(TABLE_NAME).update(record.id, {
            [ATTACHMENT_FIELD]: [{
                url: imageUrl,
                filename: fileName,
            }]
        });

        console.log(`Successfully updated record ${record.id}`);
    } catch (error) {
        console.error(`Error updating record ${record.id}:`, error);
    }
}

async function processAllRecords() {
    try {
        const records = await base(TABLE_NAME).select({
            fields: [URL_FIELD, ATTACHMENT_FIELD]
        }).all();

        console.log(`Found ${records.length} records to process`);

        // Process records in batches of 5 to avoid rate limits
        for (let i = 0; i < records.length; i += 5) {
            const batch = records.slice(i, i + 5);
            console.log(`Processing batch ${Math.floor(i/5) + 1} of ${Math.ceil(records.length/5)}`);
            
            await Promise.all(batch.map(updateRecord));
            
            if (i + 5 < records.length) {
                console.log('Waiting for rate limit...');
                // Wait 1 second between batches to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log('Finished processing all records');
    } catch (error) {
        console.error('Error processing records:', error);
    }
}

// Run the script
processAllRecords(); 