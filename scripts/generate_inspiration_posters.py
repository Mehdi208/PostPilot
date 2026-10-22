import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = r"c:\Users\hp\Documents\antigravity\PostPilot\public\posts\inspiration"
BRAIN_DIR = r"C:\Users\hp\.gemini\antigravity\brain\65350392-30d7-4c42-9856-ab9daf05e8e1"
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH = 1080
HEIGHT = 1350

def get_font(name="segoeui", size=32, bold=False):
    font_map = {
        "sans": "arialbd.ttf" if bold else "arial.ttf",
        "segoe": "segoeuib.ttf" if bold else "segoeui.ttf",
        "mono": "consolab.ttf" if bold else "consola.ttf",
        "calibri": "calibrib.ttf" if bold else "calibri.ttf"
    }
    fname = font_map.get(name, "arialbd.ttf" if bold else "arial.ttf")
    path = os.path.join(r"C:\Windows\Fonts", fname)
    if os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

# -------------------------------------------------------------
# POSTER 1: PERSONAL BRANDING TECH LEADER (Swiss Dark Mode)
# -------------------------------------------------------------
def make_poster_1():
    img = Image.new("RGB", (WIDTH, HEIGHT), (11, 14, 21)) # Dark Slate
    draw = ImageDraw.Draw(img)

    # 1. Subtle Background Grid
    grid_color = (22, 28, 42)
    for x in range(60, WIDTH, 120):
        draw.line([(x, 60), (x, HEIGHT - 60)], fill=grid_color, width=1)
    for y in range(60, HEIGHT, 120):
        draw.line([(60, y), (WIDTH - 60, y)], fill=grid_color, width=1)

    # Outer framing
    draw.rectangle([(50, 50), (WIDTH - 50, HEIGHT - 50)], outline=(40, 52, 78), width=2)
    
    # Top Tag & Header Metadata
    f_mono_sm = get_font("mono", 22, bold=False)
    f_mono_bold = get_font("mono", 22, bold=True)
    draw.text((90, 85), "INSPIRATION STYLE 01 // PERSONAL BRANDING TECH", fill=(100, 116, 139), font=f_mono_sm)
    draw.text((WIDTH - 270, 85), "[SWISS DARK TECH]", fill=(99, 102, 241), font=f_mono_bold)

    # Central Glow Ring Simulation
    center_x, center_y = WIDTH // 2, 530
    glow_img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.ellipse([(center_x - 220, center_y - 220), (center_x + 220, center_y + 220)], fill=(99, 102, 241, 45))
    glow_draw.ellipse([(center_x - 170, center_y - 170), (center_x + 170, center_y + 170)], fill=(6, 182, 212, 60))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=50))
    img.paste(Image.composite(glow_img.convert("RGB"), img, glow_img.split()[3]), (0, 0))

    # Inner circular avatar area / profile silhouette
    draw.ellipse([(center_x - 160, center_y - 160), (center_x + 160, center_y + 160)], outline=(99, 102, 241), width=4)
    draw.ellipse([(center_x - 145, center_y - 145), (center_x + 145, center_y + 145)], fill=(15, 23, 42), outline=(6, 182, 212), width=2)
    
    # Initials Monogram in center
    f_mono_xxl = get_font("segoe", 90, bold=True)
    draw.text((center_x - 70, center_y - 65), "MT", fill=(248, 250, 252), font=f_mono_xxl)

    # Pill Badges around avatar
    f_badge = get_font("segoe", 20, bold=True)
    draw.rounded_rectangle([(center_x - 160, center_y + 185), (center_x + 160, center_y + 235)], radius=12, fill=(30, 41, 59), outline=(99, 102, 241), width=2)
    draw.text((center_x - 130, center_y + 198), "MAJOR IFRAN 2024", fill=(224, 231, 255), font=f_badge)

    # Massive Headline (Swiss Poster Typography)
    f_title = get_font("segoe", 64, bold=True)
    f_sub = get_font("segoe", 32, bold=False)
    
    draw.text((90, 830), "LE COMMUNICANT", fill=(255, 255, 255), font=f_title)
    draw.text((90, 910), "QUI SAIT CODER.", fill=(6, 182, 212), font=f_title)
    
    draw.text((90, 1010), "L'intersection rare entre le storytelling émotionnel", fill=(203, 213, 225), font=f_sub)
    draw.text((90, 1055), "et l'architecture technologique moderne.", fill=(148, 163, 184), font=f_sub)

    # Bottom Architecture Metadata
    draw.line([(90, 1140), (WIDTH - 90, 1140)], fill=(40, 52, 78), width=1)
    f_foot = get_font("mono", 20, bold=False)
    draw.text((90, 1170), "DIRECTIVE IA : ChatGPT DALL-E 3 • Ratio 4:5 • Éclairage volumétrique", fill=(100, 116, 139), font=f_foot)
    draw.text((90, 1205), "SOURCE REQUISE : Photo portrait détourée + Palette #0B0E15 / #6366F1", fill=(148, 163, 184), font=f_foot)
    draw.text((WIDTH - 240, 1170), "[INSPIRATION]", fill=(99, 102, 241), font=f_mono_bold)

    return img

# -------------------------------------------------------------
# POSTER 2: ARTICLE EDITORIAL TECH (Wired / Cyberpunk Magazine)
# -------------------------------------------------------------
def make_poster_2():
    img = Image.new("RGB", (WIDTH, HEIGHT), (9, 9, 11)) # Obsidian
    draw = ImageDraw.Draw(img)

    # Top Magazine Bar
    f_mag = get_font("mono", 28, bold=True)
    draw.rectangle([(50, 50), (WIDTH - 50, 130)], fill=(24, 24, 27))
    draw.text((80, 75), "PROSPECTIVE // ARTICLE ÉDITORIAL TECH", fill=(244, 244, 245), font=f_mag)
    draw.text((WIDTH - 280, 75), "OCTOBRE 2026", fill=(245, 158, 11), font=f_mag)

    # Split Graphic in Center: Organic Wave vs Algorithmic Wireframe
    split_y = 220
    draw.rectangle([(80, split_y), (WIDTH - 80, split_y + 460)], outline=(39, 39, 42), fill=(18, 18, 21), width=2)
    
    # Left Half: Warm Amber Waves (Human creativity)
    for i in range(12):
        y_pos = split_y + 40 + i * 35
        draw.arc([(100, y_pos - 30), (500, y_pos + 60)], 0, 180, fill=(245, 158, 11), width=3)
    
    # Right Half: Cyan & Purple Matrix (Neural Nodes)
    for row in range(8):
        for col in range(6):
            cx = 580 + col * 75
            cy = split_y + 50 + row * 50
            draw.ellipse([(cx - 4, cy - 4), (cx + 4, cy + 4)], fill=(139, 92, 246))
            if col < 5:
                draw.line([(cx, cy), (cx + 75, cy)], fill=(39, 39, 42), width=1)
            if row < 7:
                draw.line([(cx, cy), (cx, cy + 50)], fill=(39, 39, 42), width=1)
    
    # Divider Label
    f_sm = get_font("mono", 18, bold=True)
    draw.rounded_rectangle([(WIDTH // 2 - 110, split_y + 200), (WIDTH // 2 + 110, split_y + 245)], radius=8, fill=(9, 9, 11), outline=(245, 158, 11), width=2)
    draw.text((WIDTH // 2 - 85, split_y + 212), "HUMAN + AI SYNERGY", fill=(255, 255, 255), font=f_sm)

    # Main Headline
    f_h1 = get_font("segoe", 56, bold=True)
    f_body = get_font("segoe", 28, bold=False)
    draw.text((80, 740), "L'IA VA-T-ELLE TUER", fill=(255, 255, 255), font=f_h1)
    draw.text((80, 815), "LE COMMUNITY MANAGER ?", fill=(245, 158, 11), font=f_h1)

    draw.text((80, 915), "Pourquoi 90% des exécutants vont disparaître,", fill=(212, 212, 216), font=f_body)
    draw.text((80, 960), "et comment l'élite hybride multiplie son impact par 10.", fill=(161, 161, 170), font=f_body)

    # 3 Stat Pills
    stat_y = 1040
    badges = [
        ("80%", "Délégation Automatisée"),
        ("100%", "Stratégie Humaine"),
        ("x5", "Rapidité de Production")
    ]
    for idx, (val, lbl) in enumerate(badges):
        bx = 80 + idx * 315
        draw.rounded_rectangle([(bx, stat_y), (bx + 295, stat_y + 100)], radius=10, fill=(24, 24, 27), outline=(39, 39, 42), width=1)
        draw.text((bx + 20, stat_y + 15), val, fill=(245, 158, 11), font=get_font("segoe", 34, bold=True))
        draw.text((bx + 20, stat_y + 60), lbl, fill=(161, 161, 170), font=get_font("segoe", 18, bold=False))

    # Bottom notes
    draw.line([(80, 1180), (WIDTH - 80, 1180)], fill=(39, 39, 42), width=1)
    draw.text((80, 1210), "DIRECTIVE IA : Style couverture magazine Wired • Division symbiotique • Typo suisse", fill=(113, 113, 122), font=get_font("mono", 19))
    draw.text((80, 1245), "SOURCE REQUISE : Texte de réflexion 3 paragraphes + Palette Obsidian/Amber", fill=(161, 161, 170), font=get_font("mono", 19))

    return img

# -------------------------------------------------------------
# POSTER 3: CARROUSEL 5P / INFOGRAPHIE BUSINESS (The Futur)
# -------------------------------------------------------------
def make_poster_3():
    img = Image.new("RGB", (WIDTH, HEIGHT), (15, 23, 42)) # Slate 900
    draw = ImageDraw.Draw(img)

    # Header Ribbon
    draw.rectangle([(50, 50), (WIDTH - 50, 120)], fill=(30, 41, 59))
    draw.text((80, 72), "FRAMEWORK B2B // GUIDE ACTIONNABLE", fill=(203, 213, 225), font=get_font("mono", 24, bold=True))
    draw.text((WIDTH - 240, 72), "SLIDE 1/6  ->", fill=(245, 158, 11), font=get_font("mono", 24, bold=True))

    # Main Headline
    f_h1 = get_font("segoe", 58, bold=True)
    draw.text((80, 160), "LA MÉTHODE DES 5 P", fill=(245, 158, 11), font=f_h1)
    draw.text((80, 235), "POUR CONVERTIR EN 2026", fill=(255, 255, 255), font=f_h1)
    draw.text((80, 315), "Le framework psychologique pour transformer l'attention en chiffre d'affaires.", fill=(148, 163, 184), font=get_font("segoe", 26))

    # 5 Stacked High-Contrast Cards
    card_y = 390
    steps = [
        ("01", "PROBLÈME", "Nommer la douleur viscérale et le coût de l'inaction.", (239, 68, 68)),
        ("02", "PROMESSE", "Le résultat précis et désirable sans le compromis.", (245, 158, 11)),
        ("03", "PREUVE", "Données chiffrées, études de cas réelles et crédibilité.", (16, 185, 129)),
        ("04", "PROPOSITION", "L'offre limpide, irrésistible et sans friction.", (59, 130, 246)),
        ("05", "PASSAGE À L'ACTE", "Appel à l'action immédiat avec prochaine étape claire.", (139, 92, 246))
    ]

    for idx, (num, title, desc, accent) in enumerate(steps):
        cy = card_y + idx * 140
        draw.rounded_rectangle([(80, cy), (WIDTH - 80, cy + 120)], radius=12, fill=(30, 41, 59), outline=(51, 65, 85), width=2)
        
        # Color bar on the left
        draw.rounded_rectangle([(80, cy), (92, cy + 120)], radius=4, fill=accent)
        
        # Number badge
        draw.rounded_rectangle([(110, cy + 25), (180, cy + 95)], radius=8, fill=(15, 23, 42), outline=accent, width=2)
        draw.text((122, cy + 40), num, fill=accent, font=get_font("segoe", 32, bold=True))

        # Title & Description
        draw.text((205, cy + 28), title, fill=(255, 255, 255), font=get_font("segoe", 28, bold=True))
        draw.text((205, cy + 70), desc, fill=(148, 163, 184), font=get_font("segoe", 21))

    # Bottom Callout
    draw.line([(80, 1140), (WIDTH - 80, 1140)], fill=(51, 65, 85), width=1)
    draw.text((80, 1170), "DIRECTIVE IA : Infographie The Futur • Cartes 4:5", fill=(100, 116, 139), font=get_font("mono", 19))
    draw.text((WIDTH - 240, 1170), "GLISSEZ ->", fill=(245, 158, 11), font=get_font("mono", 24, bold=True))
    draw.text((80, 1205), "SOURCE REQUISE : 5 étapes rédigées + Flèche de swipe + Signature auteur", fill=(148, 163, 184), font=get_font("mono", 19))

    return img

# -------------------------------------------------------------
# POSTER 4: LIFESTYLE / DISCIPLINE / CAFE 07:15 (Monocle Style)
# -------------------------------------------------------------
def make_poster_4():
    img = Image.new("RGB", (WIDTH, HEIGHT), (28, 25, 23)) # Warm Dark Stone
    draw = ImageDraw.Draw(img)

    # Framing border
    draw.rectangle([(50, 50), (WIDTH - 50, HEIGHT - 50)], outline=(68, 64, 60), width=2)

    # Minimalist Header
    draw.text((90, 85), "EDITORIAL ESSAY // DISCIPLINE & FOCUS", fill=(168, 162, 158), font=get_font("mono", 22, bold=False))
    draw.text((WIDTH - 230, 85), "[07:15 AM]", fill=(245, 158, 11), font=get_font("mono", 24, bold=True))

    # Photo Simulation Area (Warm Oak Wood & Coffee Cup)
    photo_y = 150
    draw.rectangle([(90, photo_y), (WIDTH - 90, photo_y + 550)], fill=(41, 37, 36), outline=(68, 64, 60), width=2)

    # Ceramic Coffee Cup & Steam
    cc_x, cc_y = WIDTH // 2 - 120, photo_y + 270
    draw.ellipse([(cc_x - 80, cc_y - 80), (cc_x + 80, cc_y + 80)], fill=(12, 10, 9), outline=(120, 113, 108), width=4)
    draw.ellipse([(cc_x - 65, cc_y - 65), (cc_x + 65, cc_y + 65)], fill=(30, 20, 15)) # Dark coffee crema
    # Steam
    for s in range(3):
        sx = cc_x - 20 + s * 20
        draw.arc([(sx, cc_y - 150), (sx + 40, cc_y - 85)], 90, 270, fill=(168, 162, 158), width=2)

    # Notebook & Pen beside cup
    nb_x, nb_y = WIDTH // 2 + 60, photo_y + 160
    draw.rectangle([(nb_x, nb_y), (nb_x + 240, nb_y + 280)], fill=(18, 16, 14), outline=(120, 113, 108), width=2)
    for line_idx in range(6):
        draw.line([(nb_x + 30, nb_y + 40 + line_idx * 35), (nb_x + 210, nb_y + 40 + line_idx * 35)], fill=(68, 64, 60), width=1)
    # Fountain pen
    draw.line([(nb_x + 270, nb_y + 30), (nb_x + 270, nb_y + 250)], fill=(214, 211, 209), width=6)

    # Caption overlay inside photo
    draw.rounded_rectangle([(WIDTH // 2 - 190, photo_y + 480), (WIDTH // 2 + 190, photo_y + 525)], radius=8, fill=(12, 10, 9), outline=(245, 158, 11), width=1)
    draw.text((WIDTH // 2 - 165, photo_y + 492), "BUREAU & CAFE • ABIDJAN 07:15", fill=(245, 158, 11), font=get_font("mono", 18, bold=True))

    # Big Editorial Typography
    f_quote = get_font("segoe", 52, bold=True)
    draw.text((90, 750), "07:15 — LE CALME", fill=(255, 255, 255), font=f_quote)
    draw.text((90, 825), "AVANT LA TEMPÊTE.", fill=(245, 158, 11), font=f_quote)

    f_p = get_font("calibri", 30, bold=False)
    draw.text((90, 930), "« La motivation te fait démarrer.", fill=(214, 211, 209), font=f_p)
    draw.text((90, 975), "La discipline te fait continuer quand l'enthousiasme s'estompe. »", fill=(168, 162, 158), font=f_p)

    draw.text((90, 1060), "Les résultats d'un entrepreneur ne se jouent pas sur scène,", fill=(120, 113, 108), font=get_font("calibri", 26, bold=False))
    draw.text((90, 1098), "mais dans le silence des premières heures du matin.", fill=(120, 113, 108), font=get_font("calibri", 26, bold=False))

    # Bottom metadata
    draw.line([(90, 1160), (WIDTH - 90, 1160)], fill=(68, 64, 60), width=1)
    draw.text((90, 1190), "DIRECTIVE IA : Photo flat-lay argentique 35mm • Lumière rasante • Ambiance calme", fill=(120, 113, 108), font=get_font("mono", 19))
    draw.text((90, 1225), "SOURCE REQUISE : Photo réelle de bureau + Tasse café + Carnet d'écriture", fill=(168, 162, 158), font=get_font("mono", 19))

    return img

print("Generating 4 posters...")
p1 = make_poster_1()
p1.save(os.path.join(OUTPUT_DIR, "inspiration-1-personal-branding.jpg"), quality=95)
p1.save(os.path.join(BRAIN_DIR, "inspiration-1-personal-branding.jpg"), quality=95)

p2 = make_poster_2()
p2.save(os.path.join(OUTPUT_DIR, "inspiration-2-ai-tech-editorial.jpg"), quality=95)
p2.save(os.path.join(BRAIN_DIR, "inspiration-2-ai-tech-editorial.jpg"), quality=95)

p3 = make_poster_3()
p3.save(os.path.join(OUTPUT_DIR, "inspiration-3-carousel-5p-framework.jpg"), quality=95)
p3.save(os.path.join(BRAIN_DIR, "inspiration-3-carousel-5p-framework.jpg"), quality=95)

p4 = make_poster_4()
p4.save(os.path.join(OUTPUT_DIR, "inspiration-4-discipline-lifestyle.jpg"), quality=95)
p4.save(os.path.join(BRAIN_DIR, "inspiration-4-discipline-lifestyle.jpg"), quality=95)

print("All 4 inspiration posters generated successfully!")
