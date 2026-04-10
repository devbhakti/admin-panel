
import sys

file_path = r"c:\Users\admin\Downloads\DevBhakti-master\DevBhakti-master\devbhakti-frontend\src\locales\hi.json"

try:
    with open(file_path, 'rb') as f:
        data = f.read()
    
    index = 44281
    start = max(0, index - 50)
    end = min(len(data), index + 50)
    
    chunk = data[start:end]
    print(f"Byte chunk around {index}:")
    print(chunk)
    print("\nHex representation:")
    print(chunk.hex(' '))
    
    # Try to decode to see where it fails
    try:
        chunk.decode('utf-8')
        print("\nDecoding chunk directly worked (unexpectedly if it's invalid).")
    except UnicodeDecodeError as e:
        print(f"\nDecoding failed: {e}")

except Exception as e:
    print(f"Error: {e}")
