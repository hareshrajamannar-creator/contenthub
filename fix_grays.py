import re

filepath = "src/app/components/PostDetailsDrawerContent.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# Left pane cards
content = content.replace('bg-muted px-3.5 py-3', 'bg-[#f6f8fa] dark:bg-[#252a35] px-3.5 py-3')
content = content.replace('bg-muted px-3.5 py-2.5', 'bg-[#f6f8fa] dark:bg-[#252a35] px-3.5 py-2.5')
content = content.replace('bg-muted px-4 py-4', 'bg-[#f6f8fa] dark:bg-[#252a35] px-4 py-4')
content = content.replace('bg-muted px-4 py-3.5', 'bg-[#f6f8fa] dark:bg-[#252a35] px-4 py-3.5')
content = content.replace('bg-muted px-4 py-3', 'bg-[#f6f8fa] dark:bg-[#252a35] px-4 py-3')
content = content.replace('bg-muted px-2 py-[4px]', 'bg-[#f6f8fa] dark:bg-[#252a35] px-2 py-[4px]')

# Right pane background
content = content.replace('bg-muted  px-[30px] py-6', 'bg-[#f0f3f6] dark:bg-[#181b22] px-[30px] py-6')
content = content.replace('bg-muted ', 'bg-[#f0f3f6] dark:bg-[#181b22] ')

with open(filepath, 'w') as f:
    f.write(content)

print("Done")
