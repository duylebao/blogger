## Blogger

```
The project consists of a REST server, a persistent layer to store ORM: user, blog, and post.
The terminology of blog and post may be different than what you are accustom to.  The post
in this case is the user's idea's or topic of discussions.  The blog is actually the comments
from other users on the top (post).  This is an end to end application, meaning from the backend,
the middle tier (passport), to the front end (using ejs template).  The application also implement
session aware authentication for users.  Validations on creation of user is enforce.  A user can
create/update/delete his/her own posts.  The user can comment (blog) on any other users post if he/she
is logged in.

```

Time spent: `13 hours`


### Features

#### Required

- [x] User can Signup, Login and Logout with input validation
- [x] Session and user accounts are persisted in a data store
- [x] User can create and edit a blog post
- [x] User can view blog posts with details on their Profile
- [x] User can view anyone's blog with posts at the specified url
- [x] User can comments on their blog posts on their Profile
- [x] Logged In users can comment on any blog post
- [x] Comments are viewable at the bottom of the associated blog post


#### Starting the application

```
npm install
npm start
```

#### Database

```
The application require mongo db to install.  The application will store data in the demo database.
As data gets created, collections of users, posts, and blogs will be created.

```

####Usage

```

    1. Go to http://127.0.0.1:8000, this should take you to a landing page

    2. Sign in: enter user anme and password for authentication

    3. Sign up: enter in required fields
        1. username (alphanumeric only)
        2. email
        3. password ( must be at least 4 character, must have a digit, a capital letter)

        Optional field
        4. blog name
        5. blog description


    4. Blog button from landing page: view all blogs.  This blog page can be viewed by non
       authenticated user.  It will provide a link where the user can click on to log in and it
       will take the user back to the blog that the user wants to comment on.

    5. User Profile: Once logged in, the application will route you to the profile page unless
       you are logged in from the blog page.  The user profile page consists of all of the current
       user's posts.  The user has the option to delete or edit a posts. In addition, it will list 
       all of the comments/feedback (blogs) that are post on his/her posts.  Each comment has a link
       to take the user straight into the post discussion thread.
    
    6. Post: From the profile page, one can create a new post.  Once created, it will take you back to
       the profile page.  

    7. Log out: From the profile page, a user can logged out.

```


### Walkthrough
![](walkthrough.gif)
