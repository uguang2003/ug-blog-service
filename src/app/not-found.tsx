export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            页面未找到
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            抱歉，您访问的页面不存在。可能是链接错误或页面已被移动。
          </p>

          <div className="space-y-4">
            <a
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              返回首页
            </a>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>或者尝试以下操作：</p>
              <ul className="mt-2 space-y-1">
                <li>• 检查URL是否正确</li>
                <li>• 返回上一页</li>
                <li>• 联系管理员</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
