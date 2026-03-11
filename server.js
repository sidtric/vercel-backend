
const express = require('express')
const cors = require('cors')
const Razorpay = require("razorpay")
const dotenv = require('dotenv').config()
const PORT = process.env.PORT||5000

const app = express()

app.use(cors())
app.use(express.json())


const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})


const mongoose = require("mongoose")
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("mongo connected"))
.catch((err)=>err)

const paymentschema = new mongoose.Schema({
    fullname:String,
    email:String,
    subtotal:Number,
    tax:Number,
    total:Number,
    razorpay_payment_id:String,
   createdAt:{type:Date ,default:Date.now}
})

const Payment = mongoose.model("Payment",paymentschema)
 

app.get('/' ,(req,res)=>{
    res.send("server is running")
})

app.post('/payments', async (req,res) =>{
    try{
        const{amount}  = req.body

        const order = await razorpay.orders.create({
        amount: amount* 100,
        currency: "INR"
    })
    res.json(order)
    }catch(err){
        console.log(err);
        res.status(500).json({error:"smthing wrong"})
    }   
})

app.post('/save-payment', async(req,res)=>{
    try{
        const payment = new Payment(req.body)

        await payment.save()
        res.json({
            success:true,
            message:"payment saved"
        })
    }catch(err){
        res.status(500).json({
            success:false,
            message:"error saving payment"
        })

    }
})

app.listen(PORT ,()=> console.log(`server started at ${PORT}`))






