import os
import re
import sys

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Generic mappings
    content = re.sub(r'bg-white dark:bg-\[#[0-9a-fA-F]+\]', 'bg-background', content)
    # text-foreground approximation
    content = re.sub(r'text-\[#1e2530\] dark:text-\[#e4e8f0\]', 'text-foreground', content)
    content = re.sub(r'text-\[#212121\] dark:text-\[#e4e8f0\]', 'text-foreground', content)
    # text-muted-foreground approximations
    content = re.sub(r'text-\[#[0-9a-fA-F]+\] dark:text-\[#(6b7a94|9ba2b0)\]', 'text-muted-foreground', content)
    content = re.sub(r'text-\[#(555|777|888|aaa)\] dark:text-\[#(6b7a94|9ba2b0)\]', 'text-muted-foreground', content)
    content = re.sub(r'text-\[#667085\] dark:text-\[#6b7a94\]', 'text-muted-foreground', content)
    content = re.sub(r'text-\[#9aa3b2\] dark:text-\[#6b7a94\]', 'text-muted-foreground', content)
    content = re.sub(r'text-\[#374151\] dark:text-\[#9ba2b0\]', 'text-muted-foreground', content)
    # border
    content = re.sub(r'border-\[#[0-9a-fA-F]+\] dark:border-\[#2e3340\]', 'border-border', content)
    # text-primary
    content = re.sub(r'text-\[#1f78d1\] dark:text-\[#5b9cf6\]', 'text-primary', content)
    # text-destructive
    content = re.sub(r'text-\[#d14334\] dark:text-\[#f08080\]', 'text-destructive', content)
    content = re.sub(r'text-\[#de1b0c\] dark:text-\[#f08080\]', 'text-destructive', content)
    
    # bg-muted
    content = re.sub(r'bg-\[#f[0-9a-fA-F]+\] dark:bg-\[#2[0-9a-fA-F]+\]', 'bg-muted', content)
    content = re.sub(r'bg-\[#f8f9fb\] dark:bg-\[#252a35\]', 'bg-muted', content)
    content = re.sub(r'bg-\[#f5f5f5\] dark:bg-\[#252a35\]', 'bg-muted', content)

    # Some hardcoded hexes to delete `dark:` pairs
    content = re.sub(r'dark:bg-\[#[0-9a-fA-F]+\]', '', content)
    content = re.sub(r'dark:text-\[#[0-9a-fA-F]+\]', '', content)
    content = re.sub(r'dark:border-\[#[0-9a-fA-F]+\]', '', content)

    # Convert generic hover backgrounds that are explicitly light/dark pairs to hover:bg-muted or similar
    content = re.sub(r'hover:bg-\[#[0-9a-fA-F]+\] dark:hover:bg-\[#[0-9a-fA-F]+\]', 'hover:bg-muted', content)

    # Remove inline font family overriding
    content = re.sub(r"style=\{\{\s*fontFamily:\s*'[^']+',?\s*\}\}", "", content)
    content = re.sub(r"\s*fontFamily:\s*'[^']+',?\s*", "", content)
    # For `...RV` with fontVariationSettings, let's keep it but remove inline `fontFamily` if inside a style block.
    
    with open(filepath, 'w') as f:
        f.write(content)

files = [
    "src/app/components/CalendarView.tsx",
    "src/app/components/CreatePostView.tsx",
    "src/app/components/ActivityFeed.tsx",
    "src/app/components/SocialView.tsx",
    "src/app/components/ExpiredPostsView.tsx",
    "src/app/components/RejectedPostsView.tsx",
    "src/app/components/ApprovePostsView.tsx",
    "src/app/components/ApprovalsSetupView.tsx",
    "src/app/components/AwaitingApprovalContent.tsx",
    "src/app/components/PostDetailsDrawerContent.tsx",
    "src/app/components/ActivityDrawerContent.tsx"
]

for file in files:
    if os.path.exists(file):
        process_file(file)
        print(f"Processed {file}")
