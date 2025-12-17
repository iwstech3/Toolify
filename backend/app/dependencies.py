from fastapi import HTTPException, UploadFile, File, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.config import supabase
from supabase import Client
import jwt
from jwt.algorithms import RSAAlgorithm
import json
import urllib.request

def image_file_validator(file: UploadFile = File(...)):
    """
    Dependency to validate that an uploaded file is an image.
    Used for required file uploads.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded is not an image.")
    return file

def optional_image_file_validator(file: Optional[UploadFile] = File(None)):
    """
    Dependency to validate that an optional uploaded file, if present, is an image.
    Used for optional file uploads.
    """
    if file and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded is not an image.")
    return file

# CRITICAL: HTTPBearer is used to extract the Bearer token from the Authorization header
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # 1. Decode header to get Key ID (kid)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')
        
        # 2. Fetch Clerk's JWKS (Simple in-memory caching)
        # TODO: Move this URL to config
        jwks_url = "https://warm-man-46.clerk.accounts.dev/.well-known/jwks.json"
        
        # Simple global cache for JWKS to avoid fetching on every request
        if not hasattr(get_current_user, "jwks_cache"):
            with urllib.request.urlopen(jwks_url) as response:
                get_current_user.jwks_cache = json.loads(response.read())
        
        jwks = get_current_user.jwks_cache
            
        # 3. Find the matching key
        public_key = None
        for key in jwks['keys']:
            if key['kid'] == kid:
                public_key = RSAAlgorithm.from_jwk(json.dumps(key))
                break
        
        if not public_key:
             # If key not found, maybe cache is stale? Refresh once.
             with urllib.request.urlopen(jwks_url) as response:
                get_current_user.jwks_cache = json.loads(response.read())
                jwks = get_current_user.jwks_cache
                for key in jwks['keys']:
                    if key['kid'] == kid:
                        public_key = RSAAlgorithm.from_jwk(json.dumps(key))
                        break
             
             if not public_key:
                raise Exception("Public key not found in JWKS")

        # 4. Verify the token
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False}, # Clerk tokens might not have audience set for backend
            leeway=60 # Add 60 seconds leeway for clock skew
        )
        
        # 5. Construct a user object that mimics Supabase's response
        class User:
            def __init__(self, id, email):
                self.id = id
                self.email = email
        
        # Clerk "sub" is the user ID
        user_id = payload.get("sub")
        email = payload.get("email", "unknown")

        # Clerk doesn't always put email in the JWT unless configured, but we need an ID
        return User(id=user_id, email=email)

    except Exception as e:
        print(f"DEBUG: Manual Auth exception: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_user_supabase_client(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Client:
    """
    Creates a Supabase client authenticated with the user's token.
    This ensures RLS policies are respected.
    """
    token = credentials.credentials
    try:
        # Create a new client with the user's token
        # We use the ANON key + the user's Bearer token
        from app.config import settings
        from supabase import create_client, ClientOptions
        
        client = create_client(
            settings.supabase_url, 
            settings.supabase_anon_key,
            options=ClientOptions(
                headers={
                    "Authorization": f"Bearer {token}"
                }
            )
        )
        return client
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not create authenticated client: {str(e)}",
        )
