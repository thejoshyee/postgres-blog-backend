const router = require('express').Router()

const { User, Blog } = require('../models')

const userFinder = async (req, res, next) => {
  req.user = await User.findByPk(req.params.username);
  next();
};

router.get('/', async (req, res) => {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })
  res.json(users)
})

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body)
    res.json(user)
  } catch(error) {
    return res.status(400).json({ error })
  }
})

router.put('/:username', userFinder, async (req, res) => {
  const user = req.user
  if (user) {
    if (!req.body.username) {
      return res.status(400).json({
        error: "username is missing",
      })
    }
    user.likes = req.body.username
    await user.save()
    console.log(
      `updated and saved successfully: ${JSON.stringify(user, null, 2)}`
    )
    res.json(user)
  } else {
    res.status(404).end()
  }
})

router.get('/:id', async (req, res) => {
  const where = {};
  if (req.query.read) {
    where.read = req.query.read;
  }

  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: [''] },
    include: [
      {
        model: Blog,
        attributes: { exclude: ['userId'] }
      },
      {
        model: Blog,
        as: 'markedBlogs',
        attributes: { exclude: ['userId'] },
        through: {
          attributes: ['id', 'read'],
          where
        },
      },
    ]
  })
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})


module.exports = router