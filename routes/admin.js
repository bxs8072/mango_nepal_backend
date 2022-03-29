const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");

const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");

const adminController = require("../controllers/adminController");
const blogController = require("../controllers/blogController");
const profileController = require("../controllers/profileController");
const professionalController = require("../controllers/professionalController");
const businessController = require("../controllers/businessController");
const resourcesController = require("../controllers/resourcesController");
const userController = require("../controllers/userController");
const testimonialController = require("../controllers/testimonialController");
const keyValueController = require("../controllers/keyValueController");

// Authentication Resources
router.post("/login", catchErrors(adminController.login));
router.get("/users", admin, catchErrors(adminController.getAllUser));
router.get("/search_users", admin, catchErrors(adminController.searchUser));
router.get("/user/:user", admin, catchErrors(adminController.getUserById));
router.patch("/profile/:id", admin, catchErrors(profileController.updateByAdmin));

// Blog Resources
router.post("/blog", admin, catchErrors(blogController.store));
router.get("/blog/:id", admin, catchErrors(blogController.readById));
router.patch("/blog/:id", admin, catchErrors(blogController.update));
router.delete("/blog/:id", admin, catchErrors(blogController.delete));
router.post("/blog/pin/:id", admin, catchErrors(blogController.pinBlog));

//professional resource
router.get("/professional", admin, catchErrors(professionalController.read));
router.patch("/professional/:id", admin, catchErrors(professionalController.update));
router.delete("/professional/:id", admin, catchErrors(professionalController.delete));

//professional resource
router.get("/business", admin, catchErrors(businessController.read));
router.patch("/business/:id", admin, catchErrors(businessController.update));
router.delete("/business/:id", admin, catchErrors(businessController.delete));

//professional resource
router.get("/resource", admin, catchErrors(resourcesController.read));
router.patch("/resource/:id", admin, catchErrors(resourcesController.update));
router.delete("/resource/:id", admin, catchErrors(resourcesController.delete));

//user resource
router.delete("/user/:id", admin, catchErrors(userController.deleteAdmin));

// Testimonial Controller
router.get("/testimonial", admin, catchErrors(testimonialController.read));
router.post("/testimonial", admin, catchErrors(testimonialController.store));
router.patch("/testimonial/:id", admin, catchErrors(testimonialController.update));
router.delete("/testimonial/:id", admin, catchErrors(testimonialController.delete));

// Key value controleer
router.get("/key", admin, catchErrors(keyValueController.read)); //?key=x
router.post("/key", admin, catchErrors(keyValueController.store));

module.exports = router;
