const dbService = require('../../services/db-service')
const logger = require('../../services/logger-service')
    // const reviewService = require('../review/review-service')
const bcrypt = require('bcrypt')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    getByUsername,
    remove,
    update,
    add,
    // likedSong,
    // likedStation
}

async function query() {
    // const criteria = {}
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find().toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = ObjectId(user._id).getTimestamp()
                // Returning fake fresh data
                // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ '_id': ObjectId(userId) })
        delete user.password

        // user.reviews = await reviewService.query({ byUserId: ObjectId(user._id) })
        // user.reviews = user.reviews.map(review => {
        //   delete review.byUser
        //   return review
        // })
        return user
    } catch (err) {
        logger.error(`while finding user ${userId}`, err)
        throw err
    }
}
async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.deleteOne({ '_id': ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    // const isAdmin = JSON.parse(user.isAdmin);
    // console.log(isAdmin);
    const { username, fullname, likedStations, imgUrl } = user
    try {
        // peek only updatable fields!
        const userToSave = {
            _id: ObjectId(user._id),
            username,
            fullname,
            imgUrl,
            likedStations
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ '_id': userToSave._id }, { $set: userToSave })
        return userToSave;
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    const { username, password, fullname, imgUrl, likedStations } = user
    try {
        const userToAdd = {
            username,
            password,
            fullname,
            imgUrl,
            likedStations
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        delete userToAdd.password;
        return userToAdd
    } catch (err) {
        logger.error('cannot insert user', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    return criteria;
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [{
                username: txtCriteria
            },
            {
                fullname: txtCriteria
            }
        ]
    }
    if (filterBy.minBalance) {
        criteria.balance = { $gte: filterBy.minBalance }
    }
    return criteria
}