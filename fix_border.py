import re

filepath = "src/app/components/CalendarView.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# Replace cardClasses logic
old_logic = """  const cardClasses = highlighted
    ? 'border-2 border-[var(--s-blue)] shadow-[0_0_0_3px_rgba(25,118,210,0.15)]'
    : hasOuterBorder
      ? 'border border-[var(--s-border-subtle)]'
      : 'border border-[var(--s-border)]';"""

new_logic = """  const cardClasses = highlighted
    ? 'border-2 border-[var(--s-blue)] shadow-[0_0_0_3px_rgba(25,118,210,0.15)]'
    : hasOuterBorder
      ? 'border border-[var(--s-border-subtle)]'
      : isPast
        ? 'border border-transparent'
        : 'border border-[var(--s-border)]';"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    with open(filepath, 'w') as f:
        f.write(content)
    print("Done")
else:
    print("Failed to find old logic")
