import os
from dotenv import load_dotenv, find_dotenv

path = find_dotenv(usecwd=True)
print("dotenv path:", path or "<not found>")
print("loaded:", load_dotenv(path, override=True))

val = os.getenv("GOOGLE_API_KEY")
print("GOOGLE_API_KEY present:", bool(val))
print("length:", len(val) if val else 0)