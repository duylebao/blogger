let mongoose = require('mongoose');
let User = require('./user');


mongoose.connect('mongodb://localhost:27017/authenticator');

let user = new User();
user.username = 'dle';
user.email = 'dle4@walmart.com';
user.password = 'test5D';


async function createUser(u){
    return await u.save();
};

let promise = createUser(user);
promise
    .then(function(user){
        console.log('user', user);
        let val = user.validatePassword('test5D1234');
        val.then( function(matched){
            console.log('matched', matched);
        });
    })
    .catch(function(err){
        console.log('err',err);
    });

// user.save(function (err, u) {
//     console.log('saving');
//     if (err){
//         return console.error(err);
//     }
//     console.log(u);
// });

// User.findOne({email: 'dle@walmart.com'}, function(err, user){
//     if (err){
//         console.log('error',err);
//     }
//     if (user){
//         console.log('finding');
//         console.log(user);
//         user.password = 'newpassword';
//         user.save(function(err, u){
//             if (err){
//                 console.log('update err',err);
//             }else{
//                 console.log('update success', u);
//             }
//             mongoose.connection.close();
//         });
//     }
// })

// User.find({}, function(err, users){
//     if (err){
//         console.log('error',err);
//     }
//     console.log('finding all');
//     users.map( (u) => {
//         console.log(u);
//     });
// })

// async function getUser(email){
//     return await User.findOne({email});
// }

// async function getAllUsers(){
//     return await User.find({});
// }

// async function getUsersByQuery(query){
//     return await User.find( query );
// }

// let u = getUser('dle4@walmart.com');
// u.then( (uu) =>{
//     console.log('uu', uu);
// });

// let all = getAllUsers();
// all.then( (uu) =>{
//     console.log('uu', uu);
// });

// let queryOrUser = getUsersByQuery( {
//     $or:[
//         {email: 'dle@walmart.com'},
//         {email: 'dle2@walmart.com'}
//     ]
// });

// queryOrUser.then( (uu) =>{
//     console.log('uu', uu);
// });

// let queryAndUser = getUsersByQuery(
//     {
//         email: 'dle@walmart.com',
//         password: 'newpassword'
//     });

// queryAndUser.then( (uu) =>{
//     console.log('uu', uu);
// });
