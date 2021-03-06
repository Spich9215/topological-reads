const { ObjectID } = require('mongodb'); 
const mongoCollections = require('../config/mongoCollections');
const books = mongoCollections.books;
const users = mongoCollections.users;
const groups = mongoCollections.groups;
const lists = mongoCollections.lists;
const tag = mongoCollections.tags;

module.exports = {
    async create(name, items, order, owners, tags){ 
        if(!name || typeof(name) !== 'string' || name.trim() === ""){
          throw "ERROR: Invalid name input";
        }
        if(!items || !Array.isArray(items)){
          throw "ERROR: Invalid items input";
        }
        const bookCollection = await books();
        let lists_list = await this.getAll();
        for(l of lists_list){
            if(l.name === name){
                throw "ERROR: Name is already taken!"
            }
        }
        for(let i = 0; i < items.length; i++){
            if(!ObjectID.isValid(items[i])){
                throw "ERROR: Invalid items input";
            }
            let bookOne = await bookCollection.findOne({ _id: ObjectID(items[i])});
            if (bookOne === null){
                throw 'ERROR: No book with the ids in your list of items';
            } 
        }

        if(!order || !Array.isArray(order)){
            throw "ERROR: Invalid order input";
        }
  
        for(let i = 0; i < order.length; i++){
            let pair = order[i]
            if(!Array.isArray(pair) || pair.length !== 2){
                throw "ERROR: Invalid order input";
            }
            if(!ObjectID.isValid(pair[0]) || !ObjectID.isValid(pair[1])){
                throw "ERROR: Invalid order input";
            }
            let bookTwo = await bookCollection.findOne({ _id: ObjectID(pair[0])});
            if (bookTwo === null || !items.includes(pair[0])){
                throw 'ERROR: Invalid book in orders pair';
            } 
            let bookThree = await bookCollection.findOne({ _id: ObjectID(pair[1])});
            if (bookThree === null || !items.includes(pair[1])){
                throw 'ERROR: Invalid book in orders pair';
            } 
        }

        if(!owners || !Array.isArray(owners)){
            throw "ERROR: Invalid owners input";
        }
        const userCollection = await users();
        const groupCollection = await groups();

        for(let i = 0; i < owners.length; i++){
            if(!ObjectID.isValid(owners[i])){
                throw "ERROR: Invalid owners input";
            }
            let user1 = await userCollection.findOne({ _id: ObjectID(owners[i])});
            let group1 = await groupCollection.findOne({ _id: ObjectID(owners[i])});
            if (user1 === null && group1 === null){
                throw 'ERROR: No book or user in database with your input';
            } 
        }
        if(!tags || !Array.isArray(tags)){
            throw "ERROR: Invalid tags input";
        }
        const tagCollection = await tag();
      
        for(let i = 0; i < tags.length; i++){
            if(!ObjectID.isValid(tags[i])){
                throw "ERROR: Invalid tags input";
            }
            let tag1 = await tagCollection.findOne({ _id: ObjectID(tags[i])});
            if(tag1 === null){
                throw 'ERROR: No tag with the ids in your list of tags';
            } 
        }

        const listCollection = await lists();

        let newlist = {
          name: name.trim(),
          items: items,
          order: order,
          owners: owners,
          tags: tags

        };
        const insertInfo = await listCollection.insertOne(newlist);
        if (insertInfo.insertedCount === 0) throw 'Could not add list';
        const newId = insertInfo.insertedId;
        let list1 = await this.get(newId);
        return list1;
      },

      async getAll() {
        const listCollection = await lists();
        const listList = await listCollection.find({}).toArray();
        if(listList === []){
            throw "ERROR: There are no reading lists yet!"
        }
        return listList;
      },

      async get(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'object') throw 'ERROR: id is not an object';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id'
        const listCollection = await lists();
        const list1 = await listCollection.findOne({ _id: id});
        if (list1 === null) throw 'ERROR: No list with that id';
        return list1;
      },
      async remove(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'object') throw 'ERROR: id is not a string';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        const listCollection = await lists();
        const deletionInfo = await bookCollection.removeOne({ _id: id});
        if (deletionInfo.deletedCount === 0) {
         throw `Could not delete book with id of ${id}`;
        }
        return {bookId: id, deleted: true};
      },

      async update(id, list) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!list) throw 'ERROR: You must provide a list to update';
        if (typeof(id) !== 'object' ) throw 'ERROR: Invalid ID input';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        if(typeof(list) != 'object') throw 'ERROR: Invalid list';
        let updatedList = {};
        if(list.name){
          if(typeof(list.name) !== 'string' || list.name.trim() === ""){
            throw "ERROR: Invalid input for name"
          }
          list.name = list.name.trim();
          updatedList.name = list.name;
        }
        if(list.items){
            if(!Array.isArray(list.items)){
                throw "ERROR: Invalid input for items"
            }
            let bookCollection = await books();
            for(let i = 0; i < list.items.length; i++){
                if(!ObjectID.isValid(list.items[i])){
                    throw "ERROR: Invalid items input";
                }
                let bookOne = await bookCollection.findOne({ _id: ObjectID(list.items[i])});
                if (bookOne === null){
                    throw 'ERROR: No book with the ids in your list of items';
                } 
            }
        }
        if(list.order){
            if(!Array.isArray(list.order)){
                throw "ERROR: Invalid order input";
            }
            for(let i = 0; i < list.order.length; i++){
                let pair = list.order[i]
                if(!Array.isArray(pair) || pair.length !== 2){
                    throw "ERROR: Invalid order input";
                }
                if(!ObjectID.isValid(pair[0]) || !ObjectID.isValid(pair[1])){
                    throw "ERROR: Invalid order input";
                }
                let bookTwo = await bookCollection.findOne({ _id: ObjectID(pair[0])});
                if (bookTwo === null || !items.includes(pair[0])){
                    throw 'ERROR: Invalid book in orders pair';
                } 
                let bookThree = await bookCollection.findOne({ _id: ObjectID(pair[1])});
                if (bookThree === null || !items.includes(pair[1])){
                    throw 'ERROR: Invalid book in orders pair';
                } 
            }
        }
        if(list.owners){
            if(!Array.isArray(list.owners)){
                throw "ERROR: Invalid owners input";
            }
            const userCollection = await users();
            const groupCollection = await groups();
            for(let i = 0; i < list.owners.length; i++){
                if(!ObjectID.isValid(list.owners[i])){
                    throw "ERROR: Invalid owners input";
                }
                let user1 = await userCollection.findOne({ _id: ObjectID(list.owners[i])});
                let group1 = await groupCollection.findOne({ _id: ObjectID(list.owners[i])});
                if (user1 === null && group1 === null){
                    throw 'ERROR: No book or user in database with your input';
                } 
            }
        }
        if(list.tags){
            if(!Array.isArray(list.tags)){
                throw "ERROR: Invalid tags input";
            }
            const tagCollection = await tag();
            for(let i = 0; i < list.tags.length; i++){
                if(!ObjectID.isValid(list.tags[i])){
                    throw "ERROR: Invalid tags input";
                }
                let tag1 = await tagCollection.findOne({ _id: ObjectID(list.tags[i])});
                if(tag1 === null){
                    throw 'ERROR: No tag with the ids in your list of tags';
                } 
            }
        }

        if(updatedList === {}){
            throw "ERROR: The list does not have updatable components"
        }
        const listCollection = await lists();
        const updatedInfo = await listCollection.updateOne(
          {_id: id},
          { $set: updatedList }
        );
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount){
          throw 'Update failed';
        }
        return await this.get(id);
      },
};