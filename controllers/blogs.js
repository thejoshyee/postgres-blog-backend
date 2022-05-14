const router = require('express').Router()
// require('express-async-errors');

const { Blog } = require('../models')


router.get('/', async (req, res) => {
  const blogs = await Blog.findAll()
  res.json(blogs)
})


const blogFinder = async (req, res, next) => {
    req.blog = await Blog.findByPk(req.params.id)
    next()
  }
  
router.post('/', async (req, res) => {
    try {
      const blog = await Blog.create(req.body)
      return res.json(blog)
    } catch (error) {
      return res.status(400).json({ error })
    }
  })
  

router.get('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
      res.json(req.blog)
    } else {
      res.status(404).end()
    }
  })


router.delete('/:id', blogFinder, async (req, res) => {
    if (req.blog) {
        await req.blog.destroy()
    }
    res.status(204).end()
  })


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
