# Cloudflare D1 Form Submission Setup

This directory contains a Cloudflare Pages Function that handles form submissions and stores them in a D1 database.

## Features

- **Form submission** to D1 database
- **File uploads** to R2 object storage (optional)
- **Email notifications** via Resend (optional)

## Setup Instructions

### 1. Create D1 Database

Using Wrangler CLI:
```bash
wrangler d1 create klementina-submissions
```

Or via Cloudflare Dashboard:
1. Go to Workers & Pages → D1
2. Click "Create database"
3. Name: `klementina-submissions`

### 2. Initialize Database Schema

Run the schema from `schema.sql`:

```bash
wrangler d1 execute klementina-submissions --file=./schema.sql
```

### 3. Create R2 Bucket (Optional - for file uploads)

```bash
wrangler r2 bucket create klementina-submissions
```

### 4. Email Notifications via Resend (Optional)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Verify your domain (e.g., `klementina-tattoo.com`)

### 5. Configure Environment Variables

Add these bindings to your `wrangler.toml` or Cloudflare Dashboard:

```toml
[[d1_databases]]
binding = "DB"
database_name = "klementina-submissions"
database_id = "your-database-id"

[[r2_buckets]]
binding = "SUBMISSIONS_BUCKET"
bucket_name = "klementina-submissions"

[vars]
R2_PUBLIC_URL = "https://pub-xxxxxxxx.r2.dev"  # Your R2 public URL
NOTIFICATION_EMAIL = "your-email@example.com"   # Where to receive notifications
FROM_EMAIL = "Klementina Tattoo <noreply@klementina-tattoo.com>"  # Sender address

# Secrets (add via dashboard or `wrangler secret put`)
# RESEND_API_KEY = "re_xxxxxxxxxxxxxxxx"
```

### 6. Bind to Pages Project

In Cloudflare Dashboard:
1. Go to Pages → Your Project → Settings → Functions
2. Under "D1 database bindings", add:
   - Variable name: `DB`
   - Database: `klementina-submissions`
3. Under "R2 bucket bindings", add (if using file uploads):
   - Variable name: `SUBMISSIONS_BUCKET`
   - Bucket: `klementina-submissions`
4. Add environment variables:
   - `R2_PUBLIC_URL`: Your R2 public domain
   - `NOTIFICATION_EMAIL`: Your email address
   - `FROM_EMAIL`: Sender email address
5. Add secrets:
   - `RESEND_API_KEY`: Your Resend API key

## API Endpoint

- **POST** `/api/submit` - Submit form data

### Request Format

```
Content-Type: multipart/form-data

Fields:
- fullName (required)
- preference (email|phone|both)
- email
- phone
- description (required)
- existingTattoos
- photo (file)
- reference (file)
- palette (black|color)
- style (linework|shadow)
- days[] (checkbox array: mon,tue,wed,thu,fri,sat)
- time (morning|afternoon|evening)
- dateTime
- budget
- extraInfo
- language (en|de)
```

### Response Format

Success (200):
```json
{
  "success": true,
  "message": "Submission received",
  "id": 123
}
```

Error (400/500):
```json
{
  "error": "Error message"
}
```

## Email Notifications

When configured, each form submission sends an HTML email notification containing:

- Client name and contact info
- Tattoo description
- Style preferences (palette, style, available days)
- Budget and scheduling info
- Links to uploaded photos (if any)
- Reply-to header set to client's email (if provided)

## Admin Dashboard Query Examples

View recent submissions:
```sql
SELECT * FROM recent_submissions LIMIT 20;
```

Get new submissions:
```sql
SELECT * FROM submissions WHERE status = 'new' ORDER BY created_at DESC;
```

Update submission status:
```sql
UPDATE submissions SET status = 'contacted' WHERE id = 123;
```

## Notes

- File uploads are stored in R2 with paths like: `submissions/{id}/photo-{timestamp}-{filename}`
- The function handles CORS for cross-origin requests
- All form data is validated on the server side
- Email notifications are sent asynchronously (non-blocking)
- If email config is missing, submissions still work but no notification is sent
