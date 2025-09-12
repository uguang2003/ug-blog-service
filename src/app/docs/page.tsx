"use client";

import { useState } from 'react';

export default function APIDocs() {
  const BASE_URL = process.env.NEXT_PUBLIC_WEB_BASE_URL || 'http://localhost:3000';
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [jwtToken, setJwtToken] = useState('');
  const [testResults, setTestResults] = useState<Record<string, { loading: boolean; result: any; error: string }>>({});
  const [testParams, setTestParams] = useState<Record<string, Record<string, string>>>({});

  const toggleExpanded = (endpointKey: string) => {
    const newExpanded = new Set(expandedEndpoints);
    if (newExpanded.has(endpointKey)) {
      newExpanded.delete(endpointKey);
    } else {
      newExpanded.add(endpointKey);
    }
    setExpandedEndpoints(newExpanded);
  };

  const updateTestParam = (endpointKey: string, paramName: string, value: string) => {
    setTestParams(prev => ({
      ...prev,
      [endpointKey]: {
        ...prev[endpointKey],
        [paramName]: value
      }
    }));
  };

  const testAPI = async (endpoint: any) => {
    const endpointKey = endpoint.key;
    setTestResults(prev => ({
      ...prev,
      [endpointKey]: { loading: true, result: null, error: '' }
    }));

    try {
      let url = `${BASE_URL}${endpoint.path}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // 添加JWT token如果需要认证且token存在
      if (endpoint.auth === '管理员' && jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      // 处理路径参数
      if (endpoint.path.includes('[id]')) {
        const id = testParams[endpointKey]?.id || '1';
        url = url.replace('[id]', id);
      }

      // 处理查询参数
      if (endpoint.parameters && endpoint.parameters.length > 0) {
        const queryParams = new URLSearchParams();
        endpoint.parameters.forEach((param: any) => {
          const value = testParams[endpointKey]?.[param.name];
          if (value) {
            queryParams.append(param.name, value);
          }
        });
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }

      let body = null;
      if (endpoint.body) {
        if (testParams[endpointKey] && Object.keys(testParams[endpointKey]).length > 0) {
          body = testParams[endpointKey];
        } else {
          try {
            body = JSON.parse(endpoint.body);
          } catch (e) {
            body = endpoint.body;
          }
        }
      }

      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.message || result}`);
      }

      setTestResults(prev => ({
        ...prev,
        [endpointKey]: { loading: false, result, error: '' }
      }));

    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [endpointKey]: { loading: false, result: null, error: error.message }
      }));
    }
  };

  const apiEndpoints = [
    {
      category: '博客管理',
      basePath: '/api/blogs',
      endpoints: [
        {
          method: 'GET',
          path: '/api/blogs',
          description: '获取所有博客列表（公开接口）',
          key: 'blogs-GET',
          auth: '公开',
          parameters: [
            { name: 'page', type: 'number', required: false, description: '页码 (默认: 1)' },
            { name: 'limit', type: 'number', required: false, description: '每页数量 (默认: 10)' },
            { name: 'recommend', type: 'boolean', required: false, description: '是否推荐博客' },
            { name: 'typeId', type: 'number', required: false, description: '分类ID' },
            { name: 'query', type: 'string', required: false, description: '搜索关键词' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/blogs?page=1&limit=10"`,
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
          method: 'GET',
          path: '/api/blogs/[id]',
          description: '获取指定博客详情（公开接口）',
          key: 'blogs-id-GET',
          auth: '公开',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '博客ID' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/blogs/1"`,
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
          description: '获取所有评论（公开接口）',
          key: 'comments-GET',
          auth: '公开',
          parameters: [
            { name: 'blogId', type: 'number', required: false, description: '按博客ID筛选' },
            { name: 'parentCommentId', type: 'number', required: false, description: '父评论ID' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/comments?blogId=1"`,
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
          description: '创建新评论（公开接口）',
          key: 'comments-POST',
          auth: '公开',
          body: `{
  "nickname": "评论者",
  "email": "email@example.com",
  "content": "评论内容",
  "avatar": "头像URL",
  "blogId": 1,
  "parentCommentId": null,
  "adminComment": false
}`,
          curlExample: `curl -X POST "${BASE_URL}/api/comments" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nickname": "评论者",
    "email": "email@example.com",
    "content": "评论内容",
    "avatar": "头像URL",
    "blogId": 1,
    "parentCommentId": null,
    "adminComment": false
  }'`,
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
          description: '删除指定评论（管理员权限）',
          key: 'comments-id-DELETE',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '评论ID' }
          ],
          curlExample: `curl -X DELETE "${BASE_URL}/api/comments/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
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
          description: '获取所有留言（公开接口）',
          key: 'messages-GET',
          auth: '公开',
          parameters: [
            { name: 'parentMessageId', type: 'number', required: false, description: '父留言ID' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/messages"`,
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
          description: '创建新留言（公开接口）',
          key: 'messages-POST',
          auth: '公开',
          body: `{
  "nickname": "留言者",
  "email": "email@example.com",
  "content": "留言内容",
  "avatar": "头像URL",
  "parentMessageId": null,
  "adminMessage": false
}`,
          curlExample: `curl -X POST "${BASE_URL}/api/messages" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nickname": "留言者",
    "email": "email@example.com",
    "content": "留言内容",
    "avatar": "头像URL",
    "parentMessageId": null,
    "adminMessage": false
  }'`,
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
          description: '删除指定留言（管理员权限）',
          key: 'messages-id-DELETE',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '留言ID' }
          ],
          curlExample: `curl -X DELETE "${BASE_URL}/api/messages/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
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
          description: '获取所有图片（公开接口）',
          key: 'pictures-GET',
          auth: '公开',
          curlExample: `curl -X GET "${BASE_URL}/api/pictures"`,
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
          method: 'GET',
          path: '/api/pictures/[id]',
          description: '获取指定图片详情（公开接口）',
          key: 'pictures-id-GET',
          auth: '公开',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '图片ID' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/pictures/1"`,
          response: `{
  "id": 1,
  "pictureName": "图片名称",
  "pictureTime": "2024-01-01",
  "pictureAddress": "拍摄地点",
  "pictureDescription": "图片描述"
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
          description: '获取统计信息（公开接口）',
          key: 'stats-GET',
          auth: '公开',
          curlExample: `curl -X GET "${BASE_URL}/api/stats"`,
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
          description: '获取所有分类（公开接口）',
          key: 'types-GET',
          auth: '公开',
          curlExample: `curl -X GET "${BASE_URL}/api/types"`,
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
          method: 'GET',
          path: '/api/types/[id]',
          description: '获取指定分类详情（公开接口）',
          key: 'types-id-GET',
          auth: '公开',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '分类ID' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/types/1"`,
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
        }
      ]
    },
    {
      category: '用户认证',
      basePath: '/api/login',
      endpoints: [
        {
          method: 'POST',
          path: '/api/login',
          description: '用户登录（公开接口）',
          key: 'login-POST',
          auth: '公开',
          parameters: [
            { name: 'username', type: 'string', required: true, description: '用户名' },
            { name: 'password', type: 'string', required: true, description: '密码' }
          ],
          body: `{
  "username": "用户名",
  "password": "密码"
}`,
          curlExample: `curl -X POST "${BASE_URL}/api/login" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "admin",
    "password": "password"
  }'`,
          response: `{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "用户名",
    "nickname": "昵称",
    "avatar": "头像URL",
    "type": 0
  }
}`
        }
      ]
    },
    {
      category: '管理员博客管理',
      basePath: '/api/admin/blogs',
      endpoints: [
        {
          method: 'GET',
          path: '/api/admin/blogs',
          description: '获取博客列表（管理员权限）',
          key: 'admin-blogs-GET',
          auth: '管理员',
          parameters: [
            { name: 'page', type: 'number', required: false, description: '页码 (默认: 1)' },
            { name: 'pageSize', type: 'number', required: false, description: '每页数量 (默认: 10)' },
            { name: 'title', type: 'string', required: false, description: '按标题搜索' },
            { name: 'typeId', type: 'number', required: false, description: '按分类筛选' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/admin/blogs?page=1&pageSize=10" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
          response: `{
  "blogs": [
    {
      "id": 1,
      "title": "博客标题",
      "content": "博客内容",
      "published": true,
      "recommend": false,
      "typeId": 1,
      "userId": 1,
      "createTime": "2024-01-01T00:00:00Z",
      "updateTime": "2024-01-01T00:00:00Z",
      "views": 100,
      "commentCount": 5,
      "type": { "id": 1, "name": "分类名" },
      "user": { "id": 1, "username": "用户名", "nickname": "昵称" },
      "_count": { "comments": 5 }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}`
        },
        {
          method: 'POST',
          path: '/api/admin/blogs',
          description: '创建新博客（管理员权限）',
          key: 'admin-blogs-POST',
          auth: '管理员',
          body: `{
  "title": "博客标题",
  "content": "博客内容",
  "description": "博客描述",
  "firstPicture": "封面图片URL",
  "published": true,
  "recommend": false,
  "commentabled": true,
  "appreciation": false,
  "shareStatement": false,
  "typeId": 1
}`,
          curlExample: `curl -X POST "${BASE_URL}/api/admin/blogs" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "博客标题",
    "content": "博客内容",
    "description": "博客描述",
    "firstPicture": "封面图片URL",
    "published": true,
    "recommend": false,
    "commentabled": true,
    "appreciation": false,
    "shareStatement": false,
    "typeId": 1
  }'`,
          response: `{
  "id": 1,
  "title": "博客标题",
  "content": "博客内容",
  "description": "博客描述",
  "firstPicture": "封面图片URL",
  "published": true,
  "recommend": false,
  "commentabled": true,
  "appreciation": false,
  "shareStatement": false,
  "typeId": 1,
  "userId": 1,
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z",
  "views": 0,
  "commentCount": 0,
  "type": { "id": 1, "name": "分类名" },
  "user": { "id": 1, "username": "用户名", "nickname": "昵称" }
}`
        },
        {
          method: 'GET',
          path: '/api/admin/blogs/[id]',
          description: '获取博客详情（管理员权限）',
          key: 'admin-blogs-id-GET',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '博客ID' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/admin/blogs/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
          response: `{
  "id": 1,
  "title": "博客标题",
  "content": "博客内容",
  "published": true,
  "recommend": false,
  "typeId": 1,
  "userId": 1,
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z",
  "views": 100,
  "commentCount": 5,
  "type": { "id": 1, "name": "分类名" },
  "user": { "id": 1, "username": "用户名", "nickname": "昵称" },
  "comments": [
    {
      "id": 1,
      "nickname": "评论者",
      "email": "email@example.com",
      "content": "评论内容",
      "avatar": "头像URL",
      "createTime": "2024-01-01T00:00:00Z",
      "adminComment": false
    }
  ]
}`
        },
        {
          method: 'PUT',
          path: '/api/admin/blogs/[id]',
          description: '更新博客（管理员权限）',
          key: 'admin-blogs-id-PUT',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '博客ID' }
          ],
          body: `{
  "title": "更新的博客标题",
  "content": "更新的博客内容",
  "description": "新描述",
  "firstPicture": "新封面图片",
  "published": true,
  "recommend": true,
  "commentabled": false,
  "appreciation": true,
  "shareStatement": true,
  "typeId": 2
}`,
          curlExample: `curl -X PUT "${BASE_URL}/api/admin/blogs/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "更新的博客标题",
    "content": "更新的博客内容",
    "description": "新描述",
    "firstPicture": "新封面图片",
    "published": true,
    "recommend": true,
    "commentabled": false,
    "appreciation": true,
    "shareStatement": true,
    "typeId": 2
  }'`,
          response: `{
  "id": 1,
  "title": "更新的博客标题",
  "content": "更新的博客内容",
  "description": "新描述",
  "firstPicture": "新封面图片",
  "published": true,
  "recommend": true,
  "commentabled": false,
  "appreciation": true,
  "shareStatement": true,
  "typeId": 2,
  "userId": 1,
  "createTime": "2024-01-01T00:00:00Z",
  "updateTime": "2024-01-01T00:00:00Z",
  "views": 100,
  "commentCount": 5,
  "type": { "id": 2, "name": "新分类名" },
  "user": { "id": 1, "username": "用户名", "nickname": "昵称" }
}`
        },
        {
          method: 'DELETE',
          path: '/api/admin/blogs/[id]',
          description: '删除博客（管理员权限）',
          key: 'admin-blogs-id-DELETE',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '博客ID' }
          ],
          curlExample: `curl -X DELETE "${BASE_URL}/api/admin/blogs/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
          response: `{
  "message": "删除成功"
}`
        }
      ]
    },
    {
      category: '管理员图片管理',
      basePath: '/api/admin/pictures',
      endpoints: [
        {
          method: 'GET',
          path: '/api/admin/pictures',
          description: '获取图片列表（管理员权限）',
          key: 'admin-pictures-GET',
          auth: '管理员',
          parameters: [
            { name: 'page', type: 'number', required: false, description: '页码 (默认: 1)' },
            { name: 'pageSize', type: 'number', required: false, description: '每页数量 (默认: 10)' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/admin/pictures?page=1&pageSize=10" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
          response: `{
  "pictures": [
    {
      "id": 1,
      "pictureName": "图片名称",
      "pictureTime": "2024-01-01",
      "pictureAddress": "拍摄地点",
      "pictureDescription": "图片描述"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 50,
    "totalPages": 5
  }
}`
        },
        {
          method: 'POST',
          path: '/api/admin/pictures',
          description: '创建新图片（管理员权限）',
          key: 'admin-pictures-POST',
          auth: '管理员',
          body: `{
  "pictureName": "图片名称",
  "pictureTime": "2024-01-01",
  "pictureAddress": "拍摄地点",
  "pictureDescription": "图片描述"
}`,
          curlExample: `curl -X POST "${BASE_URL}/api/admin/pictures" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pictureName": "图片名称",
    "pictureTime": "2024-01-01",
    "pictureAddress": "拍摄地点",
    "pictureDescription": "图片描述"
  }'`,
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
          path: '/api/admin/pictures/[id]',
          description: '获取图片详情（管理员权限）',
          key: 'admin-pictures-id-GET',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '图片ID' }
          ],
          curlExample: `curl -X GET "${BASE_URL}/api/admin/pictures/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
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
          path: '/api/admin/pictures/[id]',
          description: '更新图片（管理员权限）',
          key: 'admin-pictures-id-PUT',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '图片ID' }
          ],
          body: `{
  "pictureName": "新图片名称",
  "pictureTime": "2024-01-02",
  "pictureAddress": "新拍摄地点",
  "pictureDescription": "新图片描述"
}`,
          curlExample: `curl -X PUT "${BASE_URL}/api/admin/pictures/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "pictureName": "新图片名称",
    "pictureTime": "2024-01-02",
    "pictureAddress": "新拍摄地点",
    "pictureDescription": "新图片描述"
  }'`,
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
          path: '/api/admin/pictures/[id]',
          description: '删除图片（管理员权限）',
          key: 'admin-pictures-id-DELETE',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '图片ID' }
          ],
          curlExample: `curl -X DELETE "${BASE_URL}/api/admin/pictures/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
          response: `{
  "message": "删除成功"
}`
        }
      ]
    },
    {
      category: '管理员分类管理',
      basePath: '/api/admin/types',
      endpoints: [
        {
          method: 'GET',
          path: '/api/admin/types',
          description: '获取分类列表（管理员权限）',
          key: 'admin-types-GET',
          auth: '管理员',
          curlExample: `curl -X GET "${BASE_URL}/api/admin/types" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
          response: `[
  {
    "id": 1,
    "name": "分类名称",
    "_count": {
      "blogs": 5
    }
  }
]`
        },
        {
          method: 'POST',
          path: '/api/admin/types',
          description: '创建新分类（管理员权限）',
          key: 'admin-types-POST',
          auth: '管理员',
          body: `{
  "name": "分类名称"
}`,
          curlExample: `curl -X POST "${BASE_URL}/api/admin/types" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "分类名称"
  }'`,
          response: `{
  "id": 1,
  "name": "分类名称"
}`
        },
        {
          method: 'PUT',
          path: '/api/admin/types/[id]',
          description: '更新分类（管理员权限）',
          key: 'admin-types-id-PUT',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '分类ID' }
          ],
          body: `{
  "name": "新分类名称"
}`,
          curlExample: `curl -X PUT "${BASE_URL}/api/admin/types/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "新分类名称"
  }'`,
          response: `{
  "id": 1,
  "name": "新分类名称"
}`
        },
        {
          method: 'DELETE',
          path: '/api/admin/types/[id]',
          description: '删除分类（管理员权限）',
          key: 'admin-types-id-DELETE',
          auth: '管理员',
          parameters: [
            { name: 'id', type: 'number', required: true, description: '分类ID' }
          ],
          curlExample: `curl -X DELETE "${BASE_URL}/api/admin/types/1" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
          response: `{
  "message": "删除成功"
}`
        }
      ]
    },
    {
      category: '管理员统计信息',
      basePath: '/api/admin/stats',
      endpoints: [
        {
          method: 'GET',
          path: '/api/admin/stats',
          description: '获取统计信息（管理员权限）',
          key: 'admin-stats-GET',
          auth: '管理员',
          curlExample: `curl -X GET "${BASE_URL}/api/admin/stats" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`,
          response: `{
  "blogTotal": 100,
  "blogViewTotal": 5000,
  "blogCommentTotal": 200,
  "blogMessageTotal": 50
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

          {/* JWT Token 输入框 */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔐 JWT Token 设置（用于管理员接口测试）
            </h3>
            <div className="flex gap-4">
              <input
                type="text"
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                placeholder="输入您的JWT Token（从登录接口获取）"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setJwtToken('')}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                清除
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              💡 先调用登录接口获取token，然后粘贴到这里测试管理员接口
            </p>
          </div>

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
                          {(endpoint as any).body && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                请求体示例:
                              </h4>
                              <pre className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm overflow-x-auto">
                                <code className="text-gray-900 dark:text-gray-100">
                                  {(endpoint as any).body}
                                </code>
                              </pre>
                            </div>
                          )}

                          {/* 测试示例 */}
                          {(endpoint as any).curlExample && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                测试示例:
                              </h4>
                              <pre className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm overflow-x-auto">
                                <code className="text-gray-900 dark:text-gray-100">
                                  {(endpoint as any).curlExample}
                                </code>
                              </pre>
                            </div>
                          )}

                          {/* 权限信息 */}
                          {(endpoint as any).auth && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                权限要求:
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                (endpoint as any).auth === '公开'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              }`}>
                                {(endpoint as any).auth}
                              </span>
                            </div>
                          )}

                          {/* 测试参数输入 */}
                          {(endpoint.parameters && endpoint.parameters.length > 0) && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                测试参数:
                              </h4>
                              <div className="space-y-2">
                                {endpoint.parameters.map((param: any) => (
                                  <div key={param.name} className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-600 dark:text-gray-300 min-w-20">
                                      {param.name}:
                                    </label>
                                    <input
                                      type="text"
                                      placeholder={`${param.description} ${param.required ? '(必填)' : '(可选)'}`}
                                      value={testParams[endpoint.key]?.[param.name] || ''}
                                      onChange={(e) => updateTestParam(endpoint.key, param.name, e.target.value)}
                                      className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 测试按钮 */}
                          <div className="mb-4">
                            <button
                              onClick={() => testAPI(endpoint)}
                              disabled={testResults[endpoint.key]?.loading}
                              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                testResults[endpoint.key]?.loading
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {testResults[endpoint.key]?.loading ? '🔄 测试中...' : '🚀 测试接口'}
                            </button>
                          </div>

                          {/* 测试结果 */}
                          {testResults[endpoint.key] && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                测试结果:
                              </h4>
                              {testResults[endpoint.key].error ? (
                                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded p-3">
                                  <div className="text-red-800 dark:text-red-200 font-semibold mb-1">
                                    ❌ 测试失败
                                  </div>
                                  <pre className="text-red-700 dark:text-red-300 text-sm whitespace-pre-wrap">
                                    {testResults[endpoint.key].error}
                                  </pre>
                                </div>
                              ) : (
                                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded p-3">
                                  <div className="text-green-800 dark:text-green-200 font-semibold mb-1">
                                    ✅ 测试成功
                                  </div>
                                  <pre className="text-green-700 dark:text-green-300 text-sm overflow-x-auto">
                                    {JSON.stringify(testResults[endpoint.key].result, null, 2)}
                                  </pre>
                                </div>
                              )}
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
              🧪 在线测试功能
            </h4>
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded p-4">
              <ul className="text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>JWT Token 设置：</strong>在页面顶部输入您的JWT令牌，用于测试管理员接口</li>
                <li><strong>参数输入：</strong>展开接口详情，输入测试所需的参数值</li>
                <li><strong>一键测试：</strong>点击"🚀 测试接口"按钮直接调用API</li>
                <li><strong>实时结果：</strong>测试结果会立即显示在页面上，支持JSON格式化</li>
                <li><strong>错误处理：</strong>失败时会显示详细的错误信息和HTTP状态码</li>
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
