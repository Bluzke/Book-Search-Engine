const typeDefs = `

# User Type
type User {
_id: ID
username: String
email: String
bookCount: Int
savedBooks: [Book]!
}

# Book Type
type Book {
bookId: ID
authors: [String]!
description: String
title: String
image: String
link: String
}

# Auth Type
type Auth {
token: String
user: User
}

# BookInput for saveBook
input BookInput {
bookId: ID!
authors: [String]!
description: String!
title: String!
image: String
link: String

}

# Query Type
type Query {
me: User
}

# Mutation Type
type Mutation {
login(email: String!, password: String!): Auth
addUser(username: String!, email: String!, password: String!): Auth
saveBook(bookInput: BookInput!): User
removeBook(bookId: ID!): User
}

`;

export default typeDefs;