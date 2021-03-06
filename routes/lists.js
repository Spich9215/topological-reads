const express = require('express'); // Use for testing
const router = express.Router();
const data = require('../data');
const listsData = data.lists;

router.get('/', async (req, res) => {
  try {
    const lists = await listsData.getAll();
    res.json(lists);
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: 'Lists not found' });
  }
});

router.post('/', async (req, res) => {
  let list = req.body;
  if(!list){
    res.status(400).json({ error: 'You must provide an list' });
    return;
  }
  if (!list.name) {
    res.status(400).json({ error: 'You must provide an list name' });
    return;
  }

  if(Object.keys(list).length !== 1){
    res.status(400).json({ error: 'Too many inputs' });
    return;
  }
  try {
    const newlist = await listsData.create(list.name);
    res.json(newlist);
  } catch (e) {
      res.status(400).json({ error: e });
  }
});

router.get('/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must Supply an ID' });
    return;
  }
  try {
    let list = await listsData.get(req.params.id);
    res.json(list);
  } catch (e) {
    console.log(e)
    res.status(404).json({ error: 'list not found' });
  }
});

router.put('/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must Supply an ID' });
    return;
  }
  const updatedData = req.body;
  if (!updatedData.name) {
    res.status(400).json({ error: 'You must supply all fields' });
    return;
  }
  try {
    await listsData.get(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'list not found' });
    return;
  }

  try {
    const updatedPost = await listsData.update(req.params.id, updatedData);
    res.json(updatedPost);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.patch('/:id', async (req, res) => {
  const requestBody = req.body;
  let updatedObject = {};
  if(!req.params.id){
    res.status(400).json({ error: 'You must supply an id' });
    return; 
  }
  if(!requestBody.name){
    res.status(400).json({ error: 'You must supply at least one field' });
    return; 
  }
  try {
    const oldPost = await listsData.get(req.params.id);
    if (requestBody.name){
      if(requestBody.name !== oldPost.name){
        updatedObject.name = requestBody.name;
      }
      else{
        updatedObject.name = oldPost.name;
      }
    }
    updatedObject._id = oldPost._id;
      
  } catch (e) {
    res.status(404).json({ error: 'list not found' });
    return;
  }
  if (Object.keys(updatedObject).length !== 0) {
    try {
      const updatedPost = await listsData.update(
        req.params.id,
        updatedObject
      );
      res.json(updatedPost);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  } else {
    res.status(400).json({
        error: 'No fields have been changed from their initial values, so no update has occurred'
      });
  }
});

router.delete('/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must supply ID to delete' });
    return;
  }
  
  try {
    await listsData.get(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'list not found' });
    return;
  }
  try {
    const list1 = await listsData.remove(req.params.id);;
    res.json(list1);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

module.exports = router;