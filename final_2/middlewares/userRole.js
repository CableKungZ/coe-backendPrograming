

const isAdmin = (req,res,next) => {
    const user = req.user
    if(user.role == "admin"){
        next();
    }else{
        return res.status(403).send({
            message: "Forbidden: Admin role required."
          });
    }
}

const isUser = (req,res,next) => {
    const user = req.user
    if(user.role == "user"){
        next();
    }else{
        return res.status(403).send({
            message: "Forbidden: User role only."
          });
    }
}

const UserOrAdmin = (req,res,next) => {
    const user = req.user
    if(user.role == "admin" || user.role == "user"){
        next();
    }else{
        return res.status(403).send({
            message: "Forbidden: Admin or User role required."
          });
    }
}

module.exports = {
    isAdmin,
    UserOrAdmin,
    isUser
}