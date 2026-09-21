import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'interactive-3d-portfolio-backend'
  })
})

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`)
})
