# The flow of NextAuth

1. For the first time OAuth login (no other OAuths and Email signed up before), the process is: callbacksSignIn (NextAuth Callbacks) > Insert User (Default NextAuth DB operation) > createUser (NextAuth Event) > Insert Account (Default NextAuth DB operation) > linkAccount (NextAuth Event) > Insert Session (Default NextAuth DB operation) > signIn (NextAuth Event).

2. For OAuth login after sign-up, the process is: callbacksSignIn (NextAuth Callbacks) > Insert Session (Default NextAuth DB operation) > signIn (NextAuth Event).

3. For OAuth login after other OAuths with the same email signed up, the process is: callbacksSignIn (NextAuth Callbacks) > Error (OAuthAccountNotLinked).

4. For email login after other OAuths with the same email signed up, the process is: callbacksSignIn (NextAuth Callbacks) > Insert verification_tokens (Default NextAuth DB operation) > Delete verification_tokens (Default NextAuth DB operation) > callbacksSignIn (NextAuth Callbacks) > Update User (NextAuth Event) > updateUser (NextAuth Callbacks) > Insert Session (Default NextAuth DB operation) > signIn (NextAuth Event).

5. For email login without other OAuths with the same email signed up, the process is: callbacksSignIn (NextAuth Callbacks) > Insert verification_tokens (Default NextAuth DB operation) > Delete verification_tokens (Default NextAuth DB operation) > callbacksSignIn (NextAuth Callbacks) > Create User (Default NextAuth DB operation) > createUser (NextAuth Event) > Insert Session (Default NextAuth DB operation) > signIn (NextAuth Event).

6. For OAuth first time login after email sign-up, the process is: callbacksSignIn (NextAuth Callbacks) > Error (OAuthAccountNotLinked).

To solve the email linking problem, we need another table that stores the actual user (member, customer, etc. whatever you call them) and its information. The reason for the extra table is that my approach is to trick NextAuth by modifying those three tables (users, sessions, and accounts). When every user logs in, we always delete the user with the same email to avoid error.
