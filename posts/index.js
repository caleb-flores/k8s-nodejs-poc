const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const posts = {};

app.use(cors());
app.use(bodyParser.json());

app.get('/posts', (req,res) => {
    res.send(posts);
});

app.post('/posts', async (req,res) => {
    const id = randomBytes(4).toString('hex');
    const {title} = req.body;
    posts[id] = {
        id, title
    };
    await axios.post('http://localhost:4005',{
        type: 'PostCreated',
        data:{
            id,title
        }
    })
    res.status(201).send(posts[id]);
});


app.listen(4000,() =>{
    console.log('Listening on 4000');
})