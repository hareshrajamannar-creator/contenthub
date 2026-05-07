import re

filepath = "src/app/components/PostDetailsDrawerContent.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# 1. Platform icons
old_platform_dot = """<div
              className="h-[6px] w-[6px] rounded-full"
              style={{ backgroundColor: platformMeta[p].color }}
            />"""
new_platform_icon = "<PlatformIcon platform={p} />"
content = content.replace(old_platform_dot, new_platform_icon)

# 2. Border for the pages cards
old_pages_border = 'className="flex items-center justify-between gap-3 rounded-[6px] border border-border bg-[#f6f8fa] dark:bg-[#252a35] px-3.5 py-2.5"'
new_pages_border = 'className="flex items-center justify-between gap-3 rounded-[6px] bg-[#f6f8fa] dark:bg-[#252a35] px-3.5 py-2.5"'
content = content.replace(old_pages_border, new_pages_border)

# 3. Shadow for the preview card
old_preview_card = 'className="rounded-[8px] border border-border bg-background shadow-[0_2px_12px_rgba(15,23,42,0.06)] dark:shadow-none"'
new_preview_card = 'className="rounded-[8px] border border-border bg-background dark:shadow-none"'
content = content.replace(old_preview_card, new_preview_card)


# 4. Chips for rejected and pending
old_pending_chip = '<span className="inline-flex items-center gap-[5px] rounded-[5px] border border-[#fde4a0]  bg-[#f6f8fa] dark:bg-[#252a35] px-2 py-[4px] text-[11.5px] text-[#b67a00] " style={RV}>'
new_pending_chip = '<span className="inline-flex items-center gap-[5px] rounded-[5px] border border-[#fde4a0] bg-[#fef3d6] dark:bg-[#3d311c] px-2 py-[4px] text-[11.5px] text-[#b67a00]" style={RV}>'
content = content.replace(old_pending_chip, new_pending_chip)

old_rejected_chip = '<span className="inline-flex items-center gap-[5px] rounded-[5px] border border-[#fac9c3]  bg-[#f6f8fa] dark:bg-[#252a35] px-2 py-[4px] text-[11.5px] text-destructive" style={RV}>'
new_rejected_chip = '<span className="inline-flex items-center gap-[5px] rounded-[5px] border border-[#fac9c3] bg-[#fef6f5] dark:bg-[#3d2320] px-2 py-[4px] text-[11.5px] text-destructive" style={RV}>'
content = content.replace(old_rejected_chip, new_rejected_chip)


with open(filepath, 'w') as f:
    f.write(content)

print("Done")

