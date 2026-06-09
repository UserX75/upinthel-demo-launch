# test_supabase.py
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

try:
    supabase = create_client(url, key)
    data = supabase.table("top35").select("*").execute()
    print("Data from table:", data)
except Exception as e:
    print("Error:", e)