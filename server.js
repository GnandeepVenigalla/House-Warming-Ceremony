const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();

// ✅ Use your actual credentials here
const mongoUri = 'mongodb+srv://Cluster58986:SElVZW5xRWJm@cluster58986.jitfk.mongodb.net/rsvp_db?retryWrites=true&w=majority&appName=Cluster58986';

mongoose.connect(mongoUri)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

const RSVP = mongoose.model('RSVP', {
  name: String,
  attendance: { type: String, enum: ['yes', 'no'], required: true },
  adults: { type: Number, default: 0 },
  kids: { type: Number, default: 0 },
  contact: String,
  comment: String,
});

app.use(cors());  // Enable CORS for all origins
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/rsvp', async (req, res) => {
  let { name, attendance, adults, kids, contact, comment } = req.body;
  const adultsNum = attendance === 'yes' ? Number(adults) : 0;
  const kidsNum = attendance === 'yes' ? Number(kids) : 0;

  // Sanitize comment to ensure it's a string
  if (Array.isArray(comment)) {
    comment = comment.join(', ');
  } else if (typeof comment !== 'string') {
    comment = '';
  }

  try {
    await new RSVP({ name, attendance, adults: adultsNum, kids: kidsNum, contact, comment }).save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving RSVP:', error);
    res.status(500).json({ success: false, error: 'Failed to save RSVP' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// New API endpoint to get RSVP data as JSON
app.get('/api/rsvps', async (req, res) => {
  try {
    const data = await RSVP.find();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RSVP data' });
  }
});

// DELETE RSVP by ID
app.delete('/rsvp/:id', async (req, res) => {
  try {
    const result = await RSVP.findByIdAndDelete(req.params.id);
    if (result) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'RSVP not found' });
    }
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    res.status(500).json({ success: false, error: 'Failed to delete RSVP' });
  }
});

// UPDATE RSVP by ID
app.put('/rsvp/:id', async (req, res) => {
  try {
    const updateData = req.body;
    if (updateData.adults) updateData.adults = Number(updateData.adults);
    if (updateData.kids) updateData.kids = Number(updateData.kids);
    const updated = await RSVP.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (updated) {
      res.json({ success: true, data: updated });
    } else {
      res.status(404).json({ success: false, error: 'RSVP not found' });
    }
  } catch (error) {
    console.error('Error updating RSVP:', error);
    res.status(500).json({ success: false, error: 'Failed to update RSVP' });
  }
});



app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
