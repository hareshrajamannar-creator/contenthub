import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # hover:bg-[#1565c0] to hover:bg-primary/90
    content = re.sub(r'hover:bg-\[#1565c0\]', 'hover:bg-primary/90', content)
    
    # bg-[#fafafa], bg-[#f5f5f5], bg-[#f6f8fb], bg-[#f7f8fb] => bg-muted
    content = re.sub(r'bg-\[#fa[a-fA-F0-9]{4}\]', 'bg-muted', content)
    content = re.sub(r'bg-\[#f[5-7][a-fA-F0-9]{4}\]', 'bg-muted', content)
    
    # status colors (often found in StatusConfig dictionaries)
    content = re.sub(r'bg-\[#f1faf0\]', 'bg-[#edf8ef]', content)

    # Some remaining border colors
    content = re.sub(r'border-\[#e[a-fA-F0-9]{5}\]', 'border-border', content)
    
    # Remove single dark:text-XXXX or dark:bg-XXXX left behind
    content = re.sub(r'\sdark:bg-\[#[0-9a-fA-F]+\]', '', content)
    content = re.sub(r'\sdark:text-\[#[0-9a-fA-F]+\]', '', content)
    content = re.sub(r'\sdark:border-\[#[0-9a-fA-F]+\]', '', content)

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
