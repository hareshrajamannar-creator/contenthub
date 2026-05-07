import re

filepath = "src/app/components/PostDetailsDrawerContent.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# Fix broken hover states
content = content.replace('hover:bg-[#f0f3f6] dark:bg-[#181b22]', 'hover:bg-[#f0f3f6] dark:hover:bg-[#2e3340]')

with open(filepath, 'w') as f:
    f.write(content)

print("Done")
