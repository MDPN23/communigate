# CommuniGate - Design System & UI Guidelines (Revised: Noir Rainbow)

## 1. Aesthetic Concept & Architecture
- **Component Library:** `shadcn/ui` (Radix UI + TailwindCSS).
- **Theme Mode:** **Pure Noir (Dark Only)**. Estetika yang mengandalkan kegelapan pekat untuk menonjolkan aksen cahaya spektrum.
- **Visual Style:** **"Spectral Minimalis"**. Memadukan layout kotak-kotak (Bento Box) dari referensi Dribbble dengan detail garis tipis dan gradasi pelangi halus (rainbow accent) yang terinspirasi dari TEN.xyz.

## 2. Global CSS Variables (shadcn/ui Overrides)
Salin ini ke dalam file `app/globals.css` Anda untuk mengubah basis warna menjadi Deep Noir.

```css
@layer base {
  :root {
    /* Obsidian Black Base */
    --background: 0 0% 2%;        /* #050505 */
    --foreground: 0 0% 98%;       /* White Smoke */
    
    /* Noir Cards */
    --card: 0 0% 4%;              /* #0A0A0A */
    --card-foreground: 0 0% 98%;
    
    --popover: 0 0% 3%;
    --popover-foreground: 0 0% 98%;
    
    /* Action Colors */
    --primary: 0 0% 100%;         /* Pure White */
    --primary-foreground: 0 0% 0%;
    
    --secondary: 0 0% 10%;
    --secondary-foreground: 0 0% 98%;
    
    /* Muted & Borders */
    --muted: 0 0% 12%;
    --muted-foreground: 0 0% 63%;
    --border: 0 0% 12%;           /* Subtle Border */
    --input: 0 0% 12%;
    --ring: 0 0% 100%;            /* Focus White */
    
    --radius: 1rem;
  }
}


3. The Rainbow Spectrum (TEN.xyz Style)
Aksen pelangi diimplementasikan sebagai garis pembatas atau "aura" tipis, bukan warna blok.

Spectrum Gradient: linear-gradient(to right, #FF5F6D, #FFC371, #81FFB4, #48D1CC, #C77DFF)

Usage Rule: Hanya muncul pada divider tipis, active state indicator, atau border-image saat hover pada komponen kartu.

4. UI Components & Tailwind Styling
Layout: Bento Box Grid
Gunakan grid yang tidak simetris untuk kesan modern dan eksklusif.

Classes: grid grid-cols-1 md:grid-cols-12 gap-4 p-4

Card Styling: bg-card border border-white/5 rounded-2xl p-6 transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]

Typography (Noir Aesthetic)
Headings: Plus Jakarta Sans, font-bold, tracking-tighter. Gunakan gradasi tipis pada text: bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60.

Body: Inter, font-normal, text-muted-foreground (untuk readability).

Data/Web3: Geist Mono untuk address dompet dan transaksi.

Navigation & Divider
Meniru TEN.xyz dengan garis pemisah yang "menghilang" di ujung.

Spectral Divider: ```html

Interactive Buttons
Primary Action: rounded-full bg-white text-black hover:scale-105 transition-transform px-10 py-3 font-semibold

Rainbow Outline: rounded-full border border-white/10 bg-black/40 hover:border-cyan-400/50 transition-all duration-300

5. Visual Identity & Assets
Glassmorphism: Gunakan backdrop-blur-xl pada navbar dan modal dengan opacity background maksimal 60% (bg-black/60).

Icons: Gunakan Lucide React dengan strokeWidth={1.25} untuk menjaga tampilan tetap tipis/airy.

Grain Overlay: Tambahkan noise filter statis pada background untuk menghilangkan efek "flat black" dan memberikan kesan tekstur film.

6. Development Checklist
[ ] Matikan fitur Toggle Light Mode (Fixed Dark).

[ ] Pastikan font-family sudah terinstal di layout.tsx.

[ ] Gunakan framer-motion untuk efek staggered-fade-in pada grid bento.