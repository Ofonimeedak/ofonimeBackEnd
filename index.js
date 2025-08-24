
//  const fs=require('fs');

// // try {
// //     const data=fs.readFileSync('file.txt','utf8');
// //     console.log("this is the file to read:", data);
    
// // } catch (error) {

// //     console.log(error);
// // }


// // Asynchronous reading (promise)
// // const fs = require('fs').promises;

// // fs.readFile('file.txt', 'utf8')
// //     .then((data) => {
// //     console.log(data);
// //   })
// //   .catch((err) => {
// //     console.error(err);
// //   });



// // Asynchronous reading (async/await)
// // const fs = require('fs').promises;

// // async function readFile() {
// //   try {
// //     const data = await fs.readFile('file.txt', 'utf8');

// //     console.log(data);
// //   } catch (err) {
// //     console.error(err);
// //   }
// // }

// // readFile();

// fs.readFile('file.txt', 'utf8', (err, data) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log(data);
//   }
// });


// //creating a simple server
// const http = require('http');

// const server = http.createServer((req, res) =>{

//   const url = req.url;

//   if(url === '/'){
//      res.writeHead(
//     200,
//     {
//       'content-type': 'text/plain'
//     }
//   );

//   res.end('Hello, this is your response');
//   }

//    else if(url === '/signup'){
//      res.writeHead(
//     200,
//     {
//       'content-type': 'text/plain'
//     }
//   );

//   res.end('this is signup route');
//   }

//   else if(url === '/login'){
//      res.writeHead(
//     200,
//     {
//       'content-type': 'text/plain'
//     }
//   );

//   res.end('this is login route');
//   }

//   else{
//      res.writeHead(
//     404,
//     {
//       'content-type': 'text/plain'
//     }
//   );

//   res.end(`${url} route does not exist on this server`);
//   }
 
// });


// const port = 5000;

// server.listen(port, () =>{
//   console.log(`Server is running on port ${port}...`);
// });

//Update your index.js file

const app = require('./app');
const mongoose=require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.DATABASE_URI).then(()=>{
  
  console.log("Data base connected successfully");
  

}).catch((err)=>{
  console.log(err)

})


