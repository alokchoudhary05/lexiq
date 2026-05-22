import hmac
import hashlib
import os

# Use a default secret for local dev if not provided in environment
SECRET_KEY = os.environ.get("MEMORY_SECRET_KEY", "lexiq_super_secret_memory_key_2026").encode("utf-8")

def sign_memory(data: str) -> str:
    """Generate an HMAC-SHA256 signature for the given memory string."""
    return hmac.new(SECRET_KEY, data.encode("utf-8"), hashlib.sha256).hexdigest()

def verify_memory(data: str, signature: str) -> bool:
    """Verify that the data matches the given HMAC signature."""
    if not data and not signature:
        return True # Empty memory is always valid
    expected_sig = sign_memory(data)
    return hmac.compare_digest(expected_sig, signature)
