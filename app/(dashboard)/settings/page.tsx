"use client";
import { 
  Database, Server, Layers, Zap, Code2, Palette, Package, GitBranch,
  Bolt, Link2, CheckCircle, // Backend icons
  Triangle, Atom, Square, Paintbrush, // Frontend icons
  BarChart3, Theater, Type, // Visualization icons
  Container, FolderGit2, Dices, Rocket // DevOps icons
} from "lucide-react";

export default function SettingsPage() {
  const techStack = [
    {
      category: "Backend",
      icon: <Server size={28} className="text-[#1a7faf]" />,
      color: "from-blue-50 to-blue-100",
      items: [
        { name: "FastAPI", version: "0.115+", description: "High-performance Python web framework", icon: <Bolt size={24} className="text-yellow-500" /> },
        { name: "Python", version: "3.9+", description: "Core backend language", icon: <Code2 size={24} className="text-blue-500" /> },
        { name: "SQLAlchemy", version: "2.0+", description: "ORM for database operations", icon: <Link2 size={24} className="text-purple-500" /> },
        { name: "Pydantic", version: "2.0+", description: "Data validation & serialization", icon: <CheckCircle size={24} className="text-green-500" /> }
      ]
    },
    {
      category: "Database & Caching",
      icon: <Database size={28} className="text-[#1a7faf]" />,
      color: "from-green-50 to-green-100",
      items: [
        { name: "PostgreSQL", version: "15+", description: "Primary relational database", icon: <Database size={24} className="text-blue-600" /> },
        { name: "Redis", version: "7+", description: "In-memory cache (5-min TTL)", icon: <Zap size={24} className="text-red-500" /> },
        { name: "Fact Table", version: "Custom", description: "Denormalized analytics (262K+ records)", icon: <BarChart3 size={24} className="text-green-600" /> }
      ]
    },
    {
      category: "Frontend",
      icon: <Code2 size={28} className="text-[#1a7faf]" />,
      color: "from-purple-50 to-purple-100",
      items: [
        { name: "Next.js", version: "16.0.3", description: "React framework with App Router", icon: <Triangle size={24} className="text-black" /> },
        { name: "React", version: "19.2.0", description: "UI component library", icon: <Atom size={24} className="text-cyan-500" /> },
        { name: "TypeScript", version: "5+", description: "Type-safe JavaScript", icon: <Square size={24} className="text-blue-600" /> },
        { name: "Tailwind CSS", version: "4.0", description: "Utility-first CSS framework", icon: <Paintbrush size={24} className="text-cyan-400" /> }
      ]
    },
    {
      category: "Visualization & UI",
      icon: <Palette size={28} className="text-[#1a7faf]" />,
      color: "from-pink-50 to-pink-100",
      items: [
        { name: "Chart.js", version: "4.x", description: "Interactive data visualization", icon: <BarChart3 size={24} className="text-pink-500" /> },
        { name: "Lucide React", version: "Latest", description: "Beautiful icon library", icon: <Theater size={24} className="text-purple-500" /> },
        { name: "Raleway Font", version: "Custom", description: "Modern typography (100-900 weights)", icon: <Type size={24} className="text-gray-700" /> }
      ]
    },
    {
      category: "DevOps & Tools",
      icon: <Package size={28} className="text-[#1a7faf]" />,
      color: "from-orange-50 to-orange-100",
      items: [
        { name: "Docker", version: "Latest", description: "Containerization platform", icon: <Container size={24} className="text-blue-500" /> },
        { name: "Git", version: "Latest", description: "Version control system", icon: <FolderGit2 size={24} className="text-orange-500" /> },
        { name: "Faker", version: "Latest", description: "Mock data generation", icon: <Dices size={24} className="text-green-500" /> }
      ]
    }
  ];

  const features = [
    { icon: <Zap size={20} />, title: "Virtual Scrolling", desc: "Efficient rendering for large datasets" },
    { icon: <Layers size={20} />, title: "Period-Based Caching", desc: "Separate Redis cache per time period" },
    { icon: <GitBranch size={20} />, title: "Denormalized Analytics", desc: "25-field fact table for fast queries" },
    { icon: <Database size={20} />, title: "5 Normalized Tables", desc: "Users, Products, Orders, Items, Transactions" }
  ];

  const architecture = [
    { step: "1", title: "Client Request", desc: "Next.js frontend sends API call" },
    { step: "2", title: "Redis Check", desc: "FastAPI checks cache (MD5 key)" },
    { step: "3", title: "Database Query", desc: "PostgreSQL query if cache miss" },
    { step: "4", title: "Cache & Return", desc: "Store in Redis (5min) & respond" }
  ];

  return (
    <main className="flex-1 p-8 bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Tech Stack & Configuration</h1>
        <p className="text-gray-600">Comprehensive overview of the application architecture and technologies</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-3xl font-bold text-[#1a7faf]">262K+</div>
          <div className="text-sm text-gray-600">Mock Records Generated</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-3xl font-bold text-[#1a7faf]">10+</div>
          <div className="text-sm text-gray-600">Technologies Used</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-3xl font-bold text-[#1a7faf]">5 min</div>
          <div className="text-sm text-gray-600">Redis Cache TTL</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-3xl font-bold text-[#1a7faf]">25</div>
          <div className="text-sm text-gray-600">Fact Table Fields</div>
        </div>
      </div>

      {/* Tech Stack Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {techStack.map((section) => (
          <div key={section.category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className={`bg-linear-to-r ${section.color} p-4 border-b border-gray-200`}>
              <div className="flex items-center gap-3">
                {section.icon}
                <h2 className="text-xl font-bold text-gray-900">{section.category}</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {section.items.map((item) => (
                <div key={item.name} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <span className="text-xs px-2 py-1 bg-[#1a7faf] text-white rounded-full">
                        {item.version}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Architecture Flow */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
          <GitBranch size={24} className="text-[#1a7faf]" />
          Request Flow Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {architecture.map((step, index) => (
            <div key={step.step} className="relative">
              <div className="bg-linear-to-br from-[#1a7faf] to-[#409dc4] rounded-lg p-6 text-white">
                <div className="text-4xl font-bold mb-2">{step.step}</div>
                <div className="font-bold mb-2">{step.title}</div>
                <div className="text-sm opacity-90">{step.desc}</div>
              </div>
              {index < architecture.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-[#1a7faf] text-2xl">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-black mb-6">Performance Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="border border-gray-200 rounded-lg p-4 hover:border-[#1a7faf] transition-colors">
              <div className="text-[#1a7faf] mb-3">{feature.icon}</div>
              <div className="font-bold text-gray-900 mb-1">{feature.title}</div>
              <div className="text-sm text-gray-600">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Schema */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-black mb-6">Database Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Normalized Tables */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#1a7faf]">Normalized Tables (5)</h3>
            <div className="space-y-2">
              {["Users", "Products", "Orders", "Order Items", "Transactions"].map((table) => (
                <div key={table} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Database size={16} className="text-[#1a7faf]" />
                  <span className="font-mono text-sm">{table}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fact Table */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[#409dc4]">Denormalized Fact Table</h3>
            <div className="p-4 bg-linear-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-[#409dc4]">
              <div className="font-bold mb-2">FactSales</div>
              <div className="text-sm text-gray-700 mb-2">25 combined fields from all tables</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>• Product Info</div>
                <div>• User Details</div>
                <div>• Order Data</div>
                <div>• Transaction Info</div>
                <div>• Timestamps</div>
                <div>• Payment Methods</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Scheme */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-4">Color Palette</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#1a7faf] shadow-sm"></div>
              <div>
                <div className="font-mono text-sm font-bold">#1a7faf</div>
                <div className="text-xs text-gray-600">Primary Blue</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#409dc4] shadow-sm"></div>
              <div>
                <div className="font-mono text-sm font-bold">#409dc4</div>
                <div className="text-xs text-gray-600">Secondary Blue</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-black shadow-sm"></div>
              <div>
                <div className="font-mono text-sm font-bold">#000000</div>
                <div className="text-xs text-gray-600">Text Black</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white border-2 border-gray-300 shadow-sm"></div>
              <div>
                <div className="font-mono text-sm font-bold">#ffffff</div>
                <div className="text-xs text-gray-600">Background White</div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Periods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-4">Time Period Filters</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Week", days: "7d" },
              { label: "2 Weeks", days: "14d" },
              { label: "Month", days: "30d" },
              { label: "3 Months", days: "90d" },
              { label: "6 Months", days: "180d" },
              { label: "9 Months", days: "270d" },
              { label: "1 Year", days: "365d" }
            ].map((period) => (
              <div key={period.label} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{period.label}</span>
                <span className="text-xs text-gray-600 font-mono">{period.days}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 bg-linear-to-r from-[#1a7faf] to-[#409dc4] rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Rocket size={24} />
          Performance Optimized
        </h3>
        <p className="opacity-90">
          This application leverages Redis caching with MD5-hashed keys, denormalized fact tables for analytics,
          virtual scrolling for large datasets, and period-based filtering with percentage change tracking.
          Built with modern best practices for scalability and performance.
        </p>
      </div>
    </main>
  );
}
