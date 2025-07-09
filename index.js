const express=require('express');
const cors=require('cors')
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_GATEWAY_KEY);
const app=express()
const port=process.env.PORT || 3000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.3b76qlc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`;


    console.log(process.env.DB_USER, process.env.DB_PASS);
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

        const parcelCollection=client.db('parcelDB').collection('parcel');

      app.get('/parcel',async(req,res)=>{
       const result = await parcelCollection.find().toArray();
        res.send(result); 
    })
 
     app.get('/parcel',async(req,res)=>{
     try{
        const userEmail = req.query.email;
        const query=userEmail?{created_by:userEmail}:{}
        const options = {
            sort : {createdAt :-1},//newest first
        };
    const parcels = await parcelCollection.find(query,options).toArray();
    res.status(201).send(parcels);
    }
    catch(error){
        console.error('Error inserting percel:',error);
        res.status(500).send({message:'Failed to get parcel'})
    }
});

     app.get('/parcel/:id',async(req,res)=>{
     try{
        const id = req.params.id;;
    const parcel = await parcelCollection.findOne({_id:new ObjectId(id)});
    if(!parcel)
    {
        return res.status(404).send({message:"Parcel Not Found"});
    }
    res.send(parcel)
    }
    catch(error){
        console.error('Error inserting percel:',error);
        res.status(500).send({message:'Failed to get parcel'})
    }
});



        app.post('/parcel', async (req, res) => {
    try{
        const newParcel = req.body;
    const result = await parcelCollection.insertOne(newParcel);
    res.status(201).send(result);
    }
    catch(error){
        console.error('Error inserting percel:',error);
        res.status(500).send({message:'Failed to create parcel'})
    }
});

app.post('/create-payment-intent', async (req, res) => {
    const amount_in_cents=req.body.amountInCents,
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_in_cents,
      currency: 'usd',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

   app.delete('/parcel/:id', async (req, res) => {
            try {
                const id = req.params.id;

                const result = await parcelCollection.deleteOne({ _id: new ObjectId(id) });

                res.send(result);
            } catch (error) {
                console.error('Error deleting parcel:', error);
                res.status(500).send({ message: 'Failed to delete parcel' });
            }
        });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('ProFast is getting started!!!')
});

app.listen(port,()=>{
    console.log(`ProFast Server is running on the port ${port}`)
});