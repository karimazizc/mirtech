"use client";

export default function ProfilePage() {
  return (
    <main className="flex-1 p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-16 relative">
        <div className="absolute -left-4 top-0 w-1 h-24 bg-linear-to-b from-[#1a7faf] to-transparent"></div>
        <h1 className="text-5xl font-bold text-black mb-3 tracking-tight">Karim Abdul Aziz Chatab</h1>
        <p className="text-xl text-gray-700 mb-4 font-medium">
          Data Engineer / Software Engineer / Data Scientist
        </p>
        <p className="text-gray-600 mb-6 text-lg">
          Get to know me more !
        </p>
        <blockquote className="relative border-l-4 border-[#1a7faf] pl-6 py-2 italic text-gray-600 bg-gray-50 rounded-r-lg">
          "The sciences are not merely tools for livelihood but are paths to understanding the order of the universe." 
          <span className="block text-sm mt-2 not-italic font-medium text-gray-700">— Ibn Khaldun, Muqaddimah</span>
        </blockquote>
      </div>

      {/* About Me */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-bold text-black">About Me</h2>
          <div className="flex-1 h-px bg-linear-to-r from-gray-300 to-transparent"></div>
        </div>
        <div className="text-gray-700 space-y-4 leading-relaxed text-base bg-white p-6 rounded-lg ">
          <p>
            I just graduated recently from Monash University majoring in Business Analytics and Finance. I previously worked as a data engineer at Geomotion and currently building Whisttle on the side with my colleagues. As of right now, I decided I am looking for a full-time position in a data related role.
          </p>
          <p>
            I've went to study in the United Kingdom under an exchange program at Warwick University, where I learn about financial analytics, econometrics, exchange rate forecasting, and entrepreneurship. Building things has always been my passion, and I love to create things that are meaningful and impactful. You can navigate through my portfolio to see some of the projects I have worked on.
          </p>
          <p>
            I've been reading alot of books lately as a healthy habit, and I am currently reading "The 48 of Laws of Power" by Robert Greene and "Deep Work" by Cal Newport. Perhaps I'm going to write a book review on my blog about these books and previous books I've read later, I don't know yet haha.
          </p>
          <p>
            I want to get masters one day, but I don't know what to study yet. I believe it's best to build my career first and have hands-on experience before that.
          </p>
        </div>
      </section>

      {/* Skills & Technologies */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-bold text-black">Skills & Technologies</h2>
          <div className="flex-1 h-px bg-linear-to-r from-gray-300 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg  hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-[#1a7faf] mb-3 uppercase tracking-wide">Languages</h3>
            <p className="text-gray-700 leading-relaxed">Python, SQL, R, Javascript, Swift, HTML, CSS, Typescript</p>
          </div>
          <div className="bg-white p-5 rounded-lg  hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-[#1a7faf] mb-3 uppercase tracking-wide">Backend & Tools</h3>
            <p className="text-gray-700 leading-relaxed">Django, Redis, Celery, Selenium, Playwright, BeautifulSoup, Shiny</p>
          </div>
          <div className="bg-white p-5 rounded-lg  hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-[#1a7faf] mb-3 uppercase tracking-wide">Frontend</h3>
            <p className="text-gray-700 leading-relaxed">Next.js, FastAPI, React.js, TailwindCSS, Vue.js</p>
          </div>
          <div className="bg-white p-5 rounded-lg  hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-[#1a7faf] mb-3 uppercase tracking-wide">Data & Analytics</h3>
            <p className="text-gray-700 leading-relaxed">Data Visualization (Tableau, R Shiny, Matplotlib), Machine Learning & Deep Learning, Web Scraping & Data Mining</p>
          </div>
          <div className="bg-white p-5 rounded-lg  hover:shadow-md transition-shadow md:col-span-2">
            <h3 className="text-sm font-bold text-[#1a7faf] mb-3 uppercase tracking-wide">Cloud</h3>
            <p className="text-gray-700 leading-relaxed">Cloud Platforms (AWS, GCP)</p>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-3xl font-bold text-black">Education</h2>
          <div className="flex-1 h-px bg-linear-to-r from-gray-300 to-transparent"></div>
        </div>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg  hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Monash University, AUS & MY</h3>
                <p className="text-gray-700 mb-1">Bachelor of Business and Commerce</p>
                <p className="text-sm text-gray-600">Majoring in Business Analytics and Finance</p>
              </div>
              <span className="text-sm font-semibold text-[#1a7faf] bg-blue-50 px-3 py-1 rounded-full">2025</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg  hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Warwick University, UK</h3>
                <p className="text-gray-700">Exchange Program</p>
              </div>
              <span className="text-sm font-semibold text-[#1a7faf] bg-blue-50 px-3 py-1 rounded-full">2023</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
