
import express from 'express'
const router = express.Router()
const msgs=[]
router.post('/',(req,res)=>{ const {name,email,msg}=req.body; msgs.push({name,email,msg,at:new Date()}); console.log('Contact:',req.body); res.json({ok:true}) })
router.get('/',(req,res)=>res.json(msgs))
export default router
