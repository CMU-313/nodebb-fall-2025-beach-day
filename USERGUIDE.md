# User Guide

## Feature 1 - Bookmarking Categories:

Overview:

This feature allows you to assign a post to a category, then organize and search by these categories.

How to Use New Feature

This feature allows you to assign a post to a category, then organize and search by these categories.
Log into an account, pick a post and click on the three dots on the bottom right. Then bookmark a post. Then go to the user profile and click bookmarks. There you can see you can set a category, see what other posts you have bookmarked and their categories, make a new category, and sort through the posts by their categories. 

1. What do the tests do?

tests/post.js -

It 'should bookmark a post' and it 'should unbookmark a post'
Verify that calling apiPosts.bookmark bookmarks a post for a user and that posts.hasBookmarked returns true.
Verify that removing a bookmark from a category removes the pid from the per-category sorted set.

'should add pid to legacy user global bookmarks set when no category provided' and 'should remove pid from legacy user global bookmarks set when unbookmarking without category'

Verify adding a bookmark from a category removes the pid from the per-category sorted set for legacy posts.
Verify removing a bookmark from a category removes the pid from the per-category sorted set for legacy posts.

tests/controllers.js -

Tests: 'should allow bookmarking a post via HTTP with category' and 'should allow unbookmarking a post via HTTP with category' 

End-to-end HTTP test: ensure the controller accepts PUT to /api/v3/posts/:pid/bookmark with a category and the server persists the per-category bookmark.

2. How to Find/Run Tests

Run npx mocha tests/posts.js for post tests (runs all tests in the post.js file)
To run only the bookmark tests in post.js run: npx mocha test/post.js –grep “bookmark” –timeout 120000
And npx mocha test/controllers.js for controllers.js (runs all tests in the controller.js file)
To run only the bookmark tests in controllers.js, run: npx mocha test/controllers.js --grep "bookmark endpoints" --timeout 120000

3. How to Test Front-end?

Log in to an account
Pick a post and click on the three dots on the bottom right. Then bookmark a post. Then go to the user profile and click bookmarks. 
Make a new category using input box towards top (type something in and hit add)
Assign your post to that category (using dropdown under post)
Check that category to see if post was assigned (click the dropdown near the top, which will take you to that category to view)
Unbookmark the post to see if its been properly removed.


## Feature 2 - Endorsement:
1. How to Use and User Test the Feature

Overview:
The Endorsement feature allows moderators or administrators to highlight high-quality posts or answers so students can easily find verified information.

How to Find It:
The endorsement button appears at the bottom-right corner and looks like a thumbs-up icon.

How It Works:
If you are a moderator or admin, you can endorse a post by clicking the endorsement button. Then, you will see a success message. Similarly, you can click the button again to unendorse the post. On the contrary, a normal user will see an error message when they toggle the endorsement button. 

Testing Steps:
Regular user: Try endorsing, then you should see an error.
Moderator or Admin: Try endorsing, then the post should be successfully endorsed. 
        : Try unendorsing; the endorsement should be removed.

2. Automated Tests

Test file: test/posts/endorse.js
Test Coverage
Ensures regular users cannot endorse or unendorse.
Confirms moderators and admins can endorse posts.
Confirms moderators and admins can unendorse.
Checks endorsement data is correctly saved and removed.
These tests cover all user roles and actions related to endorsement, ensuring correct permissions, data consistency, and error handling. 


## Feature 3 - Contribution Leaderboard:

Overview: The Contribution Leaderboard is a new feature for professors or TAs to track student participation in discussions. It provides a ranked view of users based on the total number of posts and topics they have created within a specific category.

1. How to Access the Leaderboard: 

Only administrators (professors) can access the leaderboard. Here's how:
Log in to your administrator account.
Navigate to the admin dashboard.
You will find a new "Category Leaderboard" tab in the navigation menu under Manage.


It can also be accessed through the main menu on the right sidebar, underneath the new post button there is a trophy icon, if you are logged in as an administrator. This will redirect you to the same manage page as the above method above. 

2. How to Use the Leaderboard
The leaderboard is a dynamic tool that allows you to:
View a ranked list of users by their post and topic contributions.
Filter the leaderboard by category to see contributions for a specific discussion.
The leaderboard updates in real-time as new posts and topics are created.

Once you are at the leaderboard menu, just select the desired category from the category dropdown and view the leaderboard.

3. Testing:

To User Test do the following:
Log in as an administrator
Verify that the “Category Leaderboard” tab is visible in both the main sidebar and the admin dashboard.
Click the leaderboard to ensure it loads without error
Select a category from the dropdown
Verify that the users are ranked correctly based on their post and topic counts (a topic also creates a subsequent post so = 2)
Create a new post or topic in that category with a test user
Refresh the leaderboard and verify that the user count and ranking have been updated

Automated Tests:
test/leaderboard.js
- Tests correct counts of leaderboard posts for multiple users
- ensures category filters return the correct categories
- ensures pagination displays information properly
- Covers edge case of incorrect category number
test/controllers-admin.js
- Checks that the leaderboard page loads for admins
- Checks it does not load for non-admins
- Checks that a call returns the leaderboard API data to the admin view
Open API Schema - public/openapi/read.yaml & public/openapi/read/admin/manage/leaderboard.yaml
- Puts the API reference in the read openAPI file since it is a read only API
- Puts the full API Schema for leaderboard API documentation in its own file and ensures it passes OpenAPI specifications, consistent with existing Nodebb APIs
Test Sufficiency:
High Coverage: The Coveralls report shows that the overall coverage went up, no existing code lost coverage, and all of the feature’s code was covered
Core Functionality: The tests focus on the most critical parts of the new feature: the data queries, the API endpoint, and authorization. This ensures the reliability and accuracy of the leaderboard's data and that the correct users only can see it.
Schema Validation: By testing the OpenAPI schema, we ensure that the API is well-documented and that future changes will be consistent with the specification.


## Feature 4 - Default Formats for Posts:

The default formats for posts feature allows students, professors and TA’s to save time structuring their topic responses. Now, the users have the ability to select the format they want from the dropdown menu and it will append to their text box.

HOW TO: The user will select a category where they want to add a topic or click respond to someone’s message.
In the dropdown menu “Format”, select which format you would like to import
The format that was clicked on will import into the text box via after two new line characters (“\n\n”)
The users can click on a new format to import multiple at the same time.
