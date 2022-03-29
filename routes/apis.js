const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const user = require("../middlewares/user");

const userController = require("../controllers/userController");
const resourcesController = require("../controllers/resourcesController");
const blogController = require("../controllers/blogController");
const commentController = require("../controllers/commentController");
const fileController = require("../controllers/fileController");
const profileController = require("../controllers/profileController");
const statisticsController = require("../controllers/statisticsController");
const professionalController = require("../controllers/professionalController");
const businessController = require("../controllers/businessController");
const chatController = require("../controllers/chatController");



//Chat Route
const Chat = require("../models/Chat");
const User = require("../models/User");
const Converstation = require("../models/Converstation");

//POST user data
router.post('/userdata', (req, res, next) => {
    User.findById(req.body.id)
        .then((result) => {
            if (result) {
                result.password = ""
                res.json(result)
            } else {
                res.json({
                    message: "No result found!!"
                })
            }
        })

})

//GET ===> Fetch all my chat list
router.get('/fetch/conversation', auth, async (req, res, next) => {
    const id = req.payload.id

    const result = await Converstation.find({ user: id })
        .populate('hero')
        .populate('message.sender')
    const datas = []

    result.forEach((data) => {
        datas.push({
            hero: data.hero, message: {
                sender: data.message.sender,
                message: data.message.message
            }
        })
    })

    console.log(datas)

    res.json({
        data: datas
    })
})

//Get all the messages between two users
router.post("/chat/get", auth, async (req, res, next) => {
    const sender = req.payload.id
    const reciever = req.body.reciever
    const chat_one = await Chat.findOne({ sender: reciever, reciever: sender }).limit(100)
        .populate('messages.sender')

    if (chat_one) {
        const data = {
            message: "Message found from past!!!",
            data: chat_one,
            chatId: chat_one._id
        }
        console.log(data)

        res.json(data)
    } else {
        const chat_two = await Chat.findOne({ sender, reciever }).limit(100)
            .populate('messages.sender')

        if (chat_two) {
            const data = {
                message: "Message found from past!!!",
                data: chat_two,
                chatId: chat_two._id
            }
            console.log(chat_two)
            res.json(data)
        } else {
            const chat = new Chat({ sender, reciever }).limit(100)
                .populate('messages.sender')

            const response = await chat.save()
            const data = {
                message: "New Chat Room Created!!!",
                data: response,
                chatId: response._id
            }
            res.json(data)
        }
    }
})


// User Authentication Resources
router.post("/login", catchErrors(userController.login));
router.post("/login/google", catchErrors(userController.loginWithGoogle));
router.post("/register", catchErrors(userController.register));
router.delete("/myself", auth, catchErrors(userController.delete));

//profile controller
router.post("/education", auth, catchErrors(profileController.storeEducation));
router.get("/education", auth, catchErrors(profileController.read));
router.get("/education/mentor", auth, catchErrors(profileController.readMentor));
router.get("/education/mentee", auth, catchErrors(profileController.readMentee));
router.get("/profile", auth, catchErrors(profileController.readMyInfo));
router.patch("/profile", auth, catchErrors(profileController.update));

//Resource route
router.get("/major", auth, catchErrors(resourcesController.readMajor));
router.get("/university", auth, catchErrors(resourcesController.readUniversity));

//Blog Route
router.get("/blog/:slug", user, catchErrors(blogController.readBySlug));
router.get("/blog", catchErrors(blogController.read));
router.get("/my/blog", auth, catchErrors(blogController.readMyBlogs));
router.get("/my/blog/:id", catchErrors(blogController.readById));
router.patch("/my/blog/:id", auth, catchErrors(blogController.updateMyBlog));
router.post("/like/:slug", auth, catchErrors(blogController.doLike));
router.post("/blog", auth, catchErrors(blogController.store));
router.delete("/my_blog/:id", auth, catchErrors(blogController.deleteMyBlog));
router.get("/homepage", catchErrors(blogController.getHome));
router.get("/blog_user", catchErrors(blogController.readForUser));

//Comment Route Resources

// Read comments for website, only active status comment is returned
router.get("/comment/:slug", user, catchErrors(commentController.read));

// Read comment for admin pannel, all status comment is returned
router.get("/admin/comment/:slug", admin, catchErrors(commentController.readAdmin));

// Add comment api
router.post("/comment/:slug", auth, catchErrors(commentController.store));
router.delete("/comment/:id", auth, catchErrors(commentController.delete));

// From admin pannel we can Delete/Update the comment through soft delete mechanism as only active status is shown to user
router.patch("/comment/status/:blog", admin, catchErrors(commentController.updateStatus));

//File upload route
router.post("/upload", auth, catchErrors(fileController.store));
router.get("/stats/level", catchErrors(statisticsController.byLevel));
router.get("/stats/age", catchErrors(statisticsController.byAge));
router.get("/stats/state", catchErrors(statisticsController.byState));
router.get("/stats/hometown", catchErrors(statisticsController.byHometown));

// professional routes
router.post("/professional", auth, catchErrors(professionalController.store));
router.get("/professional", catchErrors(professionalController.readByType)); // ?type=xyz

// business routes
router.post("/business", auth, catchErrors(businessController.store));
router.get("/business", catchErrors(businessController.readByType)); // ?type=xyz

// Resource routes
router.post("/resource", auth, catchErrors(resourcesController.store));
router.get("/resource", user, catchErrors(resourcesController.read));
router.delete("/resource/:id", auth, catchErrors(resourcesController.delete));

// Reset Password
router.post("/init_reset_password", catchErrors(userController.resetPasswordInit));
router.post("/reset_password", catchErrors(userController.resetPassword));
router.post("/change_password", auth, catchErrors(userController.changePassword));
router.post("/activate_account", catchErrors(userController.activateAccount));
router.post("/user_profile/:user", auth, catchErrors(userController.getUserByIdForUser));
router.post("/contact_us", catchErrors(userController.contactUs));

module.exports = router;
