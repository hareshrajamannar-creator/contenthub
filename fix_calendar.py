import re

filepath = "src/app/components/CalendarView.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add isPast prop to PostCardProps
content = content.replace("  onPostClick: (postId: string) => void;\n}", "  onPostClick: (postId: string) => void;\n  isPast?: boolean;\n}")

# 2. Add isPast to destructured props
content = content.replace("highlighted = false, onActivityClick, onPostClick }: PostCardProps) {", "highlighted = false, isPast = false, onActivityClick, onPostClick }: PostCardProps) {")

# 3. Update PostCard bg and border logic
# Replace: className={`relative rounded-[8px] shrink-0 w-full cursor-pointer overflow-hidden bg-muted  transition-colors duration-300 ${cardClasses}`}
# With: dynamic bgClass
bg_logic = "const bgClass = isPast ? 'bg-[#f1f3f6] dark:bg-[#252a35]' : 'bg-background';"

# Wait, let's insert bg_logic before `return (` inside PostCard
card_return = "  return (\n    <div\n"
new_card_return = bg_logic + "\n" + card_return
content = content.replace(card_return, new_card_return)

content = content.replace("bg-muted  transition-colors", "${bgClass} transition-colors")

# 4. Change column backgrounds for past days
# They match exactly: <div className="bg-muted  flex-[1_0_0] min-h-[939px] min-w-px relative">
content = content.replace('<div className="bg-muted  flex-[1_0_0] min-h-[939px] min-w-px relative">', '<div className="bg-[#f9fafb] dark:bg-[#181b22] flex-[1_0_0] min-h-[939px] min-w-px relative">')

# 5. Add isPast={true} to PostCards inside those columns (post-3, post-1, post-2, post-3)
# These are the ones before Wed 4
# We can do this safely using regex or just literal string replace
content = content.replace('postId="post-3"\n                status="published"', 'postId="post-3"\n                isPast\n                status="published"')
content = content.replace('postId="post-1"\n                status="published"', 'postId="post-1"\n                isPast\n                status="published"')
content = content.replace('postId="post-2"\n                status="draft"', 'postId="post-2"\n                isPast\n                status="draft"')
content = content.replace('postId="post-3"\n                status="rejected"', 'postId="post-3"\n                isPast\n                status="rejected"')

with open(filepath, 'w') as f:
    f.write(content)

print("Done")
