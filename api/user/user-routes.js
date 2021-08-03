const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth.middleware')
const { getUser, getUsers, updateUser,  } = require('./user-controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getUsers)
router.get('/:id', requireAuth, getUser)
router.put('/:id', requireAuth, updateUser)
// router.put('/song/:userId', requireAuth, likedSong)
// router.put('/station/:userId', requireAuth, likedStation)

// router.put('/:id',  requireAuth, updateUser)
// router.delete('/:id', requireAuth, requireAdmin, deleteUser)
// router.delete('/:id', requireAuth, deleteUser)
// router.post('/', addUser, requireAuth, requireAdmin);

module.exports = router