const express= require("express")
const hbs= require("hbs")
const app=express()
const path=require("path")
const port = process.env.PORT || 4000
const multer=require("multer")
const cv = require('opencv4nodejs');

const static_path= path.join(__dirname,"../public")
app.use(express.static(static_path))

const template_path=path.join(__dirname,"../templates/views")

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.set("view engine", "hbs");
app.set("views", template_path);


// set up storage 
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        // cb is callback fn and takes 2params (err,success)
        cb(null,'uploads');
    },
    filename:function(req,file,cb){
        return cb(null,file.originalname)
    }
})
const upload=multer({storage:storage})

app.use(express.static('uploads'));

app.get("/",(req,res)=>{
    res.render("index")
    // res.send("hello")
})

// Handle the file upload
app.post('/results', upload.single('urineSample'), async(req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // console.log('File uploaded:', req.file);
    console.log('File uploaded successfully.');
    // res.send("File uploaded successfully")

    const imagePath = path.join(__dirname, '../uploads', req.file.filename);
    const img = await cv.imreadAsync(imagePath);


    const colorRegions = [
        { label: 'URO', x: 144.42, y: 30, width: 63, height: 63 },
        { label: 'BIL', x: 144.42, y: 113, width: 63, height: 63 },
        { label: 'KET', x: 144.42, y: 196, width: 63, height: 63 },
        { label: 'BLD', x: 144.42, y: 249, width: 63, height: 63 },
        { label: 'PRO', x: 144.42, y: 362, width: 63, height: 63 },
        { label: 'NIT', x: 144.42, y: 445, width: 63, height: 63 },
        { label: 'LEU', x: 144.42, y: 528, width: 63, height: 63 },
        { label: 'GLU', x: 144.42, y: 611, width: 63, height: 63 },
        { label: 'SG', x: 144.42, y: 694, width: 63, height: 63 },
        { label: 'PH', x: 144.42, y: 777, width: 63, height: 63 },

    ];

    const colorCodes = [];

    for (const region of colorRegions) {
        const roi = img.getRegion(new cv.Rect(region.x, region.y, region.width, region.height));
        const meanColor = roi.mean();
        const rgbColor = new cv.Vec3(meanColor[0], meanColor[1], meanColor[2]);
        colorCodes.push({
            label: region.label,
            rgb: rgbColor,
        });
    }

    res.json({ colors: colorCodes });
});


app.listen(port,()=>{
    console.log(`Server is running at port ${port}`)
})