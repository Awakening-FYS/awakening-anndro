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
    </>
  )
}
