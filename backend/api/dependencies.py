import os

from dotenv import load_dotenv
from fastapi import HTTPException, status
from fastapi.security import APIKeyHeader

load_dotenv()

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_api_key(api_key: str | None = _api_key_header):
    expected_key = os.getenv("API_KEY")
    if not expected_key or not api_key or api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API Key",
        )
    return api_key
