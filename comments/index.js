const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req,res)=> {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req,res)=> {
    const commentId = randomBytes(4).toString('hex');
    const {content} = req.body;
    const comments = commentsByPostId[req.params.id]||[];
    const status = 'pending';
    comments.push({
        commentId,
        content,
        status
    });
    
    commentsByPostId[req.params.id] = comments;
    
    await axios.post('http://event-bus-srv:4005/events',{
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status
        }
    })
    res.status(201).send(comments);
});

app.post('/events',async (req,res) => {
    const {type,data} = req.body;
    console.log("Event Received",type);

    if(type==='CommentModerated'){
        const {id,postId,status} = data;
        const currentComments = commentsByPostId[postId];
        const comment = currentComments.find(comment => {
            return comment.commentId === id;
        });
        console.log(comment);
        comment.status = status;

        await axios.post('http://event-bus-srv:4005/events',{
            type: 'CommentUpdated',
            data
        });
    }
    res.send({});
});

app.listen(4001,() => {
    console.log('listening on port 4001');
})