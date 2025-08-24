// const Product = require("../Model/product");

// exports.createProduct = async (req, res) => {
//     try {
//       const { name, description, price, } = req.body;

//       const imageUrls = req.files.map((file) => file.path);

//       const product = await Product.create({
//         name,
//         description,
//         price,
//         images: imageUrls,
//       });
      

//       res.status(201).json({ success: true, product });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   };



  const Product = require("../Model/product");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    // Extract Cloudinary URLs
    const imageUrls = req.files.map((file) => file.path);


    // Create product in MongoDB
    const product = await Product.create({
      name,
      description,
      price,
      images: imageUrls, // <-- Make sure your schema has `images: [String]`
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Server error" });
  }
};
