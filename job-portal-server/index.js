
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const textract = require('textract');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@job-portal.wxmniyc.mongodb.net/?retryWrites=true&w=majority&appName=Job-portal`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
  try {
    await client.connect();

    const db = client.db("jobPortal");
    const jobsCollection = db.collection("jobs");

    app.post('/post-job', async (req, res) => {
      try {
        const jobData = req.body;
        const result = await jobsCollection.insertOne(jobData);
        res.status(201).json({ message: 'Job posted successfully', job: { _id: result.insertedId, ...jobData } });
      } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ error: 'Failed to post job' });
      }
    });

    app.post('/analyze-cv', upload.single('cvFile'), async (req, res) => {
      const { jobDescription } = req.body;
      const cvFilePath = req.file.path;
      const cvMimeType = mime.lookup(req.file.originalname);

      try {
        let cvText = '';
        if (cvMimeType === 'application/pdf') {
          const dataBuffer = fs.readFileSync(cvFilePath);
          const data = await pdfParse(dataBuffer);
          cvText = data.text;
        } else {
          cvText = await new Promise((resolve, reject) => {
            textract.fromFileWithMimeAndPath(cvMimeType, cvFilePath, (error, text) => {
              if (error) reject(error);
              resolve(text);
            });
          });
        }

        const prompt = `Evaluate the following CV for the given job description. Provide a score out of 100 and highlight areas for improvement.\n\nCV:\n${cvText}\n\nJob Description:\n${jobDescription}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        console.log('Model response:', text);

        if (text) {
          const scoreMatch = text.match(/Score: (\d+)/);
          const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
          const improvementAreas = text.replace(/Score: \d+/, '').trim();

          // Generate PDF report in APA style
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const fontSize = 12;
          const lineHeight = fontSize * 1.2;
          const margin = 50;
          const maxWidth = page.getWidth() - margin * 2;

          const title = 'CV Analysis Report';
          const titleFontSize = 20;
          const titleWidth = font.widthOfTextAtSize(title, titleFontSize);
          page.drawText(title, {
            x: margin + (maxWidth - titleWidth) / 2,
            y: page.getHeight() - margin - titleFontSize,
            size: titleFontSize,
            font,
            color: rgb(0, 0, 0),
          });

          let yPosition = page.getHeight() - margin - titleFontSize - lineHeight;

          const drawText = (text, x, y, fontSize = 12) => {
            const words = text.replace(/\n/g, ' ').split(' ');
            let line = '';
            for (let word of words) {
              const testLine = line + word + ' ';
              const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);
              if (testLineWidth > maxWidth && line !== '') {
                page.drawText(line, {
                  x,
                  y,
                  size: fontSize,
                  font,
                  color: rgb(0, 0, 0),
                });
                line = word + ' ';
                y -= lineHeight;
              } else {
                line = testLine;
              }
            }
            page.drawText(line, {
              x,
              y,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
            y -= lineHeight;
            return y;
          };

          yPosition = drawText(`Score: ${score}`, margin, yPosition, fontSize);
          yPosition = drawText('Improvement Areas:', margin, yPosition - lineHeight, fontSize);
          yPosition = drawText(improvementAreas, margin, yPosition - lineHeight, fontSize);

          const pdfBytes = await pdfDoc.save();
          const pdfPath = path.join(__dirname, 'report.pdf');
          fs.writeFileSync(pdfPath, pdfBytes);

          fs.unlinkSync(cvFilePath); // Clean up uploaded file
          res.json({ score, improvementAreas, pdfPath });
        } else {
          res.status(500).json({ error: 'Invalid response from AI model' });
        }

      } catch (error) {
        console.error('Error processing CV:', error);
        res.status(500).json({ error: 'Failed to process CV' });
      }
    });

    app.get('/download-report', (req, res) => {
      const pdfPath = path.join(__dirname, 'report.pdf');
      res.download(pdfPath);
    });

    app.get('/all-jobs', async (req, res) => {
      try {
        const jobs = await jobsCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.json(jobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
