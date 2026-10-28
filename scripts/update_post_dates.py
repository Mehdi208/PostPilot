import json

FILE_PATH = r"c:\Users\hp\Documents\antigravity\PostPilot\src\lib\data\initial-posts.json"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    posts = json.load(f)

# New strategic dates corresponding to the 4 weeks of the professor's assignment:
# Semaine 1 (19-25 Octobre) : Post 1 (Ven. 23 Octobre) -> Publié
# Semaine 2 (26 Octobre - 1er Novembre) : Post 2 (Jeu. 29 Octobre) -> Programmé à 08h30
# Semaine 3 (2 - 8 Novembre) : Post 3 (Jeu. 5 Novembre) -> Programmé à 08h30
# Semaine 4 (9 - 15 Novembre) : Post 4 (Jeu. 12 Novembre) -> Programmé à 08h30

updates = {
    "mehdi-post-1-presentation": {
        "scheduledDate": "2026-10-23",
        "dayOfWeek": "Ven.",
        "week": "S1",
        "time": "08:30",
        "status": "published"
    },
    "mehdi-post-2-article": {
        "scheduledDate": "2026-10-29",
        "dayOfWeek": "Jeu.",
        "week": "S2",
        "time": "08:30",
        "status": "scheduled"
    },
    "mehdi-post-3-carrousel": {
        "scheduledDate": "2026-11-05",
        "dayOfWeek": "Jeu.",
        "week": "S3",
        "time": "08:30",
        "status": "scheduled"
    },
    "mehdi-post-4-libre": {
        "scheduledDate": "2026-11-12",
        "dayOfWeek": "Jeu.",
        "week": "S4",
        "time": "08:30",
        "status": "scheduled"
    }
}

count = 0
for p in posts:
    pid = p.get("id")
    if pid in updates:
        for k, v in updates[pid].items():
            p[k] = v
        count += 1

with open(FILE_PATH, "w", encoding="utf-8") as f:
    json.dump(posts, f, indent=2, ensure_ascii=False)

print(f"Successfully updated {count} posts in {FILE_PATH} with professor weekly schedule dates!")
