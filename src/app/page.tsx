export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            UG Blog Service
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            欢迎来到UG的博客后端服务平台。这里提供完整的博客管理系统API，
            包括文章管理、评论系统、用户管理等功能。
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">博客管理</h3>
              <p className="text-gray-600 dark:text-gray-300">创建、编辑和管理您的博客文章</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">评论系统</h3>
              <p className="text-gray-600 dark:text-gray-300">支持文章评论和互动功能</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">用户管理</h3>
              <p className="text-gray-600 dark:text-gray-300">用户注册、登录和权限管理</p>
            </div>
          </div>

          <div className="mt-12">
            <a
              href="/docs"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              查看API文档
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
