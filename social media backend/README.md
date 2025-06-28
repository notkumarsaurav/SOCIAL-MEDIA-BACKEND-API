# Social Media Backend

A Node.js backend API for a social media platform with user authentication, content creation, and social features.


🐛 Bugs Identified and Fixed
This project involved extending and debugging a Node.js/Express social media API. Below is a record of the key bugs encountered during development, with their solutions:

1️⃣ Wrong function reference (likePost not a function)
Error log:

vbnet
Copy code
TypeError: likePost is not a function
    at like (controllers/posts.js:237:11)
✅ Diagnosis:
Controller was importing likePost which was not exported in the model.

✅ Fix:
Implemented and exported likePost and unlikePost in models/post.js:

js
Copy code
module.exports = {
  ...
  likePost,
  unlikePost,
};
2️⃣ db is not defined
Error log:

vbnet
Copy code
ReferenceError: db is not defined
    at likePost (models/post.js:123:3)
✅ Diagnosis:
In model, the database query used db.query but db was not imported.

✅ Fix:
Imported the correct utility:

js
Copy code
const { query } = require("../utils/database");
and replaced db.query with query.

3️⃣ Route error for creating comments
Error log:

json
Copy code
{ "error": "Route not found" }
✅ Diagnosis:
Route in Express router was incorrectly set to / instead of including :post_id.

✅ Fix:
Updated routes/comments.js:

js
Copy code
router.post("/post/:post_id", authenticateToken, createComment);
4️⃣ Joi validation error: wrong field
Error log:

arduino
Copy code
"Comment text is required"
✅ Diagnosis:
Validation schema expected content but controller destructured text.

✅ Fix:
Aligned naming across schema and controller:

js
Copy code
const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});
And in controller:

js
Copy code
const { content } = req.validatedData;
5️⃣ SQL error: NULL in content column
Error log:

sql
Copy code
error: null value in column "content" of relation "comments" violates not-null constraint
✅ Diagnosis:
Wrong field passed in insert query—controller was sending text instead of content.

✅ Fix:
Consistently used content in controller's model call:

js
Copy code
await createCommentModel({
  post_id,
  user_id: userId,
  content,
});
6️⃣ Route not found for validateRequest
Error log:

lua
Copy code
Unhandled error: Cannot read properties of undefined (reading 'validate')
✅ Diagnosis:
Validation middleware was missing import in comments router.

✅ Fix:
Added:

js
Copy code
const { validateRequest, createCommentSchema } = require("../utils/validation");
And attached:

js
Copy code
validateRequest(createCommentSchema)
7️⃣ Update comment: validation error
Error log:

javascript
Copy code
TypeError: Cannot destructure property 'content' of 'req.validatedData' as it is undefined.
✅ Diagnosis:
Update route was missing validation middleware.

✅ Fix:
Added validation to update route in comments router:

js
Copy code
router.put("/:comment_id", authenticateToken, validateRequest(updateCommentSchema), update);
8️⃣ SQL Error in updateComment
Error log:

pgsql
Copy code
invalid input syntax for type integer: "edited comment text"
✅ Diagnosis:
In model, parameter order was wrong. Passing content where user_id was expected.

Original buggy code:

js
Copy code
await updateComment(comment_id, content, userId);
✅ Fix:

js
Copy code
await updateComment(comment_id, userId, content);
and SQL in model matched order:

sql
Copy code
UPDATE comments SET content = $1 WHERE id = $2 AND user_id = $3
9️⃣ user_id not defined
Error log:

vbnet
Copy code
ReferenceError: user_id is not defined
✅ Diagnosis:
Controller forgot to use userId consistent with the variable naming.

✅ Fix:
Changed all user_id references to userId.

✅ Result
After these fixes:

Like / Unlike post worked.

Create Comment worked.

Update Comment worked.

Delete Comment worked.

Get Comments for Post worked.

All routes passed testing in Postman.

✅ How I Used AI for Debugging
I used ChatGPT to analyze stack traces and error logs.

Asked for advice on structuring controller and model code.

Generated sample validation schemas.

Reviewed and improved SQL query parameter ordering.

Got guidance for fixing Express route definitions.

📌 Notes
This README section explains exactly what was broken and how I fixed it.

It also demonstrates my problem-solving approach