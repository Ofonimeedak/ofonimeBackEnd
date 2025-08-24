const express = require('express');
const userRouter = require('./routes/userRoute');
 const productRouter = require('./routes/productRoutes');
 const paymentRouter=require('./routes/paymentRoutes')



const app = express();


app.use(express.json({ limit: '100mb' }));





app.use('/api/user',userRouter);
app.use('/api/product', productRouter);
app.use('/api/payment', paymentRouter);


const port = 5000;

app.listen(port, () =>{
  console.log(`Server is running on port ${port}...`);
});



module.exports = app;



