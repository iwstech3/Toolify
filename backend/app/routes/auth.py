from fastapi import APIRouter, HTTPException
from app.config import supabase
from app.model.schemas import TokenResponse, TestTokenRequest

router = APIRouter(prefix="/api", tags=["Auth"])

@router.post("/test-token", response_model=TokenResponse)
async def get_test_token(creds: TestTokenRequest):
    """
    Generates a test token for Swagger UI testing.
    - If user exists: signs them in
    - If user doesn't exist: creates them via Admin API and sets up profile
    """
    email = creds.email
    password = creds.password
    full_name = creds.full_name
    user_id = None
    is_new_user = False

    try:
        # 1. First, try to sign in (handles existing users)
        try:
            res = supabase.auth.sign_in_with_password({"email": email, "password": password})
            if res.user and res.session:
                # User exists and authenticated successfully
                return TokenResponse(access_token=res.session.access_token)
        except Exception as signin_err:
            # Sign in failed, user likely doesn't exist
            print(f"Sign in failed: {signin_err}")
            pass

        # 2. User doesn't exist, create via Admin API
        try:
            attributes = {
                "email": email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {"full_name": full_name}
            }
            user_response = supabase.auth.admin.create_user(attributes)
            if user_response.user:
                user_id = user_response.user.id
                is_new_user = True
        except Exception as admin_err:
            raise HTTPException(
                status_code=400, 
                detail=f"Could not create user. They may exist but password is incorrect: {str(admin_err)}"
            )

        # 3. Create profile for new user only
        if is_new_user and user_id:
            try:
                supabase.table("profiles").insert({
                    "id": str(user_id),
                    "full_name": full_name,
                    "avatar_url": None
                }).execute()
            except Exception as e:
                # Profile might already exist, that's ok
                print(f"Profile creation warning: {e}")

        # 4. Sign in the newly created user and return token
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if res.session:
            return TokenResponse(access_token=res.session.access_token)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auth process failed: {str(e)}")
    
    raise HTTPException(status_code=500, detail="Could not retrieve token")
