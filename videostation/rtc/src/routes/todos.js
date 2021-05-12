

const Router = require('express-promise-router')
const router = new Router()


router.get('/user/:id', async (req, res) => {
    try {
         console.log('req.params.id',req.params.id)
        const user = await global.Numbers.find(us => us.number === req.params.id)
        res.render('ind', { User: user, numbers: global.Numbers.filter(n => n.number !== user.number) })

    } catch (err) {
        console.error(err)
        res.redirect('/login')
    }
})



router.get('/',  (req, res) => {
    if (req.secure){
    res.render('login')
    }else {
        res.redirect('https://'+req.hostname+req.url);
    }
})

router.get('/exit/:id', (req, res) => {
    try{
        // db.updateActive(false,req.params.id)
    }catch(err){
        console.log(err)
    }
    res.render('login')
})
router.get('/login',  (req, res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {

    try {
        const user = await global.Numbers.find(user => user.number === req.body.number)
        res.redirect(`/user/${user.number}`)
    } catch(err){
        console.error(err)
        res.redirect('/login')
    }

})

module.exports = router
