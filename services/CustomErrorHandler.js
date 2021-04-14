class CustomErrorHandler extends Error {

    constructor(status, msg){
        super();
        this.status = status;
        this.message = msg;
    }

    static alreadyExist(message){
        return new CustomErrorHandler(409, message)
    }

    static wrongCredentials(message = "UserName And Password Is Rung"){
        return new CustomErrorHandler(409, message)
    }

    static auth(message = "unAuthorized"){
        return new CustomErrorHandler(409, message)
    }

    static notFound(message = "404 Not Found"){
        return new CustomErrorHandler(404, message)
    }
}

export default CustomErrorHandler