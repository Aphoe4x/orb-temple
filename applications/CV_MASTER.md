# CV Source of Truth

The current CV lives in **CV_MASTER.html** — edit that file, then regenerate the Word version:

```powershell
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("C:\xampp\htdocs\applications\CV_MASTER.html")
$doc.SaveAs2("C:\xampp\htdocs\applications\Afolabi_Abdulbasit_CV_Backend_Developer.docx", 16)
$doc.Close($false)
$word.Quit()
```

Final deliverable: **Afolabi_Abdulbasit_CV_Backend_Developer.docx**

## Changes applied (13 Oct 2026)

- Artgidi dates corrected: Sep 2024 – Nov 2025 (ended)
- Education section removed (B.Eng.)
- Certification section removed (Cisco Cybersecurity)
- LinkedIn removed from contact line
- All links clickable and working: GitHub, portfolio, email
- Added HNG15 — AI Product Engineer **Intern** (Sep 2026 – Present; ~7–8 week program, ends ~Nov 2026 — update or remove once finished)
- Added projects: E-Commerce Platform (Node.js/React/Supabase), AI-Assisted Todo (Docker/Render), live demo link
- Title now: "Backend / Full-Stack Developer — Node.js, PHP, Laravel, APIs"

## Per-application tailoring reminders (from old master)

- **Automattic**: elevate WordPress/CASE + WooCommerce; AI workflow mention
- **Whippy**: APIs, webhooks, relational DB work, async English
- **Genki/Metabase**: reading unfamiliar codebases, self-teaching, JS strength
- **Fingerprint**: MySQL optimization, production troubleshooting, honest about Node level
