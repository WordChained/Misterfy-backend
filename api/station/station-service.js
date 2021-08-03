const dbService = require('../../services/db-service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als-service')
    // const logger = require('../../services/logger-service')

module.exports = {
    query,
    getById,
    remove,
    add,
    update,
    // addSong,
    // removeSong,
    getChatMsgs,
    addChatMsg
}

async function query(filterBy = {}) {
    // console.log('FILTER BY', filterBy)
    const criteria = _buildCriteria(JSON.parse(filterBy))
    try {
        const collection = await dbService.getCollection('station')
        var filteredStations = await collection.find(criteria).toArray()
        var stations = await collection.find().toArray()
            //Getting the tags when we can get all the stations
            // if (!Object.keys(criteria).length) {
            //     tags = _getUniqeTags(stations);
            // }
        return { stations, filteredStations };
    } catch (err) {
        // logger.error('cannot find stations', err)
        console.log('Error on station service =>', err)
        throw err
    }
}

async function getById(stationId) {
    try {
        const collection = await dbService.getCollection('station')
        const station = await collection.findOne({ '_id': ObjectId(stationId) })
        return station
    } catch (err) {
        // logger.error(`while finding station ${stationId}`, err)
        console.log('Error on station service =>', err)
        throw err
    }
}

async function remove(stationId) {
    try {
        const collection = await dbService.getCollection('station')
        await collection.deleteOne({ '_id': ObjectId(stationId) })
    } catch (err) {
        // logger.error(`cannot remove station ${stationId}`, err)
        console.log('Error on station service =>', err)
        throw err
    }
}

async function add(station) {
    try {
        const stationToAdd = {
            name: station.name,
            description: station.description,
            createdBy: station.createdBy,
            songs: [],
            createdAt: Date.now(),
            imgUrl: station.imgUrl || '',
            tags: station.tags || [],
            likedByUsers: station.likedByUsers
        }
        const collection = await dbService.getCollection('station')
        await collection.insertOne(stationToAdd)
        return stationToAdd;
    } catch (err) {
        // logger.error('cannot add station', err)
        console.log('Error on station service =>', err)
        throw err
    }
}

async function update(station) {
    try {
        // peek only updatable fields!
        const stationToSave = {
            _id: ObjectId(station._id),
            name: station.name,
            description: station.description,
            createdBy: station.createdBy,
            songs: station.songs,
            createdAt: station.createdAt,
            imgUrl: station.imgUrl || '',
            tags: station.tags,
            msgs: station.msgs || [],
            likedByUsers: station.likedByUsers

        }
        const collection = await dbService.getCollection('station')
        await collection.updateOne({ '_id': stationToSave._id }, { $set: stationToSave })
        return stationToSave;
    } catch (err) {
        // logger.error(`cannot update station ${station._id}`, err)
        console.log('Error on station service =>', err)
        throw err
    }

}

// async function addSong(stationId, song) {
//     try {
//         const collection = await dbService.getCollection('station')
//         await collection.updateOne({ '_id': ObjectId(stationId) }, { $push: { 'songs': song } })
//         return await collection.findOne(ObjectId(stationId));
//     } catch (err) {
//         logger.error(`cannot add song ${song.id}`, err)
//         console.log('Error on station service =>', err)
//         throw err
//     }
// }
// async function removeSong(stationId, song) {
//     try {
//         const collection = await dbService.getCollection('station')
//         await collection.updateOne({ '_id': ObjectId(stationId) }, { $pull: { 'songs': song } })
//         return await collection.findOne(ObjectId(stationId));
//     } catch (err) {
//         logger.error(`cannot remove song ${song.id}`, err)
//         console.log('Error on station service =>', err)
//     }
// }

async function getChatMsgs(stationId) {
    try {
        const station = await getById(stationId);
        const msgs = station.msgs || [];
        return msgs;
    } catch (err) {
        console.log('Cant get messages', err);
    }
}

async function addChatMsg(stationId, msg) {
    try {
        const collection = await dbService.getCollection('station')
        await collection.updateOne({ '_id': ObjectId(stationId) }, { $push: { 'msgs': msg } })
        return await collection.findOne(ObjectId(stationId));
    } catch (err) {
        // logger.error(`cannot add message ${song.id}`, err)
        console.log('Error on station service =>', err)
    }
}


function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.name) {
        const nameCriteria = { $regex: filterBy.name, $options: 'i' }
        criteria.name = nameCriteria;

    }
    if (filterBy.tag && filterBy.tag !== 'All') {
        const tagCriteria = filterBy.tag;
        criteria.tags = tagCriteria
    }
    return criteria
}

// function _getUniqeTags(stations) {
//     tags = stations.reduce(
//         (acc, station) => {
//             acc.push(...station.tags);
//             return acc;
//         }, []
//     );
//     return Array.from(new Set(tags));
// }