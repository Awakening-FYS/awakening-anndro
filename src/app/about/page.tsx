export default function AboutPage() {
  return (
    
    <main className="min-h-screen flex flex-col px-5 py-0 bg-page-gradient">
      <section className="w-full bg-cover bg-center py-20 rounded-lg" style={{ backgroundImage: `url('/images/meditation-basic.jpg')` }}>
  <div className="bg-card/70 dark:bg-black/40 p-8 rounded-lg max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">关于我们</h1>
          <p className="text-gray-600 leading-relaxed">
            我们的使命是帮助更多人通过觉察与冥想找到内心的平静。找到各自人生的意义。
          </p>
        </div>
      </section>
    </main>
  )
}
