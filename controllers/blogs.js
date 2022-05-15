const router = require('express').Router()
require('express-async-errors')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')

const { Blog, User } = require('../models')
const { SECRET } = require('../util/config')

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.search) {
    where.content = {
      [Op.substring]: req.query.search
    }
  }

  const blogs = await Blog.findAll({ 
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where
  })

  res.json(blogs)
})

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      console.log(authorization.substring(7))
      console.log(SECRET)
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch (error) {
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }

  next()
}


router.post('/',tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id)
    const blog = await Blog.create({...req.body, userId: user.id, date: new Date()})
    res.json(blog)
  } catch(error) {
    return res.status(400).json({ error })
  }
})


const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
  }
  


router.get('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
      res.json(req.blog)
    } else {
      res.status(404).end()
    }
  })


  router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
    if (req.blog) {
      console.log(req.blog.toJSON())
      const user = await User.findByPk(req.decodedToken.id)
      if (req.blog.userId !== user.id) {
        return res.status(401).json({ error: 'token missing or invalid' });
      }
      await req.blog.destroy()
    }
    res.status(204).end()
  })

  // router.delete('/:id', blogFinder, async (req, res) => {
  //   if (req.blog) {
  //       await req.blog.destroy()
  //   }
  //   res.status(204).end()
  // })



router.put('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
        req.blog.likes = req.body.likes
        await req.blog.save()
        res.json(req.blog)
    } else {
        res.status(404).end()
    }
  })


  module.exports = router
