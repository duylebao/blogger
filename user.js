let mongoose = require('mongoose');
let nodeify = require('nodeify');

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

module.exports = mongoose.model('User', UserSchema);
