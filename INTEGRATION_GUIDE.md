# Frontend-Backend Integration Guide

## ✅ Integration Complete

The Toolify frontend and backend are now properly integrated. Here's what was implemented:

## Changes Made

### 1. Enhanced API Client (`lib/api.ts`)
- ✅ Added comprehensive error handling with custom `APIError` class
- ✅ Added console logging for debugging API requests
- ✅ Improved type safety with `ChatResponse` interface
- ✅ Better error messages for different HTTP status codes (401, 400, 500)
- ✅ Network error handling

### 2. Updated ChatInterface Component
- ✅ Improved authentication token handling
- ✅ User-friendly error messages displayed in chat
- ✅ Better error logging for debugging
- ✅ Graceful handling of authentication failures

### 3. API Configuration
- ✅ API URL defaults to production: `https://toolify-api.onrender.com`
- ✅ Can be overridden with `NEXT_PUBLIC_API_URL` environment variable

## Environment Setup

### For Local Development

Create `.env.local` in the frontend directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Backend API URL (optional - defaults to production)
NEXT_PUBLIC_API_URL=https://toolify-api.onrender.com
```

### For Production (Vercel)

Set these environment variables in your Vercel project settings:

1. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. `CLERK_SECRET_KEY`
3. `NEXT_PUBLIC_API_URL=https://toolify-api.onrender.com`

## How It Works

### Authentication Flow
1. User signs in with Clerk (frontend)
2. Clerk provides a JWT token
3. Frontend sends token in `Authorization: Bearer <token>` header
4. Backend validates token with Supabase Auth
5. If valid, request is processed

### Text Chat
1. User types message in chat input
2. Frontend calls `sendMessage()` with auth token
3. Backend processes with Gemini AI
4. Response returned and displayed in chat
5. Chat history saved to Supabase

### Image Upload for Tool Recognition
1. User clicks paperclip icon and selects image
2. Image sent to `/api/chat` endpoint with message
3. Backend:
   - Uploads image to Supabase Storage
   - Uses Gemini Vision to recognize tool
   - Performs Tavily research on tool
   - Saves scan to database
4. Response includes tool info, safety tips, YouTube links

### Voice Input
1. User clicks microphone button
2. Browser records audio
3. Audio blob sent to `/api/chat` endpoint
4. Backend transcribes with Gemini
5. Transcribed text processed as normal chat message

## Testing Checklist

### ✅ Features to Test

1. **Text Chat**
   - [ ] Send a simple text message
   - [ ] Verify AI responds appropriately
   - [ ] Check message appears in chat history

2. **Image Upload**
   - [ ] Upload image of a tool (hammer, drill, etc.)
   - [ ] Verify tool is recognized
   - [ ] Check response includes tool details and safety info

3. **Voice Input**
   - [ ] Record a voice message
   - [ ] Verify it's transcribed correctly
   - [ ] Check AI responds to the transcription

4. **Chat History**
   - [ ] Create multiple chats
   - [ ] Verify they appear in sidebar
   - [ ] Click on old chat to load history

5. **Error Handling**
   - [ ] Test with invalid inputs
   - [ ] Verify error messages are user-friendly

## Debugging

### Check Browser Console
The integration includes extensive console logging:
- 🔗 API URL configuration
- 📤 Outgoing requests
- ✅ Successful responses
- ❌ Error details

### Common Issues

**Issue**: "Authentication failed"
- **Solution**: Check Clerk keys are set correctly
- Verify Supabase is configured to accept Clerk tokens

**Issue**: "Network error"
- **Solution**: Check backend is running at `https://toolify-api.onrender.com`
- Verify CORS is configured correctly

**Issue**: "No response from AI"
- **Solution**: Check backend logs on Render
- Verify Gemini API key is valid

## Next Steps

1. **Deploy Frontend**: Push changes to Vercel
2. **Set Environment Variables**: Configure in Vercel dashboard
3. **Test Production**: Verify all features work on deployed site
4. **Monitor Logs**: Check for any errors in first 24 hours

## Support

If you encounter issues:
1. Check browser console for error messages
2. Check backend logs on Render
3. Verify all environment variables are set
4. Test API endpoints directly at `/docs`
