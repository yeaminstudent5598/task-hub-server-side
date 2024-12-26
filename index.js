const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const app = express();
const { ObjectId } = require('mongodb'); // Import ObjectId
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors({
  origin: ['http://localhost:5173'], 
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());





// DB_USER= task-hub
// DB_PASS= 0bkFKZtiEjYibyzw

const uri = `mongodb+srv://task-hub:0bkFKZtiEjYibyzw@cluster0.fw34o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


const assignmentsCollection = client.db('assignmentsDB').collection('assignments');


// Auth related APIs

app.post('/jwt', async (req, res) =>{
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_SECRET , {expiresIn: '1h'});

  res.cookie('token', token, { 
    httpOnly: true,
    secure: true, // Typo here
}).send({ success: true });

})


const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
   
  if(!token) {
    return res.status(401).send({massage: 'Unathrorized access'})
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)  {
      return res.status(401).send({massage: 'Unathrorized access'})

    }
    req.user = decoded;
    next();
  })
}


app.post('/logout', (req, res) => {
  res.clearCookie('token',{
    httpOnly: true,
    secure: true,
  })
  .send({ success: true });
});












app.get('/assignments', async (req, res) => {
  const { difficulty, search } = req.query; // Retrieve query parameters for difficulty and search

  const filter = {};

  // Apply filter for difficulty if provided
  if (difficulty) {
    filter.difficulty = difficulty;
  }

  // Apply search filter if provided
  if (search) {
    filter.title = { $regex: search, $options: 'i' }; // Case-insensitive search by title
  }

  try {
    const cursor = assignmentsCollection.find(filter); // Apply filters to the database query
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).send({ message: 'Error fetching assignments' });
  }
});


  app.get('/assignments/:id', async (req, res) => {
    const { id } = req.params; 
    const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(id) });
    console.log(id);
  
    if (!assignment) {
      return res.status(404).send({ message: "Campaign not found!" });
    }
  
    res.send(assignment); 
  });
  
  
// Fetch pending assignments (not marked yet)
app.get('/pending-assignments', async (req, res) => {
  try {
    // Fetch assignments where status is not 'completed'
    const pendingAssignments = await assignmentsCollection.find({ status: { $ne: 'completed' } }).toArray();
    res.status(200).json(pendingAssignments);
  } catch (error) {
    console.error('Error fetching pending assignments:', error);
    res.status(500).json({ message: 'Failed to fetch pending assignments' });
  }
});


app.put('/assignments/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid assignment ID' });
  }

  try {
    const result = await assignmentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json({ message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const submissionsCollection = client.db('assignmentsDB').collection('submissions');


app.put('/submissions/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
console.log(id, updates);
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid submission ID' });
  }

  try {
    const result = await submissionsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'submission not found' });
    }

    res.status(200).json({ message: 'submission updated successfully' });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.patch('/mark-update/:id', async(req, res) =>{
  const {id}= req.params
  console.log(id);
  const {obtainedMarks,feedback, title, status} = req.body;
  const filter = {_id : new ObjectId (id)}
  const update = {
    $set: {
      obtainedMarks,
      feedback,
      title,
      status,
    },
  };
  const result = await submissionsCollection.updateOne(filter, update);
  res.send(result)
  console.log(title);
})


app.post('/submissions', async (req, res) => {
  const { assignmentId, userEmail, googleDocsLink, quickNote, obtainedMarks,feedback, title, marks  } = req.body;

  try {
    // Validate required fields
    if (!assignmentId || !userEmail || !googleDocsLink || !quickNote) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new submission object
    const newSubmission = {
      assignmentId,
      userEmail,
      googleDocsLink,
      quickNote,
      status: 'pending', 
      createdAt: new Date(), 
      obtainedMarks,
      feedback,
      title,
      marks,
    };

    // Insert the submission into the database
    const result = await client
      .db('assignmentsDB')
      .collection('submissions')
      .insertOne(newSubmission);

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission: result, // Updated here
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// app.get('/submissions', async (req, res) => {
//   try {
//     const submissions = await client
//       .db('assignmentsDB')
//       .collection('submissions')
//       .find()
//       .toArray();

//     res.status(200).json(submissions);
//   } catch (error) {
//     console.error('Error fetching submissions:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


app.get('/submittedAssignments', verifyToken, async(req, res)=>{
  const cursor = submissionsCollection.find()
  const result = await cursor.toArray()
  res.send(result)
  
})





app.get('/submissions',verifyToken, async (req, res) => {
  try {
    const submissions = await client
      .db('assignmentsDB')
      .collection('submissions')
      .find()
      .toArray();

    // Filter submissions by email if the email query parameter is provided
    const { email } = req.query;

      if (req.user.email !== req.query.email) {
        return res.status(403).send({massage: 'Forbidden access'})
      }
    // console.log('cuk cuk cookie', req.cookies);

    const filteredSubmissions = email
      ? submissions.filter((submission) => submission.userEmail === email)
      : submissions;

    res.status(200).json(filteredSubmissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




app.get('/submissions/:assignmentId', async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const submissions = await client
      .db('assignmentsDB')
      .collection('submissions')
      .find({ assignmentId })
      .toArray();

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




  app.post('/assignments', async (req, res) => {
    const assignmentData = req.body;
    
    console.log(assignmentData);
    const result = await assignmentsCollection.insertOne(assignmentData)
    res.send(result)
  })



  // update assignments
 app.put('/assignments/:id', async (req, res) => {
  const { id } = req.params; 
  const { title, marks, difficulty, dueDate } = req.body; 
console.log(id);
  // Validate the input
  if (!title || !marks || !difficulty || !dueDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the ID is valid
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid assignment ID' });
    }

    // Perform the update operation
    const result = await assignmentsCollection.updateOne(
      { _id: new ObjectId(id) }, 
      {
        $set: {
          title,
          marks,
          difficulty,
          dueDate,
        },
      }
    );

    // Check if the document was found and updated
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json({ message: 'Assignment updated successfully' });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// delete
app.delete('/assignments/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ID format
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid assignment ID format!" });
  }

  try {
    const result = await assignmentsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "assignment not found!" });
    }

    res.status(200).json({ message: "assignment deleted successfully!" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ message: "Failed to delete assignment!" });
  }
});

app.get('/', (req, res) => {
    res.send('task hub server is running');
})


app.listen(port, () =>{
    console.log(`taskhub is waiting at: ${port}`);
})