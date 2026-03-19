export default function Page() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!-- TopAppBar -->
<header class="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-[#fcf9f4]/80 dark:bg-stone-900/80 backdrop-blur-md z-50">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-surface-container overflow-hidden">
<img class="w-full h-full object-cover" data-alt="User profile portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzoy1hRUT4tQMNk8hgkpYRGXuF3YtUXbGvnU3oZfY_8GwJL82acmcCiFnBlM2FjOku01lPoWPJzBtNK6QUcmrt3qETadP957fyHprI5QUV_VSVxc0mYI-WGh1EIdPB78dSm2GarFTIDTGIDOz_9vGqUPQOzzTBhip9Qvju0m-JuNm-BrssKuDGheRa0y83C2CNA_7LZwgdMxC44MxvuMpoegQKJLrVD6Cl9DzZb75rdVEcd3Z1kbrcqSoIc9-xwZ5760dFClDcGJU7"/>
</div>
<span class="font-serif italic text-2xl text-[#162b1d] dark:text-[#fcf9f4]">LibroLog</span>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors">
<span class="material-symbols-outlined text-[#162b1d] dark:text-[#fcf9f4]" data-icon="settings">settings</span>
</button>
</header>
<main class="pt-24 pb-32 px-6 max-w-4xl mx-auto">
<!-- Personalized Greeting & Quick Summary Bento -->
<section class="mb-10">
<h1 class="font-headline text-4xl font-light mb-8 text-primary">Bentornato, Marco.</h1>
<div class="grid grid-cols-2 gap-4">
<div class="bg-surface-container p-6 rounded-xl flex flex-col justify-between aspect-square md:aspect-auto md:h-32">
<span class="font-label text-xs uppercase tracking-widest text-secondary">Libri letti nel 2024</span>
<span class="font-headline text-5xl font-bold text-primary">12</span>
</div>
<div class="bg-primary-container p-6 rounded-xl flex flex-col justify-between aspect-square md:aspect-auto md:h-32">
<span class="font-label text-xs uppercase tracking-widest text-on-primary-container opacity-80">Pagine totali</span>
<span class="font-headline text-5xl font-bold text-white">4.382</span>
</div>
</div>
</section>
<!-- Currently Reading Section -->
<section class="mb-12">
<div class="flex justify-between items-baseline mb-6">
<h2 class="font-headline text-2xl text-primary">In lettura</h2>
<button class="text-secondary text-sm font-medium hover:underline">Vedi libreria</button>
</div>
<!-- Reading Card -->
<div class="bg-surface-container-low rounded-2xl overflow-hidden flex flex-col md:flex-row gap-6 p-6">
<div class="w-full md:w-48 aspect-[2/3] rounded-lg shadow-lg overflow-hidden flex-shrink-0">
<img class="w-full h-full object-cover" data-alt="Book cover of The Great Gatsby" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmBlKq9D2D3j8IcB2uWmJT6lUn5SpPW8qpakT6wpjWZptWiYmbqUHdOJKiFS4hcXKszZFXkAEbstZEQGU02zjmzqMD8wNXYPvU2EIrz8Jq-OoksQV8zNDOcD_zCqUrowGKQzWOv5lzVrotxHNu-4tCCrCIT6zAJoa-FqtCxdEGWkBbBGWLsyja0LUmx9IvE_KVIzW2ljFKcU8f0b1WRb0VwPaZf1HEt0NM1BxJvNHHng9Xpc_M6CUIBDUQJc44_0BL5w4BGmvUyuIV"/>
</div>
<div class="flex flex-col justify-between flex-grow py-2">
<div>
<h3 class="font-headline text-3xl text-primary mb-1">Il Grande Gatsby</h3>
<p class="font-body text-secondary text-lg mb-6">F. Scott Fitzgerald</p>
<div class="space-y-2 mb-8">
<div class="flex justify-between items-end">
<span class="font-label text-sm text-on-surface-variant font-medium">68% completato</span>
<span class="font-label text-xs text-secondary italic">Pagina 122 di 180</span>
</div>
<!-- Progress Ledger -->
<div class="h-1 w-full bg-primary-fixed rounded-full overflow-hidden">
<div class="h-full bg-primary rounded-full" style="width: 68%;"></div>
</div>
</div>
</div>
<button class="w-full py-4 bg-primary text-white rounded-full font-body font-semibold flex items-center justify-center gap-2 shadow-[0px_12px_32px_rgba(28,28,25,0.05)] transition-transform active:scale-95">
<span class="material-symbols-outlined" data-icon="edit">edit</span>
                        Aggiorna Pagine
                    </button>
</div>
</div>
</section>
<!-- Suggestions Carousel -->
<section class="mb-12">
<div class="flex justify-between items-baseline mb-6">
<h2 class="font-headline text-2xl text-primary">Suggerimenti</h2>
<div class="flex gap-2">
<button class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container text-primary hover:bg-surface-container-high">
<span class="material-symbols-outlined text-sm" data-icon="chevron_left">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container text-primary hover:bg-surface-container-high">
<span class="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
<div class="flex gap-6 overflow-x-auto hide-scrollbar pb-4 -mx-2 px-2">
<!-- Suggestion Card 1 -->
<div class="flex-shrink-0 w-40">
<div class="aspect-[2/3] bg-surface-container-highest rounded-lg mb-3 shadow-sm overflow-hidden group relative">
<img class="w-full h-full object-cover" data-alt="Book cover minimalist design" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB8tz13azEg3RZaVoBvFKm-9fAJ338zF0OwuhDgusAdpUndjJglp7DNK1CSs-DfTq9wB6iNnQyo7mFYWM_Ems7NTUkEQV6P9cb05nOSqjk5WTJDPdMWQJADxenY0GFNQuCS8JHqso3lsBwGdU0kK4_gnZx7R-vouwTXbU2cS0ECfAZtPsnTD3Itk3CAKXhfHHfdShZ1x999tDdEqNq4FgCoH74bI2NwiaRuGLXVU7vZMTKm8GMTvZyB4dF1scqfXbnPvm5USpyxCma"/>
<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
<span class="material-symbols-outlined text-white text-3xl" data-icon="add">add</span>
</div>
</div>
<h4 class="font-body font-bold text-sm text-primary truncate">1984</h4>
<p class="font-body text-xs text-secondary truncate">George Orwell</p>
</div>
<!-- Suggestion Card 2 -->
<div class="flex-shrink-0 w-40">
<div class="aspect-[2/3] bg-surface-container-highest rounded-lg mb-3 shadow-sm overflow-hidden group relative">
<img class="w-full h-full object-cover" data-alt="Old book aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU26Q36K4LrWhPbaa_nAkbwPyWg6skW8kf8VzI7doVa2h4aEHQaLGxGKFXNyV_TKN2SeS4vEfBO5kXXWsJnXtts6sN71rwioNBV1LUVqyoIL7SNKB4A940rAUMZvklFqyUJv2uwfAwFDhBLW_rquMIVeZegHB2Jr45OkRfQcuZMoqvkkBMusvxqPiT230MTwwKQeIhElk9Jbk1Es5dSWT3hwuVZ5z6IRF4qB0qW8Y8UcKPwxPmebFvUDFHXkM7PFqNQ3wFbcIMtQnn"/>
<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
<span class="material-symbols-outlined text-white text-3xl" data-icon="add">add</span>
</div>
</div>
<h4 class="font-body font-bold text-sm text-primary truncate">Cime Tempestose</h4>
<p class="font-body text-xs text-secondary truncate">Emily Brontë</p>
</div>
<!-- Suggestion Card 3 -->
<div class="flex-shrink-0 w-40">
<div class="aspect-[2/3] bg-surface-container-highest rounded-lg mb-3 shadow-sm overflow-hidden group relative">
<img class="w-full h-full object-cover" data-alt="Library book cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBirNGguwNxGnCQj2_53gDE9X1rZ2vJv2DDZF85fIGd1iyG2tJosRq0Mpj0-eDK6iB2tysFN1mbKk5zvjoL7CaLe08eO0W8S6GoR4cn22WFxyiklLsqF_geExz3iosMIhYvnQlwvZDAVJlxfzDNr-bO0sLcFl9GFcJjs8Phz5DzPmZNRH8nRv6gCMxZRh25QbNG_vudlu8iRXi89po22AhKdnNopL6h1pvFXg-iBvTFmkPwj-EjpR3zNU1FUHAuCUS-Ss0IJWo4jgvB"/>
<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
<span class="material-symbols-outlined text-white text-3xl" data-icon="add">add</span>
</div>
</div>
<h4 class="font-body font-bold text-sm text-primary truncate">Siddhartha</h4>
<p class="font-body text-xs text-secondary truncate">Herman Hesse</p>
</div>
<!-- Suggestion Card 4 -->
<div class="flex-shrink-0 w-40">
<div class="aspect-[2/3] bg-surface-container-highest rounded-lg mb-3 shadow-sm overflow-hidden group relative">
<img class="w-full h-full object-cover" data-alt="Abstract literary cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwclQ-lvC_YxSyNaB1LQfEp7uubORhFHvRAQpr08Dkhh44KWibzontmVhbLOYwVzYoAhglABTeF9ayhbN2mJ_kabN4Ctxy7T97H8nh_5MyboTm2YQ7Pp-L-tSsIDcdxvjlNxNBIlm45Oft8u0rnUSgWJPPHSIZqCuz3-Rbt5CknmtjyEd9oSaH2MDMn1lhXAf9HTHpPKh8fi6V4Y0lqpCfbb0-cteYsaOhpbXxZ-WjGlkghMr-aRxmH0wQF3SmCAKRQGo8xtpGJ_qf"/>
<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
<span class="material-symbols-outlined text-white text-3xl" data-icon="add">add</span>
</div>
</div>
<h4 class="font-body font-bold text-sm text-primary truncate">L'Alchimista</h4>
<p class="font-body text-xs text-secondary truncate">Paulo Coelho</p>
</div>
</div>
</section>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#fcf9f4]/90 dark:bg-stone-900/90 backdrop-blur-xl z-50 rounded-t-3xl shadow-[0px_-12px_32px_rgba(28,28,25,0.05)] border-none">
<a class="flex flex-col items-center justify-center bg-[#2c4132] text-[#fcf9f4] rounded-2xl px-5 py-2 scale-105 transition-all" href="#">
<span class="material-symbols-outlined" data-icon="home" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="font-sans Manrope font-medium text-[10px] tracking-wide">Home</span>
</a>
<a class="flex flex-col items-center justify-center text-[#4e6073] dark:text-stone-400 px-5 py-2 hover:text-[#162b1d] dark:hover:text-white" href="#">
<span class="material-symbols-outlined" data-icon="menu_book">menu_book</span>
<span class="font-sans Manrope font-medium text-[10px] tracking-wide">Libreria</span>
</a>
<a class="flex flex-col items-center justify-center text-[#4e6073] dark:text-stone-400 px-5 py-2 hover:text-[#162b1d] dark:hover:text-white" href="#">
<span class="material-symbols-outlined" data-icon="search">search</span>
<span class="font-sans Manrope font-medium text-[10px] tracking-wide">Cerca</span>
</a>
<a class="flex flex-col items-center justify-center text-[#4e6073] dark:text-stone-400 px-5 py-2 hover:text-[#162b1d] dark:hover:text-white" href="#">
<span class="material-symbols-outlined" data-icon="leaderboard">leaderboard</span>
<span class="font-sans Manrope font-medium text-[10px] tracking-wide">Statistiche</span>
</a>
</nav>
<!-- Contextual FAB - Rendered for Home context as per instructions -->
<div class="fixed right-6 bottom-28 md:right-12">
<button class="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
<span class="material-symbols-outlined text-3xl" data-icon="add_circle">add_circle</span>
</button>
</div>`,
      }}
    />
  );
}
