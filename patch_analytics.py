import re

with open("src/app/(dashboard)/analytics/page.tsx", "r") as f:
    content = f.read()

content = content.replace('name="Anomaly Engine" type="Autoencoder"', 'name="Anomaly Engine" type="Isolation Forest"')
content = content.replace('name="Neuro-Symbolic" type="Rules + ML" status="Training"', 'name="Neuro-Symbolic" type="Rules + ML" status="Active"')

with open("src/app/(dashboard)/analytics/page.tsx", "w") as f:
    f.write(content)
