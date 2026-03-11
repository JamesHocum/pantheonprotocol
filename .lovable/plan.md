

## Plan: Verify and Harden Image-to-Image Flow

### Current State

The image-to-image flow is already implemented end-to-end:
- **Frontend**: Mode selector, file upload with base64 conversion, preview, clear functionality
- **Edge function**: Accepts `sourceImage` param, builds multimodal content array for `google/gemini-3.1-flash-image-preview`
- **Style prompts**: All 6 styles are properly defined and appended

### Potential Issue

Sending full base64 images via `supabase.functions.invoke` can fail silently if the payload exceeds the request body size limit (~6MB for edge functions). A 10MB upload limit on the client side means large images could exceed this.

### Plan

1. **Compress/resize source images client-side** before sending to the edge function
   - Use an HTML Canvas to resize images to max 1024px on longest side before base64 encoding
   - This keeps payloads well under limits while maintaining quality for AI transformation

2. **Add better error handling for large payloads**
   - Catch and surface specific errors when the edge function rejects oversized requests
   - Show a toast suggesting the user try a smaller image

3. **Add a loading indicator on the source image preview** while the file is being read/processed

### Technical Details

- Add a `resizeImage(base64: string, maxSize: number): Promise<string>` utility in `ImageGeneration.tsx`
- Uses `HTMLCanvasElement` to draw and re-export the image at reduced resolution
- Called in `handleFileUpload` after `FileReader` completes, before setting state
- No new dependencies needed -- uses native browser Canvas API

