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
}

export default CustomErrorHandler