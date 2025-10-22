export default function Head() {
  return (
    <>
      <link rel="icon" href="/favicon-dark.ico" media="(prefers-color-scheme: light)" />
      <link rel="icon" href="/favicon-light.ico" media="(prefers-color-scheme: dark)" />
      {/* fallback */}
      <link rel="icon" href="/favicon.ico" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#0b1220" media="(prefers-color-scheme: dark)" />
    </>
  )
}
