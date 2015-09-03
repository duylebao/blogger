let mongoose = require('mongoose');
let nodeify = require('nodeify');
let crypto = require('crypto');

let UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.methods.generateHash = async function(password){
    // crypto.pbkdf2(password,'salt',4092,32,'sha256', function(err, key){
    //     if (!err){
    //         console.log(key.toString('hex'));
    //     }
    // });
    // use bcrypt to call: bcrypt.promise.hash(password, 8);
    return await (password + '1234');
};

UserSchema.methods.validatePassword = async function(password){
    // use bcrypt to call: bcrypt.promise.compare(password, this.password)
    return await password === this.password;
};

UserSchema.pre('save', function(callback){
    nodeify(async () => {
        if (!this.isModified('password')){
            return callback;
        }
        this.password = await this.generateHash(this.password);   

    }(), callback);
});

UserSchema.path('password').validate( (pwd) =>{
    return pwd.length >= 4 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd);
});

UserSchema.methods.getUserByUsername = async function (username){
    return await this.model('User').findOne( {username: new RegExp('^'+username+'$', "i") } );
}

UserSchema.methods.getUserByUsernameOrEmail = async function (username, email){
    let query = 
    {
        $or:[
            {username: new RegExp('^'+username+'$', "i")},
            {email: new RegExp('^'+email+'$', "i")}
        ]
    };
    return await this.model('User').findOne( query );
}


UserSchema.path('username').validate(function(username, callback) {
    return this.model('User').findOne( {username: new RegExp('^'+username+'$', "i") } , "username", function (err, user) { 
        callback(user == null);
    });
}, "Username already exist");

module.exports = mongoose.model('User', UserSchema);
