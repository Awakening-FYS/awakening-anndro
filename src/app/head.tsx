export default function Head() {
  return (
    <>
      {/* Inline theme init: read localStorage or system preference and apply .dark early to avoid FOUC */}
      <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('site-theme');if(s==='dark'){document.documentElement.classList.add('dark');}else if(s==='light'){document.documentElement.classList.remove('dark');}else{if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}}catch(e){} })()`}} />
      <link rel="icon" href="/favicon-dark.ico" media="(prefers-color-scheme: light)" />
      <link rel="icon" href="/favicon-light.ico" media="(prefers-color-scheme: dark)" />
      {/* fallback */}
      <link rel="icon" href="/favicon.ico" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#0b1220" media="(prefers-color-scheme: dark)" />
      {/* Display fonts for the site title - loaded here to avoid CSS @import parsing issues */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  {/* Use Noto Sans SC (clear Chinese sans) for improved legibility */}
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet" />
  {/* Artistic display font for the title */}
  <link href="https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&display=swap" rel="stylesheet" />
  {/* Local font preloads (place woff2 files into /public/fonts/) */}
  <link rel="preload" href="/fonts/ZCOOLXiaoWei-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preload" href="/fonts/ZCOOLQingKeHuangYou-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  {/* Try a different ZCOOL display font with stronger calligraphic feel */}
  <link href="https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap" rel="stylesheet" />
    {/* Preload Roboto woff2 to improve font availability */}
    <link rel="preload" href="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    </>
  )
}
