# DSSSB TGT Computer Science — डिजिटल अभ्यास पुस्तिका

15 अध्यायों के MCQ (752), PYQ (77), सही/गलत (184), रिक्त स्थान (130) और Random Mock Test वाली static वेबसाइट।
Login/Sign up, गलतियों की डायरी और स्कोर ट्रैकिंग शामिल है। **कोई build step या server नहीं चाहिए** — सीधे Vercel पर चलती है।

## Folder का ढाँचा

```
index.html                  पेज (title, meta, script/CSS links)
vercel.json                 Vercel settings
favicon.svg                 टैब का आइकन
assets/
  css/style.css             सारा डिज़ाइन
  js/app.js                 मुख्य लॉजिक (होम, क्विज़, Mock, T/F, Fill, डायरी)
  js/auth.js                Sign up / Login / प्रोफ़ाइल / Backup-Restore
  js/sound.js               आवाज़ें और confetti
  js/data/bank.js           सारे प्रश्न (AUTO-GENERATED — हाथ से edit न करें)
data-src/                   प्रश्नों का असली source (यहीं बदलाव करें)
  q00.json … q14.json       अध्याय 1 … 15  (mcq / tf / fill)
  pyq15.json, pyq16.json    पिछले वर्षों के प्रश्न
scripts/build_bank.py       data-src से bank.js दोबारा बनाता है
```

## पहली बार: GitHub + Vercel पर डालना

1. **GitHub पर नया repository बनाएँ** (जैसे `dsssb-workbook`), खाली — README/gitignore न जोड़ें।
2. इस folder में Terminal खोलकर:
   ```bash
   git init
   git add .
   git commit -m "first version"
   git branch -M main
   git remote add origin https://github.com/<आपका-username>/dsssb-workbook.git
   git push -u origin main
   ```
   (Terminal न चाहें तो GitHub पर *Add file → Upload files* से पूरा folder खींचकर डाल सकते हैं।)
3. **vercel.com** पर GitHub से login करें → *Add New → Project* → यही repository *Import* करें।
4. Settings जैसी हैं वैसी रहने दें:
   - Framework Preset: **Other**
   - Build Command: खाली
   - Output Directory: खाली
   - *Deploy* दबाएँ। 1 मिनट में `https://<project>.vercel.app` लिंक मिल जाएगा।

## बाद में अपडेट करना (हर बार यही तरीका)

**A. प्रश्न जोड़ना / सुधारना**
1. `data-src/q05.json` जैसी फ़ाइल खोलें (नंबर = अध्याय − 1, यानी `q00` = अध्याय 1)।
2. नया प्रश्न **सूची के अंत में** जोड़ें (बीच में डालने से विकल्पों का shuffle बदल सकता है)।
   ```json
   {"q":"प्रश्न","o":["विकल्प 1","विकल्प 2","विकल्प 3","विकल्प 4"],"a":0,"e":"व्याख्या","t":"सेक्शन का नाम"}
   ```
   `a` = सही विकल्प का नंबर (0 से 3)। सही/गलत: `{"s":"कथन","a":true,"n":"टिप्पणी"}`।
   रिक्त स्थान: `{"q":"... ______ ...","d":"उत्तर","alts":"उत्तर1~उत्तर2"}` (alts छोटे अक्षरों में, बिना space, `~` से अलग)।
3. Terminal में: `python3 scripts/build_bank.py`
4. फिर: `git add . && git commit -m "नए प्रश्न" && git push`
5. Vercel अपने-आप नया version deploy कर देगा।

**B. डिज़ाइन / फ़ीचर बदलना:** `assets/css/style.css` या `assets/js/app.js` बदलें, फिर commit + push।

**C. (ज़रूरी नहीं) Cache refresh:** अगर किसी विद्यार्थी को पुराना version दिखे तो `index.html` में `?v=1` को `?v=2` कर दें।

## Local में चलाकर देखना

```bash
python3 -m http.server 8000
```
फिर ब्राउज़र में `http://localhost:8000` खोलें।

## ध्यान रखें

- Login और प्रगति हर विद्यार्थी के **अपने ब्राउज़र** (localStorage) में सेव होती है। Email की verification नहीं होती और एक डिवाइस का डेटा दूसरे पर अपने-आप नहीं जाता — इसके लिए प्रोफ़ाइल में Backup/Restore है।
  असली सर्वर वाला login (Email verification + सब डिवाइस पर sync) चाहिए तो Firebase/Supabase जोड़ना होगा।
- `data-src` में दिए गए अध्याय-वार प्रश्न DSSSB नोट्स से बनाए गए अभ्यास-प्रश्न हैं; PYQ सेट स्रोत फ़ाइल के असली प्रश्न हैं।
- Fonts Google Fonts से आते हैं, इसलिए पहली बार इंटरनेट चाहिए।
