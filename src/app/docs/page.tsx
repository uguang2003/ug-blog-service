"use client";

import { useState } from 'react';

export default function APIDocs() {
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  const toggleExpanded = (endpointKey: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(endpointKey)) {
      newExpanded.delete(endpointKey);
    } else {
      newExpanded.add(endpointKey);
    }
    setExpandedEndpoints(newExpanded);
  };

  const apiEndpoints = [
    {
      category: '博客管理',
      basePath: '/api/blogs',
      endpoints: [
        {
          method: 'GET',
          path: '/api/blogs',
          description: '获取所有博客列表',
          key: 'blogs-GET',
          parameters: [
            { name: 'page', type: 'number', required: false, description: '页码 (默认: 1)' },
            { name: 'limit', type: 'number', required: false, description: '每页数量 (默认: 10)' },
            { name: 'recommend', type: 'boolean', required: false, description: '是否推荐博客' },
            { name: 'typeId', type: 'number', required: false, description: '分类ID' },
            { name: 'query', type: 'string', required: false, description: '搜索关键词' }
          ],
          response: `{
  "blogs": [
    {
      "id": 1,
      "title": "博客标题",
      "content": "博客内容",
      "firstPicture": "封面图片",
      "flag": "原创",
      "published": true,
      "recommend": false,
      "typeId": 1,
      "userId": 1,
      "description": "描述",
      "appreciation": false,
      "shareStatement": false,
      "commentabled": true,
      "createTime": "2024-01-01T00:00:00Z",
      "updateTime": "2024-01-01T00:00:00Z",
      "views": 100,
      "commentCount": 5,
      "type": { "id": 1, "name": "分类名" },
      "user": { "id": 1, "username": "用户名" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}`
        },
        {
          method: 'POST',
          path: '/api/blogs',
          description: '创建新博客',
          key: 'blogs-POST',
          body: `{
  "title": "博客标题",
  "content": "博客内容",
  "firstPicture": "封面图片URL",
  "flag": "原创",
  "published": true,
  "recommend": false,
  "typeId": 1,
  "userId": 1,
  "description": "博客描述",
  "appreciation": false,
  "shareStatement": false,
  "commentabled": true
}`,
          response: `{
  "id": 1,
  "title": "博客标题",
  "content": "博客内容",
  "firstPicture": "封面图片",
  "flag": "原创",
  "published": true,
  "recommend": false,
  "typeId": 1,
  "userId": 1,
  "description": "描述",
  "appreciation": false,
  "shareStatement": false,
  "commentabled": true,
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z",
  "views": 0,
  "commentCount": 0,
  "type": { "id": 1, "name": "分类名" },
  "user": { "id": 1, "username": "用户名" }
}`
        },
        {
          method: 'GET',
          path: '/api/blogs/[id]',
          description: '获取指定博客详情',
          key: 'blogs-id-GET',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '博客ID' }
          ],
          response: `{
  "id": 1,
  "title": "博客标题",
  "content": "博客内容",
  "firstPicture": "封面图片",
  "flag": "原创",
  "published": true,
  "recommend": false,
  "typeId": 1,
  "userId": 1,
  "description": "描述",
  "appreciation": false,
  "shareStatement": false,
  "commentabled": true,
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z",
  "views": 101,
  "commentCount": 5,
  "type": { "id": 1, "name": "分类名" },
  "user": { "id": 1, "username": "用户名" },
  "comments": [
    {
      "id": 1,
      "nickname": "评论者",
      "email": "email@example.com",
      "content": "评论内容",
      "avatar": "头像URL",
      "blogId": 1,
      "parentCommentId": null,
      "adminComment": false,
      "createTime": "2024-01-01T00:00:00Z",
      "replies": []
    }
  ]
}`
        },
        {
          method: 'PUT',
          path: '/api/blogs/[id]',
          description: '更新指定博客',
          key: 'blogs-id-PUT',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '博客ID' }
          ],
          body: `{
  "title": "更新的博客标题",
  "content": "更新的博客内容",
  "firstPicture": "新封面图片",
  "flag": "转载",
  "published": true,
  "recommend": true,
  "typeId": 2,
  "description": "新描述",
  "appreciation": true,
  "shareStatement": true,
  "commentabled": false
}`,
          response: `{
  "id": 1,
  "title": "更新的博客标题",
  "content": "更新的博客内容",
  "firstPicture": "新封面图片",
  "flag": "转载",
  "published": true,
  "recommend": true,
  "typeId": 2,
  "userId": 1,
  "description": "新描述",
  "appreciation": true,
  "shareStatement": true,
  "commentabled": false,
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z",
  "views": 100,
  "commentCount": 5,
  "type": { "id": 2, "name": "新分类名" },
  "user": { "id": 1, "username": "用户名" }
}`
        },
        {
          method: 'DELETE',
          path: '/api/blogs/[id]',
          description: '删除指定博客',
          key: 'blogs-id-DELETE',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '博客ID' }
          ],
          response: `{
  "message": "删除成功"
}`
        }
      ]
    },
    {
      category: '评论管理',
      basePath: '/api/comments',
      endpoints: [
        {
          method: 'GET',
          path: '/api/comments',
          description: '获取所有评论',
          key: 'comments-GET',
          parameters: [
            { name: 'blogId', type: 'number', required: false, description: '按博客ID筛选' },
            { name: 'parentCommentId', type: 'number', required: false, description: '父评论ID' }
          ],
          response: `[
  {
    "id": 1,
    "nickname": "评论者",
    "email": "email@example.com",
    "content": "评论内容",
    "avatar": "头像URL",
    "blogId": 1,
    "parentCommentId": null,
    "adminComment": false,
    "createTime": "2024-01-01T00:00:00Z",
    "replies": [
      {
        "id": 2,
        "nickname": "回复者",
        "email": "reply@example.com",
        "content": "回复内容",
        "avatar": "回复头像URL",
        "blogId": 1,
        "parentCommentId": 1,
        "adminComment": false,
        "createTime": "2024-01-01T00:00:00Z",
        "replies": []
      }
    ]
  }
]`
        },
        {
          method: 'POST',
          path: '/api/comments',
          description: '创建新评论',
          key: 'comments-POST',
          body: `{
  "nickname": "评论者",
  "email": "email@example.com",
  "content": "评论内容",
  "avatar": "头像URL",
  "blogId": 1,
  "parentCommentId": null,
  "adminComment": false
}`,
          response: `{
  "id": 1,
  "nickname": "评论者",
  "email": "email@example.com",
  "content": "评论内容",
  "avatar": "头像URL",
  "blogId": 1,
  "parentCommentId": null,
  "adminComment": false,
  "createTime": "2024-01-01T00:00:00Z",
  "blog": {
    "id": 1,
    "title": "博客标题"
  },
  "parentComment": null
}`
        },
        {
          method: 'DELETE',
          path: '/api/comments/[id]',
          description: '删除指定评论',
          key: 'comments-id-DELETE',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '评论ID' }
          ],
          response: `{
  "message": "删除成功"
}`
        }
      ]
    },
    {
      category: '留言管理',
      basePath: '/api/messages',
      endpoints: [
        {
          method: 'GET',
          path: '/api/messages',
          description: '获取所有留言',
          key: 'messages-GET',
          parameters: [
            { name: 'parentMessageId', type: 'number', required: false, description: '父留言ID' }
          ],
          response: `[
  {
    "id": 1,
    "nickname": "留言者",
    "email": "email@example.com",
    "content": "留言内容",
    "avatar": "头像URL",
    "parentMessageId": null,
    "adminMessage": false,
    "createTime": "2024-01-01T00:00:00Z",
    "replies": [
      {
        "id": 2,
        "nickname": "回复者",
        "email": "reply@example.com",
        "content": "回复内容",
        "avatar": "回复头像URL",
        "parentMessageId": 1,
        "adminMessage": false,
        "createTime": "2024-01-01T00:00:00Z",
        "replies": []
      }
    ]
  }
]`
        },
        {
          method: 'POST',
          path: '/api/messages',
          description: '创建新留言',
          key: 'messages-POST',
          body: `{
  "nickname": "留言者",
  "email": "email@example.com",
  "content": "留言内容",
  "avatar": "头像URL",
  "parentMessageId": null,
  "adminMessage": false
}`,
          response: `{
  "id": 1,
  "nickname": "留言者",
  "email": "email@example.com",
  "content": "留言内容",
  "avatar": "头像URL",
  "parentMessageId": null,
  "adminMessage": false,
  "createTime": "2024-01-01T00:00:00Z",
  "parentMessage": null
}`
        },
        {
          method: 'DELETE',
          path: '/api/messages/[id]',
          description: '删除指定留言',
          key: 'messages-id-DELETE',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '留言ID' }
          ],
          response: `{
  "message": "删除成功"
}`
        }
      ]
    },
    {
      category: '图片管理',
      basePath: '/api/pictures',
      endpoints: [
        {
          method: 'GET',
          path: '/api/pictures',
          description: '获取所有图片',
          key: 'pictures-GET',
          response: `[
  {
    "id": 1,
    "pictureName": "图片名称",
    "pictureTime": "拍摄时间",
    "pictureAddress": "拍摄地点",
    "pictureDescription": "图片描述"
  }
]`
        },
        {
          method: 'POST',
          path: '/api/pictures',
          description: '创建新图片',
          key: 'pictures-POST',
          body: `{
  "pictureName": "图片名称",
  "pictureTime": "2024-01-01",
  "pictureAddress": "拍摄地点",
  "pictureDescription": "图片描述"
}`,
          response: `{
  "id": 1,
  "pictureName": "图片名称",
  "pictureTime": "2024-01-01",
  "pictureAddress": "拍摄地点",
  "pictureDescription": "图片描述"
}`
        },
        {
          method: 'GET',
          path: '/api/pictures/[id]',
          description: '获取指定图片详情',
          key: 'pictures-id-GET',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '图片ID' }
          ],
          response: `{
  "id": 1,
  "pictureName": "图片名称",
  "pictureTime": "2024-01-01",
  "pictureAddress": "拍摄地点",
  "pictureDescription": "图片描述"
}`
        },
        {
          method: 'PUT',
          path: '/api/pictures/[id]',
          description: '更新指定图片',
          key: 'pictures-id-PUT',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '图片ID' }
          ],
          body: `{
  "pictureName": "新图片名称",
  "pictureTime": "2024-01-02",
  "pictureAddress": "新拍摄地点",
  "pictureDescription": "新图片描述"
}`,
          response: `{
  "id": 1,
  "pictureName": "新图片名称",
  "pictureTime": "2024-01-02",
  "pictureAddress": "新拍摄地点",
  "pictureDescription": "新图片描述"
}`
        },
        {
          method: 'DELETE',
          path: '/api/pictures/[id]',
          description: '删除指定图片',
          key: 'pictures-id-DELETE',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '图片ID' }
          ],
          response: `{
  "message": "删除成功"
}`
        }
      ]
    },
    {
      category: '统计信息',
      basePath: '/api/stats',
      endpoints: [
        {
          method: 'GET',
          path: '/api/stats',
          description: '获取统计信息',
          key: 'stats-GET',
          response: `{
  "blogTotal": 100,
  "blogViewTotal": 5000,
  "blogCommentTotal": 200,
  "blogMessageTotal": 50
}`
        }
      ]
    },
    {
      category: '分类管理',
      basePath: '/api/types',
      endpoints: [
        {
          method: 'GET',
          path: '/api/types',
          description: '获取所有分类',
          key: 'types-GET',
          response: `[
  {
    "id": 1,
    "name": "分类名称",
    "blogs": [
      {
        "id": 1,
        "title": "博客标题"
      }
    ]
  }
]`
        },
        {
          method: 'POST',
          path: '/api/types',
          description: '创建新分类',
          key: 'types-POST',
          body: `{
  "name": "分类名称"
}`,
          response: `{
  "id": 1,
  "name": "分类名称"
}`
        },
        {
          method: 'GET',
          path: '/api/types/[id]',
          description: '获取指定分类详情',
          key: 'types-id-GET',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '分类ID' }
          ],
          response: `{
  "id": 1,
  "name": "分类名称",
  "blogs": [
    {
      "id": 1,
      "title": "博客标题",
      "createTime": "2024-01-01T00:00:00Z"
    }
  ]
}`
        },
        {
          method: 'PUT',
          path: '/api/types/[id]',
          description: '更新指定分类',
          key: 'types-id-PUT',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '分类ID' }
          ],
          body: `{
  "name": "新分类名称"
}`,
          response: `{
  "id": 1,
  "name": "新分类名称"
}`
        },
        {
          method: 'DELETE',
          path: '/api/types/[id]',
          description: '删除指定分类',
          key: 'types-id-DELETE',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '分类ID' }
          ],
          response: `{
  "message": "删除成功"
}`
        }
      ]
    },
    {
      category: '用户管理',
      basePath: '/api/users',
      endpoints: [
        {
          method: 'GET',
          path: '/api/users',
          description: '获取所有用户',
          key: 'users-GET',
          response: `[
  {
    "id": 1,
    "username": "用户名",
    "nickname": "昵称",
    "email": "user@example.com",
    "avatar": "头像URL",
    "type": "admin",
    "createTime": "2024-01-01T00:00:00Z",
    "updateTime": "2024-01-01T00:00:00Z"
  }
]`
        },
        {
          method: 'POST',
          path: '/api/users',
          description: '创建新用户',
          key: 'users-POST',
          body: `{
  "username": "用户名",
  "password": "密码",
  "nickname": "昵称",
  "email": "user@example.com",
  "avatar": "头像URL",
  "type": "user"
}`,
          response: `{
  "id": 1,
  "username": "用户名",
  "nickname": "昵称",
  "email": "user@example.com",
  "avatar": "头像URL",
  "type": "user",
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z"
}`
        },
        {
          method: 'GET',
          path: '/api/users/[id]',
          description: '获取指定用户详情',
          key: 'users-id-GET',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '用户ID' }
          ],
          response: `{
  "id": 1,
  "username": "用户名",
  "nickname": "昵称",
  "email": "user@example.com",
  "avatar": "头像URL",
  "type": "admin",
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z",
  "blogs": [
    {
      "id": 1,
      "title": "博客标题",
      "createTime": "2024-01-01T00:00:00Z"
    }
  ]
}`
        },
        {
          method: 'PUT',
          path: '/api/users/[id]',
          description: '更新指定用户',
          key: 'users-id-PUT',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '用户ID' }
          ],
          body: `{
  "nickname": "新昵称",
  "email": "newemail@example.com",
  "avatar": "新头像URL",
  "type": "admin"
}`,
          response: `{
  "id": 1,
  "username": "用户名",
  "nickname": "新昵称",
  "email": "newemail@example.com",
  "avatar": "新头像URL",
  "type": "admin",
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z"
}`
        },
        {
          method: 'DELETE',
          path: '/api/users/[id]',
          description: '删除指定用户',
          key: 'users-id-DELETE',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '用户ID' }
          ],
          response: `{
  "message": "删除成功"
}`
        }
      ]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            UG Blog Service API 文档
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            完整的RESTful API文档，包含详细的参数说明和示例
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors mr-4"
            >
              返回首页
            </a>
          </div>
        </div>

        {/* API端点列表 */}
        <div className="space-y-8">
          {apiEndpoints.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {category.category}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  基础路径: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm">
                    {category.basePath}
                  </code>
                </p>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                {category.endpoints.map((endpoint, endpointIndex) => {
                  const isExpanded = expandedEndpoints.has(endpoint.key);
                  return (
                    <div key={endpointIndex} className="px-6 py-6">
                      <div 
                        className="flex items-center space-x-4 mb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                        onClick={() => toggleExpanded(endpoint.key)}
                      >
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="flex-1 text-gray-900 dark:text-white font-mono text-sm">
                          {endpoint.path}
                        </code>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {isExpanded ? '收起' : '展开'}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {endpoint.description}
                      </p>

                      {isExpanded && (
                        <>
                          {/* 请求参数 */}
                          {endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                请求参数:
                              </h4>
                              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                                {endpoint.parameters.map((param, paramIndex) => (
                                  <div key={paramIndex} className="flex items-center space-x-4 text-sm mb-1">
                                    <code className="text-blue-600 dark:text-blue-400 font-mono">
                                      {param.name}
                                    </code>
                                    <span className="text-gray-500 dark:text-gray-400">
                                      {param.type}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      param.required
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                    }`}>
                                      {param.required ? '必填' : '可选'}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-300 flex-1">
                                      {param.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 请求体 */}
                          {endpoint.body && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                请求体示例:
                              </h4>
                              <pre className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm overflow-x-auto">
                                <code className="text-gray-900 dark:text-gray-100">
                                  {endpoint.body}
                                </code>
                              </pre>
                            </div>
                          )}

                          {/* 响应示例 */}
                          {endpoint.response && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                响应示例:
                              </h4>
                              <pre className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm overflow-x-auto">
                                <code className="text-gray-900 dark:text-gray-100">
                                  {endpoint.response}
                                </code>
                              </pre>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            使用说明
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                请求格式
              </h4>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                <li>• 所有请求都使用JSON格式</li>
                <li>• POST/PUT请求需要在请求体中发送数据</li>
                <li>• 支持CORS跨域请求</li>
                <li>• 支持分页、搜索和筛选参数</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                响应格式
              </h4>
              <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                <li>• 成功响应: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{"{success: true, data: ...}"}</code></li>
                <li>• 错误响应: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{"{success: false, error: ...}"}</code></li>
                <li>• HTTP状态码遵循RESTful标准</li>
                <li>• 分页信息包含在响应中</li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              错误码说明
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">400 Bad Request</h5>
                <p className="text-gray-600 dark:text-gray-300">请求参数错误或缺少必要参数</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">401 Unauthorized</h5>
                <p className="text-gray-600 dark:text-gray-300">未授权访问，需要登录</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">404 Not Found</h5>
                <p className="text-gray-600 dark:text-gray-300">请求的资源不存在</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white">500 Internal Server Error</h5>
                <p className="text-gray-600 dark:text-gray-300">服务器内部错误</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
