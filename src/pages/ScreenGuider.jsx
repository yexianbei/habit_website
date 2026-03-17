import React, { useState } from 'react'

export default function ScreenGuider() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  const handleDecode = () => {
    setError('')
    setResult('')
    
    const trimmedInput = input.trim()
    if (!trimmedInput) {
      setError('请输入加密串')
      return
    }

    try {
      // URL 安全 Base64 转标准 Base64
      const base64 = trimmedInput.replace(/-/g, '+').replace(/_/g, '/')
      const decoded = atob(base64) // 解码成字符串
      const prefix = 'XRC-STG:'
      
      if (!decoded.startsWith(prefix)) {
        setError('格式不正确')
        return
      }
      
      const password = decoded.substring(prefix.length)
      setResult(password)
    } catch (e) {
      setError('解码失败：' + e.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center pt-20">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          守护密码解密工具
        </h1>
        
        <div className="space-y-4">
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="粘贴加密守护密码"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>

          <button
            onClick={handleDecode}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
          >
            解密
          </button>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
              <div className="text-xs text-green-600 mb-1 font-medium">解密结果：</div>
              <div className="text-lg font-mono text-green-800 break-all select-all">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
