# The flow of NextAuth

1. OAuth first time login(no other OAuths and Email signup before) : callbacksSignIn(NextAuth Callbacks) > Insert User(Default NextAuth DB operation) > createUser(NextAuth Event) > Insert Account(Default NextAuth DB operation) > linkAccount(NextAuth Event) > Insert Session(Default NextAuth DB operation) > signIn(NextAuth Event)

2. OAuth login after signed up : callbacksSignIn(NextAuth Callbacks) > Insert Session(Default NextAuth DB operation) > signIn(NextAuth Event)

3. OAuth login after other OAuths with the same email signed up : callbacksSignIn(NextAuth Callbacks) > Error(OAuthAccountNotLinked)

4. Email login after other OAuths with the same email signed up: callbacksSignIn(NextAuth Callbacks) > Insert verification_tokens(Default NextAuth DB operation) > Delete verification_tokens(Default NextAuth DB operation)
   callbacksSignIn(NextAuth Callbacks) > Update User(NextAuth Event) > updateUser(NextAuth Callbacks) > Insert Session(Default NextAuth DB operation) > signIn(NextAuth Event)

5. Email login without other OAuths with the same email signed up: callbacksSignIn(NextAuth Callbacks) > Insert verification_tokens(Default NextAuth DB operation) > Delete verification_tokens(Default NextAuth DB operation)
   callbacksSignIn(NextAuth Callbacks) > Create User(Default NextAuth DB operation) > createUser(NextAuth Event) > Insert Session(Default NextAuth DB operation) > signIn(NextAuth Event)

6. OAuth first time login after email signed up: callbacksSignIn(NextAuth Callbacks) > Error(OAuthAccountNotLinked)

To solve email linking problem, we need another table that store actual user(member, customer... what ever you call them) and its information. The reason for the extra table is that my approach is to trick NextAuth by modifyinng those three tables(users, sessions and accounts) since every user login, we always delete the user with the same email to avoid error.
