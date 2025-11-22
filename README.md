# Toolify

## API Endpoints

The Toolify API provides several endpoints for tool identification and manual generation.

### Health Check

- **GET /**: Returns a welcome message and a list of available endpoints.
- **GET /health**: Returns a health check status.

### Tool Recognition

- **POST /api/recognize-tool**: Accepts an image file and returns a list of tools identified in the image.
  - **Request Body**: `multipart/form-data` with a `file` field containing the image.
  - **Response**: A JSON object with a `tools` key containing a list of strings.

### Tool Research

- **POST /api/tool-research**: Researches a tool and returns a summary.
- **POST /api/generate-manual**: Generates a manual for a tool.
- **POST /api/generate-safety-guide**: Generates a safety guide for a tool.
- **POST /api/generate-quick-summary**: Generates a quick summary for a tool.
