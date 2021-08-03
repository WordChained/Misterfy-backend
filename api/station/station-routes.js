const express = require('express')
    // const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { addStation, updateStation, getStations, getStation, deleteStation, getChatMsgs, addChatMsg } = require('./station-controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getStations)
router.get('/:id/', getStation)
router.post('/', addStation)
router.put('/', updateStation)
router.get('/chat/:id', getChatMsgs)
router.post('/chat/:id', addChatMsg)
router.delete('/:id', deleteStation)

module.exports = router