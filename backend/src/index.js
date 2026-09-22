
import express from 'express'
import cors from 'cors'
import contact from './routes/contact.js'
const app = express()
app.use(cors()); app.use(express.json())
app.get('/api/health',(req,res)=>res.json({status:'ok', foundation:'isometric-portfolio-energy-flow'}))
app.use('/api/contact', contact)
app.get('/api/projects',(req,res)=>res.json([{id:1,title:'Isometric World',tech:['Three.js','Vue']},{id:2,title:'Shader Gallery'}]))
app.get('/api/resume',(req,res)=>res.json({url:'/resume.pdf'}))
const PORT=process.env.PORT||3001
app.listen(PORT,()=>console.log(`Backend http://localhost:${PORT}`))
