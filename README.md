📝 Next.js Poznámkový Blok
Tato aplikace je jednoduchý správce poznámek postavený na frameworku Next.js s využitím Prisma ORM, NextAuth pro autentizaci a Tailwind CSS pro stylování.

🚀 Instalace a požadavky
Požadavky
Node.js (verze 18.x nebo novější)

npm nebo yarn

PostgreSQL (lokální instance nebo cloudová databáze jako např. Supabase či Neon)

Kroky k instalaci
Naklonujte repozitář do svého lokálního prostředí.

V terminálu přejděte do složky projektu:

Bash
cd todolisthuh2
Nainstalujte potřebné závislosti:

Bash
npm install
⚙️ Nastavení prostředí (.env)
Aplikace vyžaduje nastavení proměnných prostředí pro správný chod databáze a autentizace.

Vytvořte soubor .env v kořenovém adresáři projektu a zkopírujte do něj obsah ze souboru .env.example.

Povinné proměnné:

DATABASE_URL: Připojovací řetězec k vaší PostgreSQL databázi.

NEXTAUTH_SECRET: Náhodný řetězec použitý pro zabezpečení session.

NEXTAUTH_URL: Pro lokální vývoj použijte http://localhost:3000.

💾 Migrace a spuštění (lokálně)
Před prvním spuštěním je nutné připravit databázové schéma a naplnit jej daty:

Spuštění migrací Prisma:
Vytvoří tabulky v databázi podle definovaného schématu.

Bash
npx prisma migrate dev --name init
Naplnění databáze (Seed):
Vytvoří demo uživatele a úvodní poznámky.

Bash
npx prisma db seed
Spuštění vývojového serveru:

Bash
npm run dev
Aplikace bude dostupná na adrese http://localhost:3000.

👤 Demo uživatel
Pro testování aplikace můžete využít předvytvořený účet ze seed skriptu:

Uživatelské jméno: demo

Heslo: demo

📥 Export a import poznámek
Aplikace umožňuje přenos dat ve formátu JSON pomocí následujících funkcí:

Export
V aplikaci: Na nástěnce (Dashboard) klikněte v bočním panelu na "↓ Export All JSON" pro stažení všech vašich poznámek.

Přes API: Export lze vyvolat přímo voláním GET požadavku na /api/notes/export.

Import
V aplikaci: V bočním panelu klikněte na "↑ Import JSON File" a vyberte dříve exportovaný soubor.

Přes API: Import funguje jako POST požadavek na /api/notes/import s JSON tělem obsahujícím pole poznámek.