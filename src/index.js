const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if(!user){
    response.status(400).json({ error: "user not found" })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some((user)=>user.username === username)

  if(userAlreadyExists){
    return response.status(400).json({error: "User already exists"})
  }

  users.push({
    id:uuidv4(),
    name,
    username,
    todo:[]
  })

  return response.status(201).send()
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todo)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const { title, deadline} = request.body

  const todoOperation = {
    id:uuidv4(),
    title,
    done: false,
    deadline:new Date(deadline),
    created_at: new Date()
  }
  user.todo.push(todoOperation)

return response.status(201).send() 
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.query
  const { title, deadline } = request.body

  const task = user.todo.find(item => item.id === id)

  if (!task) {
    return response.status(400).json({ error: "item not found"})
  }

  task.title = title
  task.deadline = new Date(deadline)

  return response.status(200).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.query
  const { done } = request.headers

  const task = user.todo.find(item => item.id === id)

  if (!task) {
    return response.status(400).json({ error: "item not found"})
  }

  task.done = new Boolean(done)

  return response.status(200).send()
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.query

  const task = user.todo.find(item => item.id === id)

  if (!task) {
    return response.status(400).json({ error: "item not found"})
  }

  user.todo.splice(task, 1)

  return response.status(200).send()
});

module.exports = app;