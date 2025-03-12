# Airtable Image URL to Attachment Converter

This script helps you convert image URLs stored in an Airtable field into proper Airtable attachments. It's useful when you have a table with image URLs and want to convert them into actual image attachments that can be viewed and managed directly in Airtable.

## Features

- Converts image URLs to Airtable attachments
- Supports common image formats (jpg, jpeg, png, gif, webp)
- Processes records in batches to respect Airtable's rate limits
- Validates image URLs and content types before processing
- Provides detailed progress logging

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- An Airtable account with API access
- A table containing image URLs

## Setup

1. Clone this repository or download the files
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with the following variables:
   ```
   AIRTABLE_ACCESS_TOKEN=your_access_token
   AIRTABLE_BASE_ID=your_base_id
   AIRTABLE_TABLE_NAME=your_table_name
   ```

   Where:
   - `AIRTABLE_ACCESS_TOKEN`: Your Airtable API key (found in your account settings)
   - `AIRTABLE_BASE_ID`: Your Airtable base ID (found in the API documentation when viewing your base)
   - `AIRTABLE_TABLE_NAME`: The name of your table containing the images

## Configuration

By default, the script looks for:
- Image URLs in a field named `imageUrl`
- Saves attachments to a field named `Image`

You can modify these field names in `import-images.js` by changing:
```javascript
const URL_FIELD = 'imageUrl';      // Change this to your URL field name
const ATTACHMENT_FIELD = 'Image';  // Change this to your target attachment field name
```

## Usage

Run the script with:
```bash
node import-images.js
```

The script will:
1. Fetch all records from your specified table
2. Process them in batches of 5 to respect rate limits
3. Download each image and convert it to an attachment
4. Update the records with the new attachments
5. Log progress and any errors that occur

## Error Handling

The script includes error handling for common issues:
- Invalid image URLs
- Unsupported file types
- Failed downloads
- Invalid content types
- API rate limits

Errors are logged to the console for troubleshooting.

## Rate Limiting

The script processes records in batches of 5 with a 1-second delay between batches to avoid hitting Airtable's rate limits. You can adjust these values in the code if needed. 