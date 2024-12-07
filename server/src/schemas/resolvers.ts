import models from '../models/index.js';
const User = models.User;
import { signToken, AuthenticationError } from '../utils/auth.js'; 

// Define types for the arguments
interface AddUserArgs {
  input:{
    username: string;
    email: string;
    password: string;
  }
}

interface LoginUserArgs {
    email?: string;
    password: string;
    username?: string;
  }

interface UserArgs {
  username: string;
}

interface SaveBookArgs {
    input: {
      bookId: string;
      description: string;
    };
  }

  interface RemoveBookArgs {
    userId: string
    bookId: string;
  }
  

  const resolvers = {
    Query: {
      users: async () => {
        return User.find();
      },
      user: async (_parent: any, { username }: UserArgs) => {
        return User.findOne({ username });
      },
      // Query to get the logged-in user's data
      me: async (_parent: any, _args: any, context: any) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id });
        }
        throw new AuthenticationError('You must be logged in!');
      },
    },
  Mutation: {
    addUser: async (_parent: any, { input }: AddUserArgs) => {
      // Create a new user with the provided username, email, and password
      const user = await User.create({ ...input });
    
      // Sign a token with the user's information
      const token = signToken(user.username, user.email, user._id);
    
      // Return the token and the user
      return { token, user };
    },
    
    login: async (_parent: any, { email, password }: LoginUserArgs) => {
      // Find a user with the provided email
      const user = await User.findOne({ email });
    
      // If no user is found, throw an AuthenticationError
      if (!user) {
        throw new AuthenticationError('Could not authenticate user.');
      }
    
      // Check if the provided password is correct
      const correctPw = await user.isCorrectPassword(password);
    
      // If the password is incorrect, throw an AuthenticationError
      if (!correctPw) {
        throw new AuthenticationError('Could not authenticate user.');
      }
    
      // Sign a token with the user's information
      const token = signToken(user.username, user.email, user._id);
    
      // Return the token and the user
      return { token, user };
    },
    saveBook: async (_parent: any, { input }: SaveBookArgs, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in!');
      }
      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        {
          $addToSet: { savedBooks: { ...input } }, // Assuming `savedBooks` is an array in the user schema
        },
        { new: true, runValidators: true }
      );
      return updatedUser;
    },

    removeComment: async (_parent: any, { userId, bookId }: RemoveBookArgs, context: any) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: userId },
          {
            $pull: {
              comments: {
                _id: bookId,
                commentAuthor: context.user.username,
              },
            },
          },
          { new: true }
        );
      }
      throw AuthenticationError;
    },
  },
};

export default resolvers;
