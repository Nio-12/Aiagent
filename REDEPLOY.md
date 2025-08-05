# 🔄 Redeploy Instructions

## Vấn đề hiện tại
API endpoints trả về 404 trên Vercel. Cần redeploy với cấu hình mới.

## Bước 1: Deploy lại
```bash
npm install
vercel --prod
```

## Bước 2: Kiểm tra Environment Variables
Đảm bảo các biến môi trường đã được set trong Vercel dashboard:
- `OPENAI_API_KEY`
- `SUPABASE_URL` 
- `SUPABASE_ANON_KEY`

## Bước 3: Test API
```bash
node test-api.js
```

## Cấu trúc API
```
/api/chat.js          -> POST /api/chat
/api/conversations.js -> GET /api/conversations  
/api/analyze.js       -> POST /api/analyze
/api/health.js        -> GET /api/health
```

## Troubleshooting
1. Kiểm tra Vercel function logs
2. Đảm bảo environment variables đã set
3. Chạy `node test-api.js` để test 