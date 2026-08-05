# Study OS Plus — Quantum Edition

نظام إدارة دراسة بسيط وسريع. Offline-first بالكامل، مع مزامنة اختيارية بين
الأجهزة عبر Supabase.

## التشغيل محليًا

```bash
npm install
npm run dev
```

يفتح على `http://localhost:5173`. التطبيق يشتغل بالكامل offline بدون أي
إعداد إضافي — المزامنة اختيارية بالكامل (شوف تحت).

### أيقونات PWA (خطوة اختيارية)

أيقونات تثبيت التطبيق (`public/icons/*.png`) مش متوفرة جاهزة في هذه
الحزمة. لتوليدها:

```bash
npm install -D sharp
node scripts/generate-icons.mjs
```

التطبيق يشتغل ويُبنى بشكل طبيعي حتى بدون هذه الخطوة — الأيقونات فقط
تؤثر على شكل التطبيق عند "الإضافة للشاشة الرئيسية".

## البناء للإنتاج

```bash
npm run build
npm run preview
```

الناتج في `dist/` — أي استضافة استاتيكية تكفي (Netlify, Vercel, GitHub Pages).

## تفعيل المزامنة بين الأجهزة (اختياري)

المشروع بيشتغل 100% من غير الخطوات دي. لو عايز مزامنة بين موبايل ولابتوب
(وحماية من مسح المتصفح بالغلط)، اتبع الخطوات دي:

### 1) أنشئ مشروع Supabase
من [supabase.com](https://supabase.com) اعمل مشروع جديد مجاني.

### 2) شغّل السكريبت
افتح **SQL Editor** في لوحة تحكم Supabase، وشغّل محتوى الملف
`supabase/schema.sql` كامل. ده هيعمل الجداول الخمسة (subjects, nodes,
homework, exams, mistakes) مع RLS (Row Level Security) عشان بياناتك تفضل
خاصة بيك بس.

### 3) أضف حسابك
روح **Authentication > Users** واضغط "Add user" وحط إيميلك (وكلمة سر
عشوائية، مش هتستخدمها — الدخول في التطبيق بيتم بكود عبر الإيميل فقط).

التطبيق مبني عشان **مفيش تسجيل حساب جديد من جوّاه** — بس أنت اللي تقدر
تدخل بالإيميل اللي أضفته يدويًا.

### 4) وصّل التطبيق بمشروعك
من **Settings > API** في Supabase، هتلاقي:
- `Project URL`
- `anon public key`

انسخ ملف `.env.example` باسم `.env.local` وحط القيم:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxx
```

أعد تشغيل `npm run dev`. هتلاقي في صفحة الإعدادات خيار "تسجيل الدخول
للمزامنة" ظهر. سجل دخولك بالإيميل، هيوصلك كود، اكتبه، وخلاص.

### إزاي شغالة المزامنة؟
- كل تعديل بيتسجل فورًا في IndexedDB (زي ما هو دايمًا) — مفيش أي تأخير
  محسوس في الواجهة أبدًا.
- في الخلفية، التعديلات بتتبعت لـ Supabase تلقائيًا كل ما يكون فيه إنترنت.
- لما تفتح جهاز جديد وتسجل دخول، بياناتك بتنزل تلقائيًا.
- لو عدلت نفس الحاجة على جهازين في نفس الوقت من غير إنترنت، آخر تعديل
  (بالتوقيت) هو اللي بيفوز عند المزامنة.

## البيانات والنسخ الاحتياطي

بغض النظر عن المزامنة، تقدر دايمًا من صفحة الإعدادات:
- تصدير نسخة احتياطية (ملف JSON) يدويًا
- استيراد نسخة احتياطية (تستبدل البيانات الحالية)
- إعادة ضبط كل البيانات

## البنية

```
src/
  db/          # Dexie schema, backup/restore, mutation helpers
  lib/         # sync engine, auth, tree/search helpers, icons, theme
  types.ts     # shared TypeScript types
  components/  # reusable UI (nav, sheets, cards, tree, login)
  pages/       # Home, Subjects, SubjectDetail, LessonDetail,
               # Homework, Exams, Mistakes, Search, Settings
supabase/
  schema.sql   # paste into Supabase SQL Editor
```
