const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const User = require('./mongo/user');
const Board = require('./mongo/board');

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const schema = buildSchema(`
    
    input UserInput {
        name: String!
    }
    
    input BoardInput {
        owner: String
    }
    
    input EditorInput {
        boardId: String
        editor: String
    }
    
    input PostInput {
        boardId: String
        text: String
        author: String
        x: Int
        y: Int
    }
    
    input DeletePostInput {
        boardId: String
        postId: String
    }
    
    input DeleteEditorInput {
        boardId: String
        editorId: String
    }
    
    input UpdatePostInput {
        boardId: String
        postId: String
        text: String
    }
    
    input DeleteBoardInput {
        boardId: String
    }
    
    type User {
        _id: String
        name: String
    }
    
    type Board {
        _id: String
        owner: String
    }
    
    type Editor {
        boardId: String
        editor: [String]
    }
    
    type Post {
        _id: String
        text: String
        author: String
        x: Int
        y: Int
    }
    
    type DeletePost {
        postId: String
    }
    
    type DeleteEditor {
        editorId: String 
    }
    
    type DeleteBoard {
        boardId: String
    }

    type Query {
        userById(id: String!): User
    }
    
    type Mutation {
        createUser(user: UserInput): User
        createBoard(board: BoardInput): Board
        addEditor(editor: EditorInput): Editor
        addPost(post: PostInput): Post
        deletePost(deletePost: DeletePostInput): DeletePost
        deleteEditor(deleteEditor: DeleteEditorInput): DeleteEditor
        updatePost(post: UpdatePostInput): Post
        deleteBoard(deleteBoard: DeleteBoardInput): DeleteBoard
    }
`);

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: {
        async userById({id}){
            const user = await User.findById(id);
            return user;
        },

        async createUser({user}){
            const model = new User(user);
            await model.save();
            return model;
        },

        async createBoard({board}){
            const model = new Board(board);
            await model.save();
            return model;
        },

        async addEditor({editor}){
            const board = await Board.findOne({_id: editor.boardId});
            board.editors.push(editor.editor);
            await board.save();
        },

        async addPost({post}){
            const board = await Board.findOne({_id: post.boardId});
            board.posts.push(post);
            await board.save();
        },

        async deletePost({deletePost}){
            const board = await Board.updateOne(
                {_id: deletePost.boardId},
                {$pull: {posts: {_id: deletePost.postId}}});
            console.log(board);
        },

        async deleteEditor({deleteEditor}){
            const board = await Board.updateOne(
                {_id: deleteEditor.boardId},
                {$pull: {editors: deleteEditor.editorId}});
            console.log(board);
        },

        async updatePost({post}){
            const board = await Board.findOneAndUpdate(
                {_id: post.boardId, "posts._id" : post.postId},
                {$set: {"posts.$.text": post.text}});
            console.log(board);
        },

        async deleteBoard({deleteBoard}){
            const board = await Board.deleteOne({ _id: deleteBoard.boardId});
            console.log(board);
        }

    },
    graphiql: true,
}));

mongoose.connect('mongodb://localhost:27017', {
    user: 'root',
    pass: 'example',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true}, error => {
    if(!error) {
        app.listen(PORT, () => {
            console.log(`Example app listening at http://localhost:${PORT}`)
        })
    } else {
        console.error('Failed to open a connection to mongo db.', error);
    }
});



